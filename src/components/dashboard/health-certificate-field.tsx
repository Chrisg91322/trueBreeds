"use client";

import { useRef, useState } from "react";
import { ExternalLink, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseHealthCertificates, type HealthCertificate } from "@/lib/health-certificates";
import { cn } from "@/lib/utils";

const MAX_CERTIFICATES = 12;

function labelFromFilename(name: string) {
  const base = name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
  return (base || "Health certificate").slice(0, 120);
}

export function HealthCertificateField({ defaultValue }: { defaultValue?: unknown }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initialCertificates = parseHealthCertificates(defaultValue);
  const [certificates, setCertificates] = useState<HealthCertificate[]>(initialCertificates);
  const certificatesRef = useRef(initialCertificates);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function commitCertificates(next: HealthCertificate[]) {
    certificatesRef.current = next;
    setCertificates(next);
  }

  async function uploadFile(file: File) {
    if (certificatesRef.current.length >= MAX_CERTIFICATES) {
      toast.error(`You can add up to ${MAX_CERTIFICATES} certificates.`);
      return;
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", "certificates");
      body.set("kind", "document");
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (certificatesRef.current.length >= MAX_CERTIFICATES) {
        toast.error(`You can add up to ${MAX_CERTIFICATES} certificates.`);
        return;
      }
      commitCertificates([
        ...certificatesRef.current,
        { label: labelFromFilename(file.name), url: data.url as string },
      ]);
      toast.success("Certificate uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      await uploadFile(file);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <Label>Health certificates</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload OFA, genetic, or vet certificates. Visitors open them from a link on this
          animal&apos;s bio.
        </p>
      </div>
      <input type="hidden" name="healthCertificatesJson" value={JSON.stringify(certificates)} />

      {certificates.length > 0 && (
        <ul className="space-y-2">
          {certificates.map((certificate, index) => (
            <li
              key={certificate.url}
              className="flex items-center gap-2 rounded-xl border bg-muted/30 p-2"
            >
              <FileText className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                aria-label={`Certificate ${index + 1} name`}
                value={certificate.label}
                maxLength={120}
                onChange={(event) => {
                  const label = event.target.value;
                  commitCertificates(
                    certificatesRef.current.map((item) =>
                      item.url === certificate.url ? { ...item, label } : item
                    )
                  );
                }}
                onBlur={(event) => {
                  const label = event.target.value.trim() || "Health certificate";
                  commitCertificates(
                    certificatesRef.current.map((item) =>
                      item.url === certificate.url ? { ...item, label } : item
                    )
                  );
                }}
              />
              <a
                href={certificate.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                View <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={`Remove ${certificate.label}`}
                onClick={() =>
                  commitCertificates(
                    certificatesRef.current.filter((item) => item.url !== certificate.url)
                  )
                }
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <button
        type="button"
        disabled={uploading || certificates.length >= MAX_CERTIFICATES}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void onFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/30 px-4 py-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/5" : "hover:border-foreground/30",
          (uploading || certificates.length >= MAX_CERTIFICATES) && "pointer-events-none opacity-70"
        )}
      >
        {uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" />
        )}
        <div className="text-sm font-medium">
          {uploading ? "Uploading…" : "Upload health certificate"}
        </div>
        <p className="max-w-xs text-xs text-muted-foreground">
          Drag and drop or click — PDF, JPEG, PNG, WebP, or GIF (max 10 MB).
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp,image/gif,.pdf"
        multiple
        className="sr-only"
        onChange={(event) => {
          void onFiles(event.target.files);
          event.target.value = "";
        }}
      />
    </div>
  );
}
