import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

export const PHOTOS_BUCKET = "photos";

const MAX_BYTES = 5 * 1024 * 1024;
const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
]);
const DOCUMENT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function supabaseProjectUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return raw.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

function storageAdmin(): SupabaseClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(supabaseProjectUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function assertImageFile(file: File) {
  const type = file.type || guessMimeFromName(file.name);
  if (!ALLOWED_TYPES.has(type) && !/\.ico$/i.test(file.name)) {
    throw new Error("Use a JPEG, PNG, WebP, GIF, or ICO image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Images must be 5 MB or smaller.");
  }
}

export function assertDocumentFile(file: File) {
  const type = file.type || guessMimeFromName(file.name);
  if (!DOCUMENT_TYPES.has(type) && !/\.pdf$/i.test(file.name)) {
    throw new Error("Use a PDF, JPEG, PNG, WebP, or GIF.");
  }
  if (file.size > DOCUMENT_MAX_BYTES) {
    throw new Error("Files must be 10 MB or smaller.");
  }
}

function guessMimeFromName(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "ico":
      return "image/x-icon";
    case "pdf":
      return "application/pdf";
    default:
      return "";
  }
}

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif", "ico", "pdf"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  switch (file.type) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    case "image/x-icon":
    case "image/vnd.microsoft.icon":
      return "ico";
    case "application/pdf":
      return "pdf";
    default:
      return "jpg";
  }
}

async function ensurePhotosBucket(supabase: SupabaseClient, documents = false) {
  const allowedMimeTypes = documents ? [...DOCUMENT_TYPES, ...ALLOWED_TYPES] : [...ALLOWED_TYPES];
  const { data } = await supabase.storage.getBucket(PHOTOS_BUCKET);
  if (data) {
    if (!documents) return;
    const current = data.allowed_mime_types ?? [];
    const missing = allowedMimeTypes.filter((type) => current.length > 0 && !current.includes(type));
    const limit = data.file_size_limit ?? 0;
    const needsLargerLimit = limit > 0 && limit < DOCUMENT_MAX_BYTES;
    if (missing.length === 0 && !needsLargerLimit) return;

    const { error } = await supabase.storage.updateBucket(PHOTOS_BUCKET, {
      public: data.public,
      fileSizeLimit: needsLargerLimit ? DOCUMENT_MAX_BYTES : limit || null,
      allowedMimeTypes: current.length === 0 ? null : [...new Set([...current, ...allowedMimeTypes])],
    });
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await supabase.storage.createBucket(PHOTOS_BUCKET, {
    public: true,
    fileSizeLimit: documents ? DOCUMENT_MAX_BYTES : MAX_BYTES,
    allowedMimeTypes,
  });
  // Another request may have created it first.
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(error.message);
  }
}

/**
 * Upload a tenant-scoped image to the public `photos` bucket.
 * Path: `{tenantId}/{folder}/{id}.{ext}`
 */
export async function uploadTenantPhoto(args: {
  tenantId: string;
  folder: string;
  file: File;
  kind?: "image" | "document";
}): Promise<{ url: string; path: string }> {
  const documents = args.kind === "document";
  if (documents) assertDocumentFile(args.file);
  else assertImageFile(args.file);
  const folder = args.folder.replace(/[^a-z0-9_-]/gi, "") || "misc";
  const path = `${args.tenantId}/${folder}/${nanoid()}.${extensionFor(args.file)}`;

  const supabase = storageAdmin();
  await ensurePhotosBucket(supabase, documents);

  const contentType =
    args.file.type || guessMimeFromName(args.file.name) || "application/octet-stream";

  const { error } = await supabase.storage.from(PHOTOS_BUCKET).upload(path, args.file, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
