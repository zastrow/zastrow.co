// Self-hosted IndieAuth authorization endpoint
// Shows a password form, validates credentials, issues signed auth codes
// Replaces the deprecated indieauth.com service

import { createHmac } from "node:crypto";

const SITE_URL = process.env.SITE_URL || "https://zastrow.co";
const MICROPUB_SECRET = process.env.MICROPUB_SECRET;

function sign(payload) {
  const json = JSON.stringify(payload);
  const data = Buffer.from(json).toString("base64url");
  const sig = createHmac("sha256", MICROPUB_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function loginPage(params, error) {
  const { client_id, redirect_uri, state, scope, response_type, code_challenge, code_challenge_method } = params;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sign In — ${SITE_URL}</title>
  <style>
    * { box-sizing: border-box; margin: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .card { background: white; border-radius: 12px; padding: 2rem; width: 100%; max-width: 400px; box-shadow: 0 2px 12px rgba(0,0,0,0.1); }
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    .meta { color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
    .meta code { background: #f0f0f0; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.8rem; }
    label { display: block; font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem; }
    input[type="password"] { width: 100%; padding: 0.6rem; border: 1px solid #ccc; border-radius: 6px; font-size: 1rem; }
    button { width: 100%; padding: 0.7rem; background: #333; color: white; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer; margin-top: 1rem; }
    button:hover { background: #555; }
    .error { color: #c00; font-size: 0.85rem; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Sign In</h1>
    <p class="meta">Authorize <code>${client_id || "unknown"}</code> to access your site</p>
    ${error ? `<p class="error">${error}</p>` : ""}
    <form method="POST">
      <input type="hidden" name="client_id" value="${client_id || ""}">
      <input type="hidden" name="redirect_uri" value="${redirect_uri || ""}">
      <input type="hidden" name="state" value="${state || ""}">
      <input type="hidden" name="scope" value="${scope || ""}">
      <input type="hidden" name="response_type" value="${response_type || "code"}">
      <input type="hidden" name="code_challenge" value="${code_challenge || ""}">
      <input type="hidden" name="code_challenge_method" value="${code_challenge_method || ""}">
      <label for="password">Password</label>
      <input type="password" id="password" name="password" autocomplete="current-password" required autofocus>
      <button type="submit">Authorize</button>
    </form>
  </div>
</body>
</html>`;
}

export const handler = async (event) => {
  if (!MICROPUB_SECRET) {
    return { statusCode: 500, body: "MICROPUB_SECRET not configured" };
  }

  // GET — show login form
  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    return {
      statusCode: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
      body: loginPage(params, null),
    };
  }

  // POST — validate password and issue auth code
  if (event.httpMethod === "POST") {
    const body = new URLSearchParams(
      event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body,
    );

    const password = body.get("password");
    const client_id = body.get("client_id");
    const redirect_uri = body.get("redirect_uri");
    const state = body.get("state");
    const scope = body.get("scope");
    const response_type = body.get("response_type") || "code";
    const code_challenge = body.get("code_challenge");
    const code_challenge_method = body.get("code_challenge_method");

    if (password !== MICROPUB_SECRET) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
        body: loginPage({
          client_id, redirect_uri, state, scope, response_type,
          code_challenge, code_challenge_method,
        }, "Invalid password. Try again."),
      };
    }

    // Create a signed auth code
    const code = sign({
      me: SITE_URL,
      client_id,
      redirect_uri,
      scope: scope || "create media",
      code_challenge,
      code_challenge_method,
      exp: Date.now() + 5 * 60 * 1000, // 5 minute expiry
    });

    const url = new URL(redirect_uri);
    url.searchParams.set("code", code);
    if (state) url.searchParams.set("state", state);

    return {
      statusCode: 302,
      headers: { Location: url.toString() },
      body: "",
    };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
