"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AffiliateProduct } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Plus } from "lucide-react";
import { createAffiliateProduct, updateAffiliateProduct } from "@/lib/actions/affiliate";

const CATEGORIES = [
  { value: "food", label: "Food & Nutrition" },
  { value: "crates", label: "Crates & Travel" },
  { value: "toys", label: "Toys & Enrichment" },
  { value: "grooming", label: "Grooming" },
  { value: "other", label: "Everything Else" },
];

export function AffiliateProductDialog({ product }: { product?: AffiliateProduct }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const isEdit = !!product;

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateAffiliateProduct(product.id, formData);
        } else {
          await createAffiliateProduct(formData);
        }
        toast.success(isEdit ? "Product updated" : "Product added");
        setOpen(false);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={isEdit ? <Button variant="outline" size="sm" /> : <Button />}>
        {isEdit ? (
          "Edit"
        ) : (
          <>
            <Plus className="mr-1.5 h-4 w-4" />
            Add product
          </>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit product" : "Add a product"}</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="originalUrl">Amazon product URL</Label>
            <Input
              id="originalUrl"
              name="originalUrl"
              type="url"
              required
              defaultValue={product?.originalUrl}
              placeholder="https://www.amazon.com/dp/..."
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={product?.title ?? ""} className="mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price">Price (display only)</Label>
              <Input
                id="price"
                name="price"
                defaultValue={product?.price ?? ""}
                placeholder="$24.99"
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={product?.category ?? "other"}>
                <SelectTrigger id="category" className="mt-1.5 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={product?.imageUrl ?? ""}
              className="mt-1.5"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save changes" : "Add product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
