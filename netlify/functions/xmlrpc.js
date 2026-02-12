// MetaWeblog XML-RPC endpoint for Netlify Functions (MarsEdit)

import {
  ghGet, ghPut, slugify, formatDate, buildPermalink,
  generatePreview, dumpYaml, buildMarkdownFile, buildPageFile, buildBookFile,
  SITE_URL, POSTS_DIR, PAGES_DIR, BOOKS_DIR, UPLOADS_DIR,
  POST_STANDARD_KEYS, PAGE_STANDARD_KEYS, BOOK_STANDARD_KEYS,
} from "./lib/github.js";

const XMLRPC_USERNAME = process.env.XMLRPC_USERNAME;
const XMLRPC_PASSWORD = process.env.XMLRPC_PASSWORD;

// --- XML-RPC parser/serializer ---

function xmlEscape(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function xmlUnescape(str) {
  return String(str).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function parseValue(xml) {
  let m;
  // Determine the first child type tag to dispatch correctly —
  // checking xml.match(/<struct>/) would match nested structs inside arrays
  const typeMatch = xml.match(/<value[^>]*>\s*<(\w+)/);
  const firstType = typeMatch ? typeMatch[1] : "";
  if (firstType === "struct") return parseStruct(xml);
  if (firstType === "array") return parseArray(xml);
  m = xml.match(/<string>([\s\S]*?)<\/string>/);
  if (m) return xmlUnescape(m[1]);
  m = xml.match(/<int>([\s\S]*?)<\/int>/) || xml.match(/<i4>([\s\S]*?)<\/i4>/);
  if (m) return parseInt(m[1], 10);
  m = xml.match(/<boolean>([\s\S]*?)<\/boolean>/);
  if (m) return m[1] === "1";
  m = xml.match(/<double>([\s\S]*?)<\/double>/);
  if (m) return parseFloat(m[1]);
  m = xml.match(/<dateTime\.iso8601>([\s\S]*?)<\/dateTime\.iso8601>/);
  if (m) return new Date(m[1]);
  m = xml.match(/<base64>([\s\S]*?)<\/base64>/);
  if (m) return Buffer.from(m[1], "base64");
  if (xml.match(/<nil\s*\/>/)) return null;
  m = xml.match(/<value>([\s\S]*?)<\/value>/);
  if (m && !m[1].match(/^\s*</)) return xmlUnescape(m[1]);
  return "";
}

// Extract top-level XML chunks by tag, respecting nesting depth
function extractTopLevel(xml, tag) {
  const open = `<${tag}`;
  const close = `</${tag}>`;
  const chunks = [];
  let i = 0;
  while (i < xml.length) {
    const start = xml.indexOf(open, i);
    if (start === -1) break;
    let depth = 1;
    let j = start + open.length;
    while (j < xml.length) {
      const nextOpen = xml.indexOf(open, j);
      const nextClose = xml.indexOf(close, j);
      if (nextClose === -1) { j = xml.length; break; }
      if (nextOpen !== -1 && nextOpen < nextClose) {
        depth++;
        j = nextOpen + open.length;
      } else {
        depth--;
        if (depth === 0) {
          chunks.push(xml.slice(start, nextClose + close.length));
          i = nextClose + close.length;
          break;
        }
        j = nextClose + close.length;
      }
    }
    if (depth > 0) break;
  }
  return chunks;
}

function parseStruct(xml) {
  const result = {};
  for (const memberXml of extractTopLevel(xml, "member")) {
    const nameMatch = memberXml.match(/<name>([\s\S]*?)<\/name>/);
    if (!nameMatch) continue;
    const valChunks = extractTopLevel(memberXml, "value");
    if (valChunks.length) {
      result[nameMatch[1]] = parseValue(valChunks[0]);
    }
  }
  return result;
}

function parseArray(xml) {
  const dataMatch = xml.match(/<data>([\s\S]*)<\/data>/);
  if (!dataMatch) return [];
  return extractTopLevel(dataMatch[1], "value").map((v) => parseValue(v));
}

function parseXmlRpc(body) {
  const methodMatch = body.match(/<methodName>([\s\S]*?)<\/methodName>/);
  if (!methodMatch) throw new Error("No methodName found");
  const params = [];
  const re = /<param>\s*<value>([\s\S]*?)<\/value>\s*<\/param>/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    params.push(parseValue(`<value>${m[1]}</value>`));
  }
  return { method: methodMatch[1].trim(), params };
}

function sv(val) {
  if (val === null || val === undefined) return "<value><nil/></value>";
  if (typeof val === "boolean") return `<value><boolean>${val ? 1 : 0}</boolean></value>`;
  if (typeof val === "number") {
    return Number.isInteger(val) ? `<value><int>${val}</int></value>` : `<value><double>${val}</double></value>`;
  }
  if (typeof val === "string") return `<value><string>${xmlEscape(val)}</string></value>`;
  if (val instanceof Date) {
    const iso = val.toISOString();
    const dt = iso.slice(0, 4) + iso.slice(5, 7) + iso.slice(8, 10) + "T" + iso.slice(11, 19);
    return `<value><dateTime.iso8601>${dt}</dateTime.iso8601></value>`;
  }
  if (Buffer.isBuffer(val)) return `<value><base64>${val.toString("base64")}</base64></value>`;
  if (Array.isArray(val)) return `<value><array><data>${val.map(sv).join("")}</data></array></value>`;
  if (typeof val === "object") {
    return `<value><struct>${Object.entries(val).map(([k, v]) => `<member><name>${xmlEscape(k)}</name>${sv(v)}</member>`).join("")}</struct></value>`;
  }
  return `<value><string>${xmlEscape(String(val))}</string></value>`;
}

function xmlOk(result) {
  return `<?xml version="1.0"?><methodResponse><params><param>${sv(result)}</param></params></methodResponse>`;
}

function xmlFault(code, msg) {
  return `<?xml version="1.0"?><methodResponse><fault><value><struct><member><name>faultCode</name><value><int>${code}</int></value></member><member><name>faultString</name><value><string>${xmlEscape(msg)}</string></value></member></struct></value></fault></methodResponse>`;
}

// --- Helpers ---

function authenticate(u, p) {
  return u === XMLRPC_USERNAME && p === XMLRPC_PASSWORD;
}

function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { fm: {}, body: raw };
  const fm = {};
  match[1].split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx > 0) fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  });
  return { fm, body: match[2].trim() };
}

function buildCustomFields(fm, standardKeys) {
  let id = 1;
  return Object.entries(fm)
    .filter(([key]) => !standardKeys.has(key))
    .map(([key, value]) => ({ id: String(id++), key, value: String(value) }));
}

function parsePost(postId, raw) {
  const { fm, body } = parseFrontmatter(raw);
  if (!fm.title && !body) return { postid: postId, title: postId, description: raw, dateCreated: new Date(), link: "" };
  const postDate = fm.date ? new Date(fm.date) : new Date();
  const slug = postId.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return {
    postid: postId,
    title: fm.title || "",
    description: body,
    dateCreated: postDate,
    link: `${SITE_URL}${buildPermalink(postDate, fm.title, slug)}`,
    mt_excerpt: fm.preview || "",
    mt_keywords: "",
    post_status: fm.draft === "true" ? "draft" : "publish",
    custom_fields: buildCustomFields(fm, POST_STANDARD_KEYS),
  };
}

// WordPress wp.getPosts/getPost format for pages
function parsePageWp(pageId, raw) {
  const { fm, body } = parseFrontmatter(raw);
  const pageDate = fm.date ? new Date(fm.date) : new Date();
  const link = fm.permalink ? `${SITE_URL}${fm.permalink.replace(/index\.html$/, "")}` : `${SITE_URL}/${pageId}/`;
  return {
    post_id: pageId,
    post_title: fm.title || "",
    post_content: body,
    post_date: pageDate,
    post_date_gmt: pageDate,
    post_modified: pageDate,
    post_modified_gmt: pageDate,
    post_status: fm.draft === "true" ? "draft" : "publish",
    post_type: "page",
    post_name: pageId,
    post_author: "1",
    post_excerpt: "",
    link,
    terms: [],
    custom_fields: buildCustomFields(fm, PAGE_STANDARD_KEYS),
  };
}

// WordPress wp.getPosts/getPost format (different field names from MetaWeblog)
function parsePostWp(postId, raw) {
  const { fm, body } = parseFrontmatter(raw);
  const postDate = fm.date ? new Date(fm.date) : new Date();
  const slug = postId.replace(/^\d{4}-\d{2}-\d{2}-/, "");
  return {
    post_id: postId,
    post_title: fm.title || "",
    post_content: body,
    post_date: postDate,
    post_date_gmt: postDate,
    post_modified: postDate,
    post_modified_gmt: postDate,
    post_status: fm.draft === "true" ? "draft" : "publish",
    post_type: "post",
    post_name: slug,
    post_author: "1",
    post_excerpt: fm.preview || "",
    link: `${SITE_URL}${buildPermalink(postDate, fm.title, slug)}`,
    terms: [],
    custom_fields: buildCustomFields(fm, POST_STANDARD_KEYS),
  };
}

function parseBookWp(bookId, raw) {
  const { fm, body } = parseFrontmatter(raw);
  const bookDate = fm.date ? new Date(fm.date) : new Date();
  const link = fm.permalink ? `${SITE_URL}${fm.permalink}` : `${SITE_URL}/books/${bookId}/`;
  return {
    post_id: bookId,
    post_title: fm.title || "",
    post_content: body,
    post_date: bookDate,
    post_date_gmt: bookDate,
    post_modified: bookDate,
    post_modified_gmt: bookDate,
    post_status: fm.draft === "true" ? "draft" : "publish",
    post_type: "book",
    post_name: bookId,
    post_author: "1",
    post_excerpt: "",
    link,
    terms: [],
    custom_fields: buildCustomFields(fm, BOOK_STANDARD_KEYS),
  };
}

function parsePage(pageId, raw) {
  const { fm, body } = parseFrontmatter(raw);
  const pageDate = fm.date ? new Date(fm.date) : new Date();
  const link = fm.permalink ? `${SITE_URL}${fm.permalink.replace(/index\.html$/, "")}` : `${SITE_URL}/${pageId}/`;
  return {
    page_id: pageId,
    title: fm.title || "",
    description: body,
    dateCreated: pageDate,
    date_created_gmt: pageDate,
    link,
    permaLink: link,
    wp_slug: pageId,
    wp_author_id: "1",
    wp_author_display_name: "Philip Zastrow",
    wp_page_parent_id: 0,
    wp_page_parent_title: "",
    wp_page_order: 0,
    wp_page_template: "default",
    page_status: fm.draft === "true" ? "draft" : "publish",
    userid: "1",
    excerpt: "",
    text_more: "",
    mt_allow_comments: 0,
    mt_allow_pings: 0,
    custom_fields: buildCustomFields(fm, PAGE_STANDARD_KEYS),
  };
}

// --- MetaWeblog methods ---

async function getUsersBlogs() {
  return [{ blogid: "1", blogName: "Philip Zastrow", url: SITE_URL }];
}

async function getCategories() {
  return [];
}

async function getRecentPosts(blogId, count) {
  const listing = await ghGet(POSTS_DIR);
  const files = listing
    .filter((f) => f.name.endsWith(".md") && f.name !== "index.md")
    .sort((a, b) => b.name.localeCompare(a.name))
    .slice(0, count || 100);
  return Promise.all(
    files.map(async (f) => {
      const data = await ghGet(f.path);
      const content = Buffer.from(data.content, "base64").toString("utf8");
      return parsePost(f.name.replace(/\.md$/, ""), content);
    }),
  );
}

async function getPost(postId) {
  const data = await ghGet(`${POSTS_DIR}/${postId}.md`);
  return parsePost(postId, Buffer.from(data.content, "base64").toString("utf8"));
}

async function newPost(blogId, struct, publish) {
  const date = struct.dateCreated instanceof Date ? struct.dateCreated : struct.dateCreated ? new Date(struct.dateCreated) : new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const slug = struct.wp_slug || slugify(struct.title || `post-${Date.now()}`);
  const postId = `${yyyy}-${mm}-${dd}-${slug}`;
  const fileContent = buildMarkdownFile(struct, publish);
  await ghPut(`${POSTS_DIR}/${postId}.md`, `New post: ${struct.title || postId} (via XML-RPC)`, Buffer.from(fileContent).toString("base64"));
  return postId;
}

async function editPost(postId, struct, publish) {
  const existing = await ghGet(`${POSTS_DIR}/${postId}.md`);
  const existingContent = Buffer.from(existing.content, "base64").toString("utf8");
  const { fm: existingFm } = parseFrontmatter(existingContent);
  if (!Array.isArray(struct.custom_fields)) struct.custom_fields = [];
  const cfKeys = new Set(struct.custom_fields.map((cf) => cf.key));
  for (const [key, value] of Object.entries(existingFm)) {
    if (!POST_STANDARD_KEYS.has(key) && !cfKeys.has(key)) {
      struct.custom_fields.push({ key, value: String(value) });
    }
  }
  const fileContent = buildMarkdownFile(struct, publish);
  if (fileContent === existingContent) return true;
  await ghPut(`${POSTS_DIR}/${postId}.md`, `Update post: ${struct.title || postId} (via XML-RPC)`, Buffer.from(fileContent).toString("base64"), existing.sha);
  return true;
}

async function deletePost(postId) {
  const post = await getPost(postId);
  post.post_status = "draft";
  await editPost(postId, { ...post, description: post.description }, false);
  return true;
}

async function newMediaObject(blogId, struct) {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const safeName = (struct.name || `upload-${Date.now()}`).replace(/[^\w.-]/g, "-");
  const content = Buffer.isBuffer(struct.bits) ? struct.bits.toString("base64") : Buffer.from(struct.bits).toString("base64");
  await ghPut(`${UPLOADS_DIR}/${yyyy}/${mm}/${safeName}`, `Upload media: ${safeName} (via XML-RPC)`, content);
  return { url: `${SITE_URL}/uploads/${yyyy}/${mm}/${safeName}` };
}

// --- Page methods ---

async function getPages(blogId, count) {
  const listing = await ghGet(PAGES_DIR);
  const files = listing
    .filter((f) => f.name.endsWith(".md"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, count || 50);
  return Promise.all(
    files.map(async (f) => {
      const data = await ghGet(f.path);
      const content = Buffer.from(data.content, "base64").toString("utf8");
      return parsePage(f.name.replace(/\.md$/, ""), content);
    }),
  );
}

async function getPage(pageId) {
  const data = await ghGet(`${PAGES_DIR}/${pageId}.md`);
  return parsePage(pageId, Buffer.from(data.content, "base64").toString("utf8"));
}

async function newPage(blogId, struct, publish) {
  const slug = struct.wp_slug || slugify(struct.title || `page-${Date.now()}`);
  const fileContent = buildPageFile(struct, publish);
  await ghPut(`${PAGES_DIR}/${slug}.md`, `New page: ${struct.title || slug} (via XML-RPC)`, Buffer.from(fileContent).toString("base64"));
  return slug;
}

async function editPage(pageId, struct, publish) {
  const existing = await ghGet(`${PAGES_DIR}/${pageId}.md`);
  const existingContent = Buffer.from(existing.content, "base64").toString("utf8");
  const { fm: existingFm } = parseFrontmatter(existingContent);
  if (!Array.isArray(struct.custom_fields)) struct.custom_fields = [];
  const cfKeys = new Set(struct.custom_fields.map((cf) => cf.key));
  for (const [key, value] of Object.entries(existingFm)) {
    if (!PAGE_STANDARD_KEYS.has(key) && !cfKeys.has(key)) {
      struct.custom_fields.push({ key, value: String(value) });
    }
  }
  const fileContent = buildPageFile(struct, publish);
  if (fileContent === existingContent) return true;
  await ghPut(`${PAGES_DIR}/${pageId}.md`, `Update page: ${struct.title || pageId} (via XML-RPC)`, Buffer.from(fileContent).toString("base64"), existing.sha);
  return true;
}

async function deletePage(pageId) {
  const page = await getPage(pageId);
  page.page_status = "draft";
  await editPage(pageId, { ...page, description: page.description, custom_fields: page.custom_fields }, false);
  return true;
}

// --- Book methods ---

async function newBook(blogId, struct, publish) {
  const date = struct.dateCreated instanceof Date ? struct.dateCreated : new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const slug = slugify(struct.title || `book-${Date.now()}`);
  const bookId = `${yyyy}-${mm}-${dd}-${slug}`;
  struct._fileId = bookId;
  const fileContent = buildBookFile(struct, publish);
  await ghPut(`${BOOKS_DIR}/${bookId}.md`, `New book: ${struct.title || bookId} (via XML-RPC)`, Buffer.from(fileContent).toString("base64"));
  return bookId;
}

async function editBook(bookId, struct, publish) {
  const existing = await ghGet(`${BOOKS_DIR}/${bookId}.md`);
  const existingContent = Buffer.from(existing.content, "base64").toString("utf8");
  const { fm: existingFm } = parseFrontmatter(existingContent);
  if (existingFm.author && !struct.author) struct.author = existingFm.author;
  if (existingFm.isbn && !struct.isbn) struct.isbn = existingFm.isbn;
  if (existingFm.rating && !struct.rating) struct.rating = existingFm.rating;
  struct._fileId = bookId;
  if (!Array.isArray(struct.custom_fields)) struct.custom_fields = [];
  const cfKeys = new Set(struct.custom_fields.map((cf) => cf.key));
  for (const [key, value] of Object.entries(existingFm)) {
    if (!BOOK_STANDARD_KEYS.has(key) && !cfKeys.has(key)) {
      struct.custom_fields.push({ key, value: String(value) });
    }
  }
  const fileContent = buildBookFile(struct, publish);
  if (fileContent === existingContent) return true;
  await ghPut(`${BOOKS_DIR}/${bookId}.md`, `Update book: ${struct.title || bookId} (via XML-RPC)`, Buffer.from(fileContent).toString("base64"), existing.sha);
  return true;
}

// --- Method dispatch ---

async function dispatch(method, params) {
  switch (method) {
    case "blogger.getUsersBlogs": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return getUsersBlogs();
    }
    case "metaWeblog.getRecentPosts": {
      const [bid, u, p, n] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return getRecentPosts(bid, n);
    }
    case "metaWeblog.getPost": {
      const [pid, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      try {
        return await getPost(pid);
      } catch {
        const data = await ghGet(`${PAGES_DIR}/${pid}.md`);
        return parsePage(pid, Buffer.from(data.content, "base64").toString("utf8"));
      }
    }
    case "metaWeblog.newPost": {
      const [bid, u, p, s, pub] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return newPost(bid, s, pub);
    }
    case "metaWeblog.editPost": {
      const [pid, u, p, s, pub] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      try {
        await ghGet(`${POSTS_DIR}/${pid}.md`);
        return await editPost(pid, s, pub);
      } catch {
        return await editPage(pid, s, pub);
      }
    }
    case "blogger.deletePost": {
      const [, pid, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return deletePost(pid);
    }
    case "metaWeblog.getCategories": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return getCategories();
    }
    case "metaWeblog.newMediaObject": {
      const [bid, u, p, s] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return newMediaObject(bid, s);
    }
    case "mt.getCategoryList": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return [];
    }
    case "mt.getPostCategories": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return [];
    }
    case "mt.setPostCategories": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return true;
    }
    case "mt.supportedTextFilters": {
      return [{ key: "0", label: "None" }];
    }
    case "wp.getTags": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return [];
    }
    case "wp.getAuthors": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return [{ user_id: "1", user_login: XMLRPC_USERNAME, display_name: "Philip Zastrow" }];
    }
    case "wp.getCommentCount": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return { approved: 0, awaiting_moderation: 0, spam: 0, total_comments: 0 };
    }
    case "wp.getPostFormats": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return { standard: "Standard" };
    }
    case "wp.getPostTypes": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return {
        post: { name: "post", label: "Posts", hierarchical: false, public: true, show_ui: true, supports: ["title", "editor", "custom-fields"] },
        page: { name: "page", label: "Pages", hierarchical: true, public: true, show_ui: true, supports: ["title", "editor", "custom-fields"] },
        book: { name: "book", label: "Books", hierarchical: false, public: true, show_ui: true, supports: ["title", "editor", "custom-fields"] },
      };
    }
    case "wp.getUsersBlogs": {
      const [u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return [{ isAdmin: true, isPrimary: true, url: SITE_URL, blogid: "1", blogName: "Philip Zastrow", xmlrpc: `${SITE_URL}/xmlrpc` }];
    }
    case "wp.getPosts": {
      const [, u, p, filter] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      const count = filter && filter.number ? filter.number : 100;
      const postType = filter && filter.post_type ? filter.post_type : "post";
      if (postType === "page") {
        const listing = await ghGet(PAGES_DIR);
        const files = listing
          .filter((f) => f.name.endsWith(".md"))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, count);
        return Promise.all(
          files.map(async (f) => {
            const data = await ghGet(f.path);
            const content = Buffer.from(data.content, "base64").toString("utf8");
            return parsePageWp(f.name.replace(/\.md$/, ""), content);
          }),
        );
      }
      if (postType === "book") {
        const listing = await ghGet(BOOKS_DIR);
        const files = listing
          .filter((f) => f.name.endsWith(".md"))
          .sort((a, b) => b.name.localeCompare(a.name))
          .slice(0, count);
        return Promise.all(
          files.map(async (f) => {
            const data = await ghGet(f.path);
            const content = Buffer.from(data.content, "base64").toString("utf8");
            return parseBookWp(f.name.replace(/\.md$/, ""), content);
          }),
        );
      }
      const listing = await ghGet(POSTS_DIR);
      const files = listing
        .filter((f) => f.name.endsWith(".md") && f.name !== "index.md")
        .sort((a, b) => b.name.localeCompare(a.name))
        .slice(0, count);
      return Promise.all(
        files.map(async (f) => {
          const data = await ghGet(f.path);
          const content = Buffer.from(data.content, "base64").toString("utf8");
          return parsePostWp(f.name.replace(/\.md$/, ""), content);
        }),
      );
    }
    case "wp.editPost": {
      const [, u, p, pid, content] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      const struct = {
        title: content.post_title || "",
        description: content.post_content || "",
        mt_excerpt: content.post_excerpt || "",
        post_status: content.post_status,
        custom_fields: content.custom_fields,
        dateCreated: content.post_date,
        mt_keywords: content.terms_names?.post_tag?.join(", ") || "",
      };
      if (content.post_type === "page") {
        struct.page_status = content.post_status;
        return editPage(pid, struct, content.post_status === "publish");
      }
      if (content.post_type === "book") {
        // Extract book-specific fields from custom_fields
        if (Array.isArray(content.custom_fields)) {
          for (const cf of content.custom_fields) {
            if (cf.key === "author") struct.author = cf.value;
            if (cf.key === "isbn") struct.isbn = cf.value;
            if (cf.key === "rating") struct.rating = cf.value;
          }
        }
        return editBook(pid, struct, content.post_status === "publish");
      }
      try {
        await ghGet(`${POSTS_DIR}/${pid}.md`);
        return editPost(pid, struct, content.post_status === "publish");
      } catch {
        return editPage(pid, struct, content.post_status === "publish");
      }
    }
    case "wp.getPost": {
      const [, u, p, pid] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      try {
        const data = await ghGet(`${POSTS_DIR}/${pid}.md`);
        return parsePostWp(pid, Buffer.from(data.content, "base64").toString("utf8"));
      } catch {
        try {
          const data = await ghGet(`${PAGES_DIR}/${pid}.md`);
          return parsePageWp(pid, Buffer.from(data.content, "base64").toString("utf8"));
        } catch {
          const data = await ghGet(`${BOOKS_DIR}/${pid}.md`);
          return parseBookWp(pid, Buffer.from(data.content, "base64").toString("utf8"));
        }
      }
    }
    case "wp.getPageList": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      const listing = await ghGet(PAGES_DIR);
      const files = listing.filter((f) => f.name.endsWith(".md"));
      return Promise.all(
        files.map(async (f) => {
          const data = await ghGet(f.path);
          const content = Buffer.from(data.content, "base64").toString("utf8");
          const { fm } = parseFrontmatter(content);
          const pageDate = fm.date ? new Date(fm.date) : new Date();
          return {
            page_id: f.name.replace(/\.md$/, ""),
            page_title: fm.title || f.name.replace(/\.md$/, ""),
            page_parent_id: 0,
            dateCreated: pageDate,
            date_created_gmt: pageDate,
          };
        }),
      );
    }
    case "wp.getPageStatusList": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return { draft: "Draft", publish: "Published" };
    }
    case "wp.getPageTemplates": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return { Default: "default" };
    }
    case "wp.getPages": {
      const [, u, p, n] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return getPages("1", n);
    }
    case "wp.getPage": {
      const [, pid, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return getPage(pid);
    }
    case "wp.newPage": {
      const [, u, p, s, pub] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return newPage("1", s, pub);
    }
    case "wp.editPage": {
      const [, pid, u, p, s, pub] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return editPage(pid, s, pub);
    }
    case "wp.deletePage": {
      const [, pid, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return deletePage(pid);
    }
    case "wp.getOptions": {
      const [, u, p] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return {
        software_name: { desc: "Software Name", readonly: true, value: "Eleventy" },
        software_version: { desc: "Software Version", readonly: true, value: "3.0" },
        blog_url: { desc: "Blog URL", readonly: true, value: SITE_URL },
        blog_title: { desc: "Blog Title", readonly: true, value: "Philip Zastrow" },
      };
    }
    case "system.listMethods": {
      return [
        "system.listMethods",
        "blogger.getUsersBlogs",
        "blogger.deletePost",
        "metaWeblog.newPost",
        "metaWeblog.editPost",
        "metaWeblog.getPost",
        "metaWeblog.getRecentPosts",
        "metaWeblog.getCategories",
        "metaWeblog.newMediaObject",
        "mt.getCategoryList",
        "mt.getPostCategories",
        "mt.setPostCategories",
        "mt.supportedTextFilters",
        "wp.getUsersBlogs",
        "wp.getTags",
        "wp.getAuthors",
        "wp.getCommentCount",
        "wp.getPostFormats",
        "wp.getPostTypes",
        "wp.getOptions",
        "wp.getPosts",
        "wp.getPost",
        "wp.editPost",
        "wp.getPages",
        "wp.getPageList",
        "wp.getPageStatusList",
        "wp.getPageTemplates",
        "wp.getPage",
        "wp.newPage",
        "wp.editPage",
        "wp.deletePage",
      ];
    }
    default:
      // Gracefully handle unknown methods from known APIs (MarsEdit probes many)
      console.log("XML-RPC unhandled method:", method);
      if (method.startsWith("wp.") || method.startsWith("mt.") || method.startsWith("blogger.") || method.startsWith("metaWeblog.")) {
        return [];
      }
      throw { faultCode: -32601, faultString: `Method not found: ${method}` };
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST", "WWW-Authenticate": 'Basic realm="XML-RPC"' }, body: "Method Not Allowed" };
  }
  try {
    const body = event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body;
    const { method, params } = parseXmlRpc(body);
    console.log("XML-RPC method:", method);
    const result = await dispatch(method, params);
    return { statusCode: 200, headers: { "Content-Type": "text/xml" }, body: xmlOk(result) };
  } catch (err) {
    console.error("XML-RPC error:", err);
    const code = err.faultCode ?? -32603;
    const msg = err.faultString || err.message || "Internal error";
    return { statusCode: 200, headers: { "Content-Type": "text/xml" }, body: xmlFault(code, msg) };
  }
};
