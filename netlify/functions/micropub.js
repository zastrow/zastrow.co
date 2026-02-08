// Micropub endpoint for Netlify Functions (iA Writer)
// Spec: https://www.w3.org/TR/micropub/

import {
  ghGet, ghPut, slugify, formatDate, buildPermalink,
  generatePreview, dumpYaml,
  SITE_URL, POSTS_DIR,
} from "./lib/github.js";

import { verifyToken, hasScope } from "./lib/indieauth.js";

// --- Micropub post creation ---

function micropubToPost(properties) {
  const now = new Date();
  const title = (properties.name && properties.name[0]) || "";

  // Content can be plain string or { html: "..." } object
  let content = "";
  if (properties.content && properties.content[0]) {
    const c = properties.content[0];
    content = typeof c === "string" ? c : (c.html || c.value || "");
  }

  const tags = properties.category || [];
  const slug = properties["mp-slug"]
    ? properties["mp-slug"][0]
    : slugify(title || `post-${Date.now()}`);

  const published = properties.published
    ? new Date(properties.published[0])
    : now;

  const isDraft = properties["post-status"]
    && properties["post-status"][0] === "draft";

  const preview = generatePreview(content);

  const fm = {
    title,
    date: published.toISOString(),
    updated: "",
  };
  if (preview) fm.preview = preview;
  if (tags.length) fm.tags = tags;
  if (isDraft) fm.draft = true;

  const markdown = `---\n${dumpYaml(fm)}---\n${content}\n`;

  return { markdown, slug, published, title };
}

function parseBody(event) {
  const contentType = (event.headers["content-type"] || "").toLowerCase();
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;

  if (contentType.includes("application/json")) {
    const json = JSON.parse(rawBody);
    return json.properties || {};
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const params = new URLSearchParams(rawBody);
    const properties = {};
    for (const [key, value] of params.entries()) {
      if (key === "h") continue;
      const cleanKey = key.replace(/\[\]$/, "");
      if (!properties[cleanKey]) properties[cleanKey] = [];
      properties[cleanKey].push(value);
    }
    return properties;
  }

  return null;
}

// --- Handler ---

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    };
  }

  // Verify token for all requests
  const tokenData = await verifyToken(event.headers.authorization);
  if (!tokenData) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "unauthorized" }),
    };
  }

  try {
    // GET — configuration queries
    if (event.httpMethod === "GET") {
      const q = event.queryStringParameters?.q;

      if (q === "config") {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            "media-endpoint": `${SITE_URL}/micropub-media`,
          }),
        };
      }

      if (q === "syndicate-to") {
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ "syndicate-to": [] }),
        };
      }

      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      };
    }

    // POST — create post
    if (event.httpMethod === "POST") {
      if (!hasScope(tokenData, "create")) {
        return {
          statusCode: 403,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "insufficient_scope", error_description: "Missing create scope" }),
        };
      }

      const properties = parseBody(event);
      if (!properties) {
        return {
          statusCode: 415,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: "invalid_request", error_description: "Unsupported content type" }),
        };
      }

      const { markdown, slug, published, title } = micropubToPost(properties);
      const yyyy = published.getFullYear();
      const mm = String(published.getMonth() + 1).padStart(2, "0");
      const dd = String(published.getDate()).padStart(2, "0");
      const postId = `${yyyy}-${mm}-${dd}-${slug}`;
      const filePath = `${POSTS_DIR}/${postId}.md`;

      await ghPut(
        filePath,
        `New post: ${title || postId} (via Micropub)`,
        Buffer.from(markdown).toString("base64"),
      );

      const permalink = buildPermalink(published, title, slug);
      const location = `${SITE_URL}${permalink}`;

      return {
        statusCode: 201,
        headers: {
          Location: location,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: location }),
      };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    console.error("Micropub error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "server_error", error_description: err.message }),
    };
  }
};
