"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Fires a lightweight, best-effort page view beacon for the dashboard analytics tab. */
export function PageViewTracker({ tenantId }: { tenantId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const body = JSON.stringify({ tenantId, path: pathname });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics/pageview",
        new Blob([body], { type: "application/json" })
      );
    } else {
      fetch("/api/analytics/pageview", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [tenantId, pathname]);

  return null;
}
