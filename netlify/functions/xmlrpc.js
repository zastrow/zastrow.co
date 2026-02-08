import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";

const SITE_URL = process.env.SITE_URL || "https://zastrow.co";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // "owner/repo"
const XMLRPC_USERNAME = process.env.XMLRPC_USERNAME;
const XMLRPC_PASSWORD = process.env.XMLRPC_PASSWORD;
const POSTS_DIR = "src/content/posts";
const UPLOADS_DIR = "src/public/uploads";

// --- Minimal XML-RPC parser/serializer (no external deps) ---

function xmlEscape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function xmlUnescape(str) {
  return String(str)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
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

  // Implicit string (bare text inside <value>)
  m = xml.match(/<value>([\s\S]*?)<\/value>/);
  if (m && !m[1].match(/^\s*</)) return xmlUnescape(m[1]);

  return "";
}

function parseStruct(xml) {
  const result = {};
  const memberRegex =
    /<member>\s*<name>([\s\S]*?)<\/name>\s*<value>([\s\S]*?)<\/value>\s*<\/member>/g;
  let m;
  while ((m = memberRegex.exec(xml)) !== null) {
    result[m[1]] = parseValue(`<value>${m[2]}</value>`);
  }
  return result;
}

function parseArray(xml) {
  const dataMatch = xml.match(/<data>([\s\S]*?)<\/data>/);
  if (!dataMatch) return [];
  const values = [];
  const valueRegex = /<value>([\s\S]*?)<\/value>/g;
  let m;
  while ((m = valueRegex.exec(dataMatch[1])) !== null) {
    values.push(parseValue(`<value>${m[1]}</value>`));
  }
  return values;
}

function parseXmlRpc(body) {
  const methodMatch = body.match(/<methodName>([\s\S]*?)<\/methodName>/);
  if (!methodMatch) throw new Error("No methodName found");
  const method = methodMatch[1].trim();

  const params = [];
  const paramRegex = /<param>\s*<value>([\s\S]*?)<\/value>\s*<\/param>/g;
  let m;
  while ((m = paramRegex.exec(body)) !== null) {
    params.push(parseValue(`<value>${m[1]}</value>`));
  }

  return { method, params };
}

function serializeValue(val) {
  if (val === null || val === undefined) return "<value><nil/></value>";
  if (typeof val === "boolean")
    return `<value><boolean>${val ? 1 : 0}</boolean></value>`;
  if (typeof val === "number") {
    if (Number.isInteger(val)) return `<value><int>${val}</int></value>`;
    return `<value><double>${val}</double></value>`;
  }
  if (typeof val === "string")
    return `<value><string>${xmlEscape(val)}</string></value>`;
  if (val instanceof Date) {
    const iso = val.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    return `<value><dateTime.iso8601>${iso}</dateTime.iso8601></value>`;
  }
  if (Buffer.isBuffer(val))
    return `<value><base64>${val.toString("base64")}</base64></value>`;
  if (Array.isArray(val)) {
    const items = val.map(serializeValue).join("");
    return `<value><array><data>${items}</data></array></value>`;
  }
  if (typeof val === "object") {
    const members = Object.entries(val)
      .map(
        ([k, v]) =>
          `<member><name>${xmlEscape(k)}</name>${serializeValue(v)}</member>`,
      )
      .join("");
    return `<value><struct>${members}</struct></value>`;
  }
  return `<value><string>${xmlEscape(String(val))}</string></value>`;
}

function serializeMethodResponse(result) {
  return `<?xml version="1.0"?><methodResponse><params><param>${serializeValue(result)}</param></params></methodResponse>`;
}

function serializeFault(faultCode, faultString) {
  return `<?xml version="1.0"?><methodResponse><fault><value><struct><member><name>faultCode</name><value><int>${faultCode}</int></value></member><member><name>faultString</name><value><string>${xmlEscape(faultString)}</string></value></member></struct></value></fault></methodResponse>`;
}

// --- Helpers ---

function getOctokit() {
  return new Octokit({ auth: GITHUB_TOKEN });
}

function repoParams() {
  const [owner, repo] = GITHUB_REPO.split("/");
  return { owner, repo };
}

function authenticate(username, password) {
  return username === XMLRPC_USERNAME && password === XMLRPC_PASSWORD;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 80);
}

function postIdToPath(postId) {
  return `${POSTS_DIR}/${postId}.md`;
}

function formatDate(date) {
  if (date instanceof Date) return date.toISOString();
  return new Date().toISOString();
}

function buildPermalink(date, title, slug) {
  const d = date instanceof Date ? date : new Date(date);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const s = slug || slugify(title || "post");
  return `/posts/${yyyy}/${mm}/${dd}/${s}/`;
}

function generatePreview(content, maxLen = 200) {
  const plain = content
    .replace(/^#+\s.*/gm, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]+)\]\(.*?\)/g, "$1")
    .replace(/[*_~`]/g, "")
    .trim();
  if (plain.length <= maxLen) return plain;
  return plain.substring(0, maxLen).replace(/\s\S*$/, "");
}

function buildMarkdownFile(struct, publish) {
  const date = struct.dateCreated
    ? formatDate(struct.dateCreated)
    : new Date().toISOString();
  const title = struct.title || "";
  const content = struct.description || "";
  const preview =
    struct.mt_excerpt || struct.wp_excerpt || generatePreview(content);

  const frontmatter = { title, date };
  frontmatter.updated = "";
  if (preview) frontmatter.preview = preview;

  if (struct.mt_keywords) {
    const tags = struct.mt_keywords
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (tags.length) frontmatter.tags = tags;
  }

  if (!publish || struct.post_status === "draft") {
    frontmatter.draft = true;
  }

  const fm = yaml.dump(frontmatter, {
    lineWidth: -1,
    quotingType: '"',
    forceQuotes: false,
  });
  return `---\n${fm}---\n${content}\n`;
}

function postStructFromFile(postId, fileContent) {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return {
      postid: postId,
      title: postId,
      description: fileContent,
      dateCreated: new Date(),
      link: "",
    };
  }
  const fm = yaml.load(match[1]);
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
    mt_keywords: Array.isArray(fm.tags) ? fm.tags.join(", ") : "",
    post_status: fm.draft ? "draft" : "publish",
  };
}

// --- MetaWeblog API method handlers ---

async function getUsersBlogs() {
  return [{ blogid: "1", blogName: "Philip Zastrow", url: SITE_URL }];
}

async function getCategories() {
  return [];
}

async function getRecentPosts(blogId, numberOfPosts) {
  const octokit = getOctokit();
  const { owner, repo } = repoParams();
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: POSTS_DIR,
  });

  const count = Math.min(numberOfPosts || 10, 10);
  const mdFiles = data
    .filter((f) => f.name.endsWith(".md") && f.name !== "index.md")
    .sort((a, b) => b.name.localeCompare(a.name))
    .slice(0, count);

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      const { data: fileData } = await octokit.repos.getContent({
        owner,
        repo,
        path: file.path,
      });
      const content = Buffer.from(fileData.content, "base64").toString("utf8");
      const postId = file.name.replace(/\.md$/, "");
      return postStructFromFile(postId, content);
    }),
  );
  return posts;
}

async function getPost(postId) {
  const octokit = getOctokit();
  const { owner, repo } = repoParams();
  const { data } = await octokit.repos.getContent({
    owner,
    repo,
    path: postIdToPath(postId),
  });
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return postStructFromFile(postId, content);
}

async function newPost(blogId, struct, publish) {
  const octokit = getOctokit();
  const { owner, repo } = repoParams();

  const date = struct.dateCreated
    ? struct.dateCreated instanceof Date
      ? struct.dateCreated
      : new Date(struct.dateCreated)
    : new Date();

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const slug = struct.wp_slug || slugify(struct.title || `post-${Date.now()}`);
  const postId = `${yyyy}-${mm}-${dd}-${slug}`;
  const filePath = postIdToPath(postId);

  const fileContent = buildMarkdownFile(struct, publish);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `New post: ${struct.title || postId} (via MarsEdit)`,
    content: Buffer.from(fileContent).toString("base64"),
  });

  return postId;
}

async function editPost(postId, struct, publish) {
  const octokit = getOctokit();
  const { owner, repo } = repoParams();

  const { data: existing } = await octokit.repos.getContent({
    owner,
    repo,
    path: postIdToPath(postId),
  });

  const fileContent = buildMarkdownFile(struct, publish);

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: postIdToPath(postId),
    message: `Update post: ${struct.title || postId} (via MarsEdit)`,
    content: Buffer.from(fileContent).toString("base64"),
    sha: existing.sha,
  });

  return true;
}

async function deletePost(postId) {
  const post = await getPost(postId);
  post.post_status = "draft";
  await editPost(postId, { ...post, description: post.description }, false);
  return true;
}

async function newMediaObject(blogId, struct) {
  const octokit = getOctokit();
  const { owner, repo } = repoParams();

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const filename = struct.name || `upload-${Date.now()}`;
  const safeName = filename.replace(/[^\w.-]/g, "-");
  const filePath = `${UPLOADS_DIR}/${yyyy}/${mm}/${safeName}`;

  const content =
    struct.bits instanceof Buffer
      ? struct.bits.toString("base64")
      : Buffer.from(struct.bits).toString("base64");

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path: filePath,
    message: `Upload media: ${safeName} (via MarsEdit)`,
    content,
  });

  return { url: `${SITE_URL}/uploads/${yyyy}/${mm}/${safeName}` };
}

// --- Route XML-RPC methods ---

async function handleMethod(method, params) {
  switch (method) {
    case "blogger.getUsersBlogs": {
      const [, username, password] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      return await getUsersBlogs();
    }

    case "metaWeblog.getRecentPosts": {
      const [blogId, username, password, numberOfPosts] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      return await getRecentPosts(blogId, numberOfPosts);
    }

    case "metaWeblog.getPost": {
      const [postId, username, password] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      return await getPost(postId);
    }

    case "metaWeblog.newPost": {
      const [blogId, username, password, struct, publish] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      return await newPost(blogId, struct, publish);
    }

    case "metaWeblog.editPost": {
      const [postId, username, password, struct, publish] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      await editPost(postId, struct, publish);
      return true;
    }

    case "blogger.deletePost": {
      const [, postId, username, password] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      await deletePost(postId);
      return true;
    }

    case "metaWeblog.getCategories": {
      const [, username, password] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      return await getCategories();
    }

    case "metaWeblog.newMediaObject": {
      const [blogId, username, password, struct] = params;
      if (!authenticate(username, password))
        throw { faultCode: 403, faultString: "Authentication failed" };
      return await newMediaObject(blogId, struct);
    }

    default:
      throw {
        faultCode: -32601,
        faultString: `Method not found: ${method}`,
      };
  }
}

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        Allow: "POST",
        "WWW-Authenticate": 'Basic realm="XML-RPC"',
      },
      body: "Method Not Allowed",
    };
  }

  try {
    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;

    const { method, params } = parseXmlRpc(body);
    console.log("XML-RPC method:", method);
    const result = await handleMethod(method, params);
    const xml = serializeMethodResponse(result);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: xml,
    };
  } catch (err) {
    console.error("XML-RPC error:", err);
    if (err.faultCode !== undefined) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/xml" },
        body: serializeFault(err.faultCode, err.faultString || "Unknown error"),
      };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: serializeFault(-32603, err.message || "Internal error"),
    };
  }
};
