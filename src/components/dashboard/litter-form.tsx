import type { Litter } from "@prisma/client";
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

type AnimalOption = { id: string; name: string; sex: "male" | "female" };

export function LitterForm({
  action,
  litter,
  defaultSpecies,
  sires,
  dams,
}: {
  action: (formData: FormData) => void;
  litter?: Litter;
  defaultSpecies: "dog" | "cat";
  sires: AnimalOption[];
  dams: AnimalOption[];
}) {
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Species" htmlFor="species">
          <Select name="species" defaultValue={litter?.species ?? defaultSpecies}>
            <SelectTrigger id="species" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Dog</SelectItem>
              <SelectItem value="cat">Cat</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Breed" htmlFor="breed">
          <Input id="breed" name="breed" defaultValue={litter?.breed ?? ""} />
        </Field>
        <Field label="Sire" htmlFor="sireId">
          <Select name="sireId" defaultValue={litter?.sireId ?? undefined}>
            <SelectTrigger id="sireId" className="w-full"><SelectValue placeholder="Select sire" /></SelectTrigger>
            <SelectContent>
              {sires.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Dam" htmlFor="damId">
          <Select name="damId" defaultValue={litter?.damId ?? undefined}>
            <SelectTrigger id="damId" className="w-full"><SelectValue placeholder="Select dam" /></SelectTrigger>
            <SelectContent>
              {dams.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select name="status" defaultValue={litter?.status ?? "planned"}>
            <SelectTrigger id="status" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="expecting">Expecting</SelectItem>
              <SelectItem value="born">Born</SelectItem>
              <SelectItem value="active">Active (available)</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Expected whelp date" htmlFor="expectedWhelpDate">
          <Input
            id="expectedWhelpDate"
            name="expectedWhelpDate"
            type="date"
            defaultValue={litter?.expectedWhelpDate?.toISOString().slice(0, 10) ?? ""}
          />
        </Field>
        <Field label="Whelp date" htmlFor="whelpDate">
          <Input
            id="whelpDate"
            name="whelpDate"
            type="date"
            defaultValue={litter?.whelpDate?.toISOString().slice(0, 10) ?? ""}
          />
        </Field>
        <Field label="Go-home date" htmlFor="goHomeDate">
          <Input
            id="goHomeDate"
            name="goHomeDate"
            type="date"
            defaultValue={litter?.goHomeDate?.toISOString().slice(0, 10) ?? ""}
          />
        </Field>
        <Field label="Default price ($)" htmlFor="defaultPrice">
          <Input id="defaultPrice" name="defaultPrice" type="number" defaultValue={litter?.defaultPrice ?? ""} />
        </Field>
        <Field label="Default deposit ($)" htmlFor="defaultDepositAmount">
          <Input
            id="defaultDepositAmount"
            name="defaultDepositAmount"
            type="number"
            defaultValue={litter?.defaultDepositAmount ?? ""}
          />
        </Field>
      </div>

      <div>
        <Label>Cover photo</Label>
        <div className="mt-1.5">
          <ImageUploadField
            name="coverPhotoUrl"
            folder="litters"
            label="cover photo"
            defaultValue={litter?.coverPhotoUrl}
          />
        </div>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" rows={4} defaultValue={litter?.description ?? ""} />
      </Field>

      <Button type="submit">{litter ? "Save changes" : "Create litter"}</Button>
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
