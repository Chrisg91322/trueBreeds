"use server";

import { revalidatePath } from "next/cache";
import { requireTenantSession } from "@/lib/auth";
import { refundDeposit as refundDepositStripe } from "@/lib/stripe/connect";

export async function refundDepositAction(depositId: string, formData: FormData) {
  const session = await requireTenantSession();
  const reason = String(formData.get("reason") || "").trim();
  if (!reason) throw new Error("A refund reason is required");

  await refundDepositStripe(session.tenantId, depositId, reason);
  revalidatePath("/dashboard/deposits");
}
