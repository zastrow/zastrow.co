// IndieAuth token verification for Micropub endpoints
// Verifies Bearer tokens against self-hosted /token endpoint

import { SITE_URL } from "./github.js";

export async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.replace("Bearer ", "");
  const res = await fetch(`${SITE_URL}/token`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  // Verify the token's "me" claim matches our site
  const tokenMe = (data.me || "").replace(/\/+$/, "");
  const siteMe = SITE_URL.replace(/\/+$/, "");
  if (tokenMe !== siteMe) return null;
  return data;
}

export function hasScope(tokenData, requiredScope) {
  const scopes = (tokenData.scope || "").split(/\s+/);
  // "create" and "post" are equivalent per Micropub spec
  if (requiredScope === "create") {
    return scopes.includes("create") || scopes.includes("post");
  }
  return scopes.includes(requiredScope);
}
