export interface StrapiConfig {
  url: string;
  apiToken?: string;
  email?: string;
  password?: string;
  timeoutMs: number;
}

export function loadConfig(): StrapiConfig {
  const url = (process.env.STRAPI_URL ?? "http://localhost:1337").replace(/\/+$/, "");
  const apiToken = process.env.STRAPI_API_TOKEN?.trim() || undefined;
  const email = process.env.STRAPI_EMAIL?.trim() || undefined;
  const password = process.env.STRAPI_PASSWORD?.trim() || undefined;
  const timeoutMs = Number.parseInt(process.env.STRAPI_TIMEOUT_MS ?? "30000", 10);

  if (!apiToken && !(email && password)) {
    // Allow unauthenticated mode for public endpoints, but warn on stderr.
    console.error(
      "[strapi-io-mcp] WARNING: No STRAPI_API_TOKEN or STRAPI_EMAIL/STRAPI_PASSWORD set. Only public endpoints will work.",
    );
  }

  return { url, apiToken, email, password, timeoutMs };
}
