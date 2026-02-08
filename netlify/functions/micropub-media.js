// Micropub media endpoint for Netlify Functions (iA Writer)
// Handles file uploads via multipart/form-data

import Busboy from "busboy";
import { ghPut, SITE_URL, UPLOADS_DIR } from "./lib/github.js";
import { verifyToken, hasScope } from "./lib/indieauth.js";

// --- Multipart parsing ---

function parseMultipart(event) {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: { "content-type": event.headers["content-type"] },
    });

    let fileData = null;

    busboy.on("file", (fieldname, stream, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.on("end", () => {
        fileData = {
          filename: filename || `upload-${Date.now()}`,
          mimeType,
          buffer: Buffer.concat(chunks),
        };
      });
    });

    busboy.on("finish", () => {
      if (!fileData) reject(new Error("No file in upload"));
      else resolve(fileData);
    });

    busboy.on("error", reject);

    const body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : Buffer.from(event.body);

    busboy.end(body);
  });
}

// --- Handler ---

export const handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Authorization, Content-Type",
      },
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Verify token
  const tokenData = await verifyToken(event.headers.authorization);
  if (!tokenData) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "unauthorized" }),
    };
  }

  if (!hasScope(tokenData, "media") && !hasScope(tokenData, "create")) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "insufficient_scope", error_description: "Missing media scope" }),
    };
  }

  try {
    const { filename, buffer } = await parseMultipart(event);

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const safeName = filename.replace(/[^\w.-]/g, "-");
    const path = `${UPLOADS_DIR}/${yyyy}/${mm}/${safeName}`;

    await ghPut(
      path,
      `Upload media: ${safeName} (via Micropub)`,
      buffer.toString("base64"),
    );

    const url = `${SITE_URL}/uploads/${yyyy}/${mm}/${safeName}`;

    return {
      statusCode: 201,
      headers: {
        Location: url,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    };
  } catch (err) {
    console.error("Micropub media error:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "server_error", error_description: err.message }),
    };
  }
};
