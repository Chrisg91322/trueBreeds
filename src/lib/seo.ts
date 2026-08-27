import "server-only";
import { headers } from "next/headers";
import { classifyHostname, getRootDomain } from "@/lib/tenant-resolve";

export function appOrigin() {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const root = getRootDomain();
  const protocol = root.startsWith("localhost") ? "http" : "https";
  const host = root.startsWith("localhost") ? root : `www.${root.replace(/^www\./, "")}`;
  return `${protocol}://${host}`;
}

export function tenantSiteOrigin(slug: string, customDomain?: string | null) {
  if (customDomain) {
    return `https://${customDomain}`;
  }
  const root = getRootDomain();
  const protocol = root.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${slug}.${root}`;
}

export async function requestHostname() {
  const host = (await headers()).get("host") || "";
  return host;
}

export async function resolveRequestSite() {
  const hostname = await requestHostname();
  const resolution = classifyHostname(hostname);
  return { hostname, resolution };
}
