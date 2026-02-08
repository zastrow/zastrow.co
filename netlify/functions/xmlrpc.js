import { Readable } from "node:stream";
import { createRequire } from "node:module";
import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";

const require = createRequire(import.meta.url);
const Deserializer = require("xmlrpc/lib/deserializer");
const serializer = require("xmlrpc/lib/serializer");

const SITE_URL = process.env.SITE_URL || "https://zastrow.co";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // "owner/repo"
const XMLRPC_USERNAME = process.env.XMLRPC_USERNAME;
const XMLRPC_PASSWORD = process.env.XMLRPC_PASSWORD;
const POSTS_DIR = "src/content/posts";
const UPLOADS_DIR = "src/public/uploads";

function getOctokit() {
  return new Octokit({ auth: GITHUB_TOKEN });
}

function repoParams() {
  const [owner, repo] = GITHUB_REPO.split("/");
  return { owner, repo };
}

function parseXmlRpc(body) {
  return new Promise((resolve, reject) => {
    const deserializer = new Deserializer("utf8");
    const stream = Readable.from([body]);
    deserializer.deserializeMethodCall(stream, (err, method, params) => {
      if (err) reject(err);
      else resolve({ method, params });
    });
  });
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

    const { method, params } = await parseXmlRpc(body);
    console.log("XML-RPC method:", method);
    const result = await handleMethod(method, params);
    const xml = serializer.serializeMethodResponse(result);
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: xml,
    };
  } catch (err) {
    console.error("XML-RPC error:", err);
    if (err.faultCode !== undefined) {
      const xml = serializer.serializeFault({
        faultCode: err.faultCode,
        faultString: err.faultString || "Unknown error",
      });
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/xml" },
        body: xml,
      };
    }
    const xml = serializer.serializeFault({
      faultCode: -32603,
      faultString: err.message || "Internal error",
    });
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/xml" },
      body: xml,
    };
  }
};
