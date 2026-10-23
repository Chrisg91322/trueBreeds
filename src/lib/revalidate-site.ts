import "server-only";
import { revalidatePath, revalidateTag } from "next/cache";
import { tenantCacheTag } from "@/lib/site-data";

/** Drop cached public-site HTML and data after branding or profile edits. */
export function revalidateTenantSite(slug: string) {
  revalidateTag(tenantCacheTag(slug));
  revalidateTag("tenant");
  revalidatePath(`/${slug}`, "layout");
  revalidatePath("/preview", "layout");
}
