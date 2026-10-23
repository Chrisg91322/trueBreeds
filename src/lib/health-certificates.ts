export type HealthCertificate = {
  label: string;
  url: string;
};

/** Allow only http(s) links so a pasted javascript: URL never reaches the bio. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return value;
  } catch {
    return null;
  }
}

export function parseHealthCertificates(value: unknown): HealthCertificate[] {
  if (!Array.isArray(value)) return [];
  const certificates: HealthCertificate[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as { label?: unknown; url?: unknown };
    const label = typeof record.label === "string" ? record.label.trim() : "";
    const url = typeof record.url === "string" ? safeHttpUrl(record.url) : null;
    if (!label || !url) continue;
    certificates.push({ label: label.slice(0, 120), url });
  }
  return certificates;
}
