"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function PreviewSiteButton({
  className,
  variant = "outline",
  size = "default",
  label = "Preview my site",
  disabled = false,
  onBeforeOpen,
}: {
  className?: string;
  variant?: "outline" | "secondary" | "ghost" | "default";
  size?: "default" | "sm" | "lg" | "xs";
  label?: string;
  disabled?: boolean;
  /** Persist unsaved edits before the preview tab reads them. */
  onBeforeOpen?: () => Promise<void>;
}) {
  return (
    <a
      href="/preview"
      target="_blank"
      rel="noopener noreferrer"
      aria-disabled={disabled || undefined}
      className={cn(buttonVariants({ variant, size }), disabled && "pointer-events-none opacity-50", className)}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        if (!onBeforeOpen) return;
        event.preventDefault();
        const opened = window.open("/preview", "_blank");
        void onBeforeOpen()
          .then(() => {
            if (opened && !opened.closed) opened.location.replace("/preview");
          })
          .catch(() => {
            opened?.close();
          });
      }}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
