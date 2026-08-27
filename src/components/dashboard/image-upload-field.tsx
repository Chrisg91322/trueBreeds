"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Trash2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const ASPECT = {
  photo: "aspect-[4/3]",
  wide: "aspect-[16/9]",
  square: "aspect-square max-w-56",
} as const;

type Props = {
  name: string;
  defaultValue?: string | null;
  folder?: "animals" | "litters" | "offspring" | "theme" | "misc";
  label?: string;
  hint?: string;
  aspect?: keyof typeof ASPECT;
  /** Prefer PNG for favicons; ICO allowed. */
  acceptIco?: boolean;
};

export function ImageUploadField({
  name,
  defaultValue,
  folder = "misc",
  label = "Photo",
  hint,
  aspect = "photo",
  acceptIco = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const accept = acceptIco
    ? "image/jpeg,image/png,image/webp,image/gif,image/x-icon,image/vnd.microsoft.icon,.ico"
    : "image/jpeg,image/png,image/webp,image/gif";

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setUrl(data.url as string);
      toast.success("Photo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void uploadFile(file);
  }

  const frame = ASPECT[aspect];

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className={cn("relative w-full overflow-hidden rounded-xl border bg-muted/40", frame)}>
          {/* Favicons / logos may be ICO; next/image is fine with unoptimized */}
          <Image src={url} alt="" fill className="object-cover" unoptimized />
          <div className="absolute inset-x-0 bottom-0 flex gap-2 bg-gradient-to-t from-black/55 to-transparent p-3">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              disabled={uploading}
              onClick={() => setUrl("")}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            onFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 text-center transition-colors",
            frame,
            dragOver ? "border-primary bg-primary/5" : "hover:border-foreground/30",
            uploading && "pointer-events-none opacity-70"
          )}
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
          )}
          <div className="text-sm font-medium">
            {uploading ? "Uploading…" : `Upload ${label.toLowerCase()}`}
          </div>
          <p className="max-w-xs text-xs text-muted-foreground">
            {hint ??
              (acceptIco
                ? "Drag and drop or click — JPEG, PNG, WebP, GIF, or ICO (max 5 MB)."
                : "Drag and drop or click — JPEG, PNG, WebP, or GIF (max 5 MB).")}
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setShowUrl((v) => !v)}
        >
          <Link2 className="h-3.5 w-3.5" />
          {showUrl ? "Hide URL field" : "Or paste an image URL"}
        </button>
        {showUrl && (
          <Input
            className="mt-2"
            type="url"
            placeholder="https://"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        )}
      </div>
    </div>
  );
}
