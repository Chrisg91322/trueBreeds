import type { Offspring } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUploadField } from "@/components/dashboard/image-upload-field";

export function OffspringForm({
  action,
  offspring,
  litterId,
  defaultPrice,
  defaultDeposit,
}: {
  action: (formData: FormData) => void;
  offspring?: Offspring;
  litterId: string;
  defaultPrice?: number | null;
  defaultDeposit?: number | null;
}) {
  return (
    <form action={action} className="max-w-xl space-y-5">
      <input type="hidden" name="litterId" value={litterId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name (or temp name)" htmlFor="name">
          <Input id="name" name="name" defaultValue={offspring?.name ?? ""} placeholder="e.g. Blue Collar Boy" />
        </Field>
        <Field label="Sex" htmlFor="sex">
          <Select name="sex" defaultValue={offspring?.sex ?? "female"}>
            <SelectTrigger id="sex" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Color" htmlFor="color">
          <Input id="color" name="color" defaultValue={offspring?.color ?? ""} />
        </Field>
        <Field label="Status" htmlFor="status">
          <Select name="status" defaultValue={offspring?.status ?? "upcoming"}>
            <SelectTrigger id="status" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="deposit_received">Deposit Received</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="kept">Kept by Breeder</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Price ($)" htmlFor="price">
          <Input
            id="price"
            name="price"
            type="number"
            defaultValue={offspring?.price ?? defaultPrice ?? ""}
          />
        </Field>
        <Field label="Deposit amount ($)" htmlFor="depositAmount">
          <Input
            id="depositAmount"
            name="depositAmount"
            type="number"
            defaultValue={offspring?.depositAmount ?? defaultDeposit ?? ""}
          />
        </Field>
        <Field label="Microchip #" htmlFor="microchip">
          <Input id="microchip" name="microchip" defaultValue={offspring?.microchip ?? ""} />
        </Field>
      </div>

      <div>
        <Label>Cover photo</Label>
        <div className="mt-1.5">
          <ImageUploadField
            name="coverPhotoUrl"
            folder="offspring"
            label="cover photo"
            defaultValue={offspring?.coverPhotoUrl}
          />
        </div>
      </div>

      <Field label="Notes" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={4} defaultValue={offspring?.notes ?? ""} />
      </Field>

      <Button type="submit">{offspring ? "Save changes" : "Add to litter"}</Button>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={htmlFor}>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
