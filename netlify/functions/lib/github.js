// Shared GitHub API helpers and post utilities
// Used by both XML-RPC (MarsEdit) and Micropub (iA Writer) endpoints

export const SITE_URL = process.env.SITE_URL || "https://zastrow.co";
export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const GITHUB_REPO = process.env.GITHUB_REPO;
export const POSTS_DIR = "src/content/posts";
export const PAGES_DIR = "src/content/pages";
export const UPLOADS_DIR = "src/public/uploads";
const GITHUB_API = "https://api.github.com";

// --- GitHub API via fetch ---

export async function ghGet(path) {
  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "zastrow-netlify",
    },
  });
  if (!res.ok) throw new Error(`GitHub GET ${path}: ${res.status}`);
  return res.json();
}

export async function ghPut(path, message, content, sha) {
  const body = { message, content };
  if (sha) body.sha = sha;
  const res = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
      "User-Agent": "zastrow-netlify",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT ${path}: ${res.status} ${err}`);
  }
  return res.json();
}

// --- Helpers ---

export function slugify(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);
}

export function formatDate(d) {
  return d instanceof Date ? d.toISOString() : new Date().toISOString();
}

export function buildPermalink(date, title, slug) {
  const d = date instanceof Date ? date : new Date(date);
  const s = slug || slugify(title || "post");
  return `/posts/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${s}/`;
}

export function generatePreview(content) {
  const plain = content.replace(/^#+\s.*/gm, "").replace(/!\[.*?\]\(.*?\)/g, "").replace(/\[([^\]]+)\]\(.*?\)/g, "$1").replace(/[*_~`]/g, "").trim();
  return plain.length <= 200 ? plain : plain.substring(0, 200).replace(/\s\S*$/, "");
}

export function dumpYaml(obj) {
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

// Standard post keys that map to XML-RPC fields (hidden from custom_fields)
export const POST_STANDARD_KEYS = new Set(["title", "date", "preview", "tags", "draft", "layout"]);
// Standard page keys (hidden from custom_fields)
export const PAGE_STANDARD_KEYS = new Set(["title", "date", "draft", "layout"]);

function applyCustomFields(fm, customFields, standardKeys) {
  if (!Array.isArray(customFields)) return;
  for (const cf of customFields) {
    if (!cf.key || standardKeys.has(cf.key)) continue;
    if (cf.value === "true") fm[cf.key] = true;
    else if (cf.value === "false") fm[cf.key] = false;
    else fm[cf.key] = cf.value;
  }
}

export function buildMarkdownFile(struct, publish) {
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
  applyCustomFields(fm, struct.custom_fields, POST_STANDARD_KEYS);
  return `---\n${dumpYaml(fm)}---\n${content}\n`;
}

export function buildPageFile(struct, publish) {
  const title = struct.title || "";
  const content = struct.description || "";
  const fm = { title };
  if (!publish || struct.page_status === "draft" || struct.post_status === "draft") fm.draft = true;
  applyCustomFields(fm, struct.custom_fields, PAGE_STANDARD_KEYS);
  return `---\n${dumpYaml(fm)}---\n${content}\n`;
}
