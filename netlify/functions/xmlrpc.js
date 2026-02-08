// Zero-dependency MetaWeblog XML-RPC endpoint for Netlify Functions
// Uses only Node.js built-ins (fetch, Buffer) — no npm packages

const SITE_URL = process.env.SITE_URL || "https://zastrow.co";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const XMLRPC_USERNAME = process.env.XMLRPC_USERNAME;
const XMLRPC_PASSWORD = process.env.XMLRPC_PASSWORD;
const POSTS_DIR = "src/content/posts";
const UPLOADS_DIR = "src/public/uploads";
const GITHUB_API = "https://api.github.com";

// --- GitHub API via fetch ---

async function ghGet(path) {
  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "zastrow-xmlrpc",
    },
  });
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`);
  return res.json();
}

async function ghPut(path, message, content, sha) {
  const body = { message, content };
  if (sha) body.sha = sha;
  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "zastrow-xmlrpc",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT ${path}: ${res.status} ${err}`);
  }
  return res.json();
}

// --- XML-RPC parser/serializer ---

function xmlEscape(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function xmlUnescape(str) {
  return String(str).replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

function parseValue(xml) {
  let m;
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
  if (xml.match(/<struct>/)) return parseStruct(xml);
  if (xml.match(/<array>/)) return parseArray(xml);
  m = xml.match(/<value>([\s\S]*?)<\/value>/);
  if (m && !m[1].match(/^\s*</)) return xmlUnescape(m[1]);
  return "";
}

function parseStruct(xml) {
  const result = {};
  const re = /<member>\s*<name>([\s\S]*?)<\/name>\s*<value>([\s\S]*?)<\/value>\s*<\/member>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    result[m[1]] = parseValue(`<value>${m[2]}</value>`);
  }
  return result;
}

function parseArray(xml) {
  const dataMatch = xml.match(/<data>([\s\S]*?)<\/data>/);
  if (!dataMatch) return [];
  const values = [];
  const re = /<value>([\s\S]*?)<\/value>/g;
  let m;
  while ((m = re.exec(dataMatch[1])) !== null) {
    values.push(parseValue(`<value>${m[1]}</value>`));
  }
  return values;
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
    return `<value><dateTime.iso8601>${val.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z")}</dateTime.iso8601></value>`;
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

function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
}

function formatDate(d) {
  return d instanceof Date ? d.toISOString() : new Date().toISOString();
}

function buildPermalink(date, title, slug) {
  const d = date instanceof Date ? date : new Date(date);
  const s = slug || slugify(title || "post");
  return `/posts/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${s}/`;
}

function generatePreview(content) {
  const plain = content.replace(/^#+\s.*/gm, "").replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[([^\]]+)\]\(.*?\)/g, "$1").replace(/[*_~`]/g, "").trim();
  return plain.length <= 200 ? plain : plain.substring(0, 200).replace(/\s\S*$/, "");
}

function dumpYaml(obj) {
  const lines = [];
  for (const [key, value] of Object.entries(obj)) {
    if (value === "") {
      lines.push(`${key}: ""`);
    } else if (Array.isArray(value)) {
      lines.push(`${key}:`);
      value.forEach((v) => lines.push(`  - ${v}`));
    } else if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
    } else {
      lines.push(`${key}: ${JSON.stringify(String(value))}`);
    }
  }
  return lines.join("\n") + "\n";
}

function buildMarkdownFile(struct, publish) {
  const date = struct.dateCreated ? formatDate(struct.dateCreated) : new Date().toISOString();
  const title = struct.title || "";
  const content = struct.description || "";
  const preview = struct.mt_excerpt || struct.wp_excerpt || generatePreview(content);
  const fm = { title, date, updated: "" };
  if (preview) fm.preview = preview;
  if (struct.mt_keywords) {
    const tags = struct.mt_keywords.split(",").map((t) => t.trim()).filter(Boolean);
    if (tags.length) fm.tags = tags;
  }
  if (!publish || struct.post_status === "draft") fm.draft = true;
  return `---\n${dumpYaml(fm)}---\n${content}\n`;
}

function parsePost(postId, raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { postid: postId, title: postId, description: raw, dateCreated: new Date(), link: "" };
  const fm = {};
  match[1].split("\n").forEach((line) => {
    const idx = line.indexOf(":");
    if (idx > 0) fm[line.slice(0, idx).trim()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
  });
  const body = match[2].trim();
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
    .slice(0, Math.min(count || 10, 10));
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
  await ghPut(`${POSTS_DIR}/${postId}.md`, `New post: ${struct.title || postId} (via MarsEdit)`, Buffer.from(fileContent).toString("base64"));
  return postId;
}

async function editPost(postId, struct, publish) {
  const existing = await ghGet(`${POSTS_DIR}/${postId}.md`);
  const fileContent = buildMarkdownFile(struct, publish);
  await ghPut(`${POSTS_DIR}/${postId}.md`, `Update post: ${struct.title || postId} (via MarsEdit)`, Buffer.from(fileContent).toString("base64"), existing.sha);
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
  await ghPut(`${UPLOADS_DIR}/${yyyy}/${mm}/${safeName}`, `Upload media: ${safeName} (via MarsEdit)`, content);
  return { url: `${SITE_URL}/uploads/${yyyy}/${mm}/${safeName}` };
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
      return getPost(pid);
    }
    case "metaWeblog.newPost": {
      const [bid, u, p, s, pub] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return newPost(bid, s, pub);
    }
    case "metaWeblog.editPost": {
      const [pid, u, p, s, pub] = params;
      if (!authenticate(u, p)) throw { faultCode: 403, faultString: "Authentication failed" };
      return editPost(pid, s, pub);
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
    default:
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
