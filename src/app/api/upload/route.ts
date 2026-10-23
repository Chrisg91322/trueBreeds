import { NextResponse, type NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { assertDocumentFile, assertImageFile, uploadTenantPhoto } from "@/lib/storage";

export const runtime = "nodejs";

const FOLDERS = new Set(["animals", "litters", "offspring", "theme", "certificates", "misc"]);

export async function POST(req: NextRequest) {
  const session = await getSessionContext();
  if (!session?.tenantId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose a file to upload" }, { status: 400 });
  }

  const documents = form.get("kind") === "document";

  try {
    if (documents) assertDocumentFile(file);
    else assertImageFile(file);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid file" },
      { status: 400 }
    );
  }

  const folderRaw = String(form.get("folder") || "misc");
  const folder = FOLDERS.has(folderRaw) ? folderRaw : "misc";

  try {
    const result = await uploadTenantPhoto({
      tenantId: session.tenantId,
      folder,
      file,
      kind: documents ? "document" : "image",
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("upload failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
