// Self-hosted IndieAuth token endpoint
// Exchanges auth codes for Bearer tokens, verifies existing tokens
// Works with HMAC-SHA256 signed payloads — no external dependencies

import { createHmac, createHash } from "node:crypto";

const SITE_URL = process.env.SITE_URL || "https://zastrow.co";
const MICROPUB_SECRET = process.env.MICROPUB_SECRET;

function sign(payload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const sig = createHmac("sha256", MICROPUB_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verify(token) {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  const expected = createHmac("sha256", MICROPUB_SECRET).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const handler = async (event) => {
  if (!MICROPUB_SECRET) {
    return jsonResponse(500, { error: "server_error", error_description: "MICROPUB_SECRET not configured" });
  }

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

  // GET — verify an existing Bearer token
  if (event.httpMethod === "GET") {
    const auth = event.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
      return jsonResponse(401, { error: "unauthorized" });
    }
    const token = auth.replace("Bearer ", "");
    const payload = verify(token);
    if (!payload) {
      return jsonResponse(401, { error: "unauthorized", error_description: "Invalid or expired token" });
    }
    return jsonResponse(200, {
      me: payload.me,
      client_id: payload.client_id,
      scope: payload.scope,
    });
  }

  // POST — exchange auth code for Bearer token
  if (event.httpMethod === "POST") {
    const rawBody = event.isBase64Encoded
      ? Buffer.from(event.body, "base64").toString("utf8")
      : event.body;

    let params;
    const contentType = (event.headers["content-type"] || "").toLowerCase();
    if (contentType.includes("application/json")) {
      params = JSON.parse(rawBody);
    } else {
      const form = new URLSearchParams(rawBody);
      params = Object.fromEntries(form.entries());
    }

    const { grant_type, code, client_id, redirect_uri, code_verifier } = params;

    if (grant_type !== "authorization_code") {
      return jsonResponse(400, { error: "unsupported_grant_type" });
    }

    // Verify the auth code
    const codePayload = verify(code);
    if (!codePayload) {
      return jsonResponse(400, { error: "invalid_grant", error_description: "Invalid or expired authorization code" });
    }

    // Validate client_id and redirect_uri match
    if (codePayload.client_id !== client_id) {
      return jsonResponse(400, { error: "invalid_grant", error_description: "client_id mismatch" });
    }
    if (codePayload.redirect_uri !== redirect_uri) {
      return jsonResponse(400, { error: "invalid_grant", error_description: "redirect_uri mismatch" });
    }

    // PKCE verification
    if (codePayload.code_challenge && codePayload.code_challenge_method === "S256") {
      if (!code_verifier) {
        return jsonResponse(400, { error: "invalid_grant", error_description: "Missing code_verifier" });
      }
      const challenge = createHash("sha256").update(code_verifier).digest("base64url");
      if (challenge !== codePayload.code_challenge) {
        return jsonResponse(400, { error: "invalid_grant", error_description: "PKCE verification failed" });
      }
    }

    // Issue a long-lived Bearer token
    const accessToken = sign({
      me: SITE_URL,
      client_id,
      scope: codePayload.scope,
      iat: Date.now(),
      // No exp — token lives until secret is rotated
    });

    return jsonResponse(200, {
      access_token: accessToken,
      token_type: "Bearer",
      scope: codePayload.scope,
      me: `${SITE_URL}/`,
    });
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
