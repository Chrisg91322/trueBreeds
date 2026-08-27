"use client";

import { ExternalLink } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function PreviewSiteButton({
  className,
  variant = "outline",
  size = "default",
  label = "Preview my site",
}: {
  className?: string;
  variant?: "outline" | "secondary" | "ghost" | "default";
  size?: "default" | "sm" | "lg" | "xs";
  label?: string;
}) {
  return (
    <a
      href="/preview"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {label}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
