"use client";

import Link from "next/link";
import { createContext, useContext, type ComponentProps } from "react";

const SiteBasePathContext = createContext("");

export function SiteBasePathProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  return (
    <SiteBasePathContext.Provider value={basePath}>{children}</SiteBasePathContext.Provider>
  );
}

/** Prefix internal kennel-site paths when viewing via /preview. */
export function useSiteHref(path: string) {
  const base = useContext(SiteBasePathContext);
  if (!path || path === "/") return base || "/";
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export function SiteLink({ href, ...props }: ComponentProps<typeof Link>) {
  const path = typeof href === "string" ? href : "/";
  const resolved = useSiteHref(path);
  return <Link href={resolved} {...props} />;
}
