import { NextResponse, type NextRequest } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { assertImageFile, uploadTenantPhoto } from "@/lib/storage";

export const runtime = "nodejs";

const FOLDERS = new Set(["animals", "litters", "offspring", "theme", "misc"]);

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
    return NextResponse.json({ error: "Choose an image to upload" }, { status: 400 });
  }

  try {
    assertImageFile(file);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid image" },
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
