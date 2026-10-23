/** Request header that marks an owner-only /preview render. */
export const PREVIEW_HEADER = "x-truebreeds-preview";
export const TENANT_SLUG_HEADER = "x-truebreeds-tenant-slug";
export const TENANT_ID_HEADER = "x-truebreeds-tenant-id";

/**
 * Headers the rewritten tenant page can read via `headers()`.
 * Setting them on the middleware response does not reach Server Components.
 */
export function previewRequestHeaders(
  incoming: Headers,
  tenant: { id: string; slug: string }
) {
  const headers = new Headers(incoming);
  headers.set(PREVIEW_HEADER, "1");
  headers.set(TENANT_SLUG_HEADER, tenant.slug);
  headers.set(TENANT_ID_HEADER, tenant.id);
  return headers;
}
