"use client";

import { useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import type { AffiliateProduct } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { AffiliateProductDialog } from "@/components/dashboard/affiliate-product-dialog";
import {
  deleteAffiliateProduct,
  moveAffiliateProduct,
  toggleAffiliateProductPublished,
} from "@/lib/actions/affiliate";

export function AffiliateProductTable({ products }: { products: AffiliateProduct[] }) {
  const [isPending, startTransition] = useTransition();

  if (products.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No products yet. Add your first Amazon pick above.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Published</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((p, i) => (
          <TableRow key={p.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                {p.imageUrl && (
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image src={p.imageUrl} alt="" fill className="object-contain" />
                  </div>
                )}
                <span className="line-clamp-1 text-sm font-medium">{p.title || p.originalUrl}</span>
              </div>
            </TableCell>
            <TableCell className="capitalize text-sm text-muted-foreground">{p.category}</TableCell>
            <TableCell className="text-sm">{p.price || "—"}</TableCell>
            <TableCell>
              <Switch
                checked={p.isPublished}
                onCheckedChange={(checked) =>
                  startTransition(async () => {
                    try {
                      await toggleAffiliateProductPublished(p.id, checked);
                    } catch {
                      toast.error("Failed to update");
                    }
                  })
                }
              />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isPending || i === 0}
                  onClick={() => startTransition(() => moveAffiliateProduct(p.id, "up"))}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  disabled={isPending || i === products.length - 1}
                  onClick={() => startTransition(() => moveAffiliateProduct(p.id, "down"))}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <AffiliateProductDialog product={p} />
                <Button
                  variant="outline"
                  size="icon"
                  className="text-destructive"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteAffiliateProduct(p.id))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
