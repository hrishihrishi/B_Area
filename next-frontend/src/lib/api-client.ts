/**
 * Centralised HTTP client for all frontend → backend communication.
 *
 * Base URL resolution:
 *   - If NEXT_PUBLIC_API_BASE_URL is set (e.g. "http://localhost:8080/api"),
 *     endpoint paths like "/company/profile" are joined to it directly.
 *   - If the env var is missing, falls back to the Next.js same-origin "/api"
 *     route (useful for SSR or when both services run on the same host).
 *
 * Endpoint convention: always start endpoint paths with a leading slash
 * and WITHOUT the "/api" prefix (the base URL already includes it).
 *   CORRECT:   api.get("/company/profile?email=foo@bar.com")
 *   INCORRECT: api.get("/api/company/profile?email=foo@bar.com")
 */

// Strip trailing slash from base so we don't get double slashes.
const RAW_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api";
const API_BASE_URL = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  // If the endpoint is already a full URL (starts with http), use it as-is.
  // Otherwise, join it with the base URL.
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  console.log("[api-client] → %s %s", options.method ?? "GET", url);
  if (options.body) {
    console.log("[api-client] request body:", options.body);
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  console.log("[api-client] ← status:", response.status, url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[api-client] Request failed:", response.status, errorText);
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  // 204 No Content — return undefined (void operations like DELETE)
  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json()) as T;
  console.log("[api-client] response data:", data);
  return data;
}

export const api = {
  get:  <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put:  <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  del:  <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

