import type { Animal } from "@prisma/client";
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

export function AnimalForm({
  action,
  animal,
  defaultSpecies,
}: {
  action: (formData: FormData) => void;
  animal?: Animal;
  defaultSpecies: "dog" | "cat";
}) {
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="name">
          <Input id="name" name="name" defaultValue={animal?.name} required />
        </Field>
        <Field label="Species" htmlFor="species">
          <Select name="species" defaultValue={animal?.species ?? defaultSpecies}>
            <SelectTrigger id="species"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Dog</SelectItem>
              <SelectItem value="cat">Cat</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Breed" htmlFor="breed">
          <Input id="breed" name="breed" defaultValue={animal?.breed ?? ""} />
        </Field>
        <Field label="Sex" htmlFor="sex">
          <Select name="sex" defaultValue={animal?.sex ?? "female"}>
            <SelectTrigger id="sex"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="male">Male</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of birth" htmlFor="dateOfBirth">
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            defaultValue={animal?.dateOfBirth?.toISOString().slice(0, 10) ?? ""}
          />
        </Field>
        <Field label="Color" htmlFor="color">
          <Input id="color" name="color" defaultValue={animal?.color ?? ""} />
        </Field>
        <Field label="Weight (lbs)" htmlFor="weightLbs">
          <Input id="weightLbs" name="weightLbs" type="number" step="0.1" defaultValue={animal?.weightLbs ?? ""} />
        </Field>
        <Field label="Registry / registration #" htmlFor="registryNumber">
          <Input id="registryNumber" name="registryNumber" defaultValue={animal?.registryNumber ?? ""} />
        </Field>
      </div>

      <Field label="Titles (comma-separated, e.g. CH, OFA Excellent)" htmlFor="titlesCsv">
        <Input id="titlesCsv" name="titlesCsv" defaultValue={animal?.titles.join(", ") ?? ""} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Pedigree URL" htmlFor="pedigreeUrl">
          <Input id="pedigreeUrl" name="pedigreeUrl" type="url" defaultValue={animal?.pedigreeUrl ?? ""} />
        </Field>
        <Field label="Embark URL" htmlFor="embarkUrl">
          <Input id="embarkUrl" name="embarkUrl" type="url" defaultValue={animal?.embarkUrl ?? ""} />
        </Field>
      </div>

      <div>
        <Label>Cover photo</Label>
        <div className="mt-1.5">
          <ImageUploadField
            name="coverPhotoUrl"
            folder="animals"
            label="cover photo"
            defaultValue={animal?.coverPhotoUrl}
          />
        </div>
      </div>

      <Field label="Bio" htmlFor="bio">
        <Textarea id="bio" name="bio" rows={5} defaultValue={animal?.bio ?? ""} />
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="hidden" name="isBreedingStock" value="false" />
          <input
            type="checkbox"
            name="isBreedingStock"
            value="true"
            defaultChecked={animal?.isBreedingStock ?? true}
            className="h-4 w-4"
          />
          Breeding stock
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="hidden" name="isRetired" value="false" />
          <input
            type="checkbox"
            name="isRetired"
            value="true"
            defaultChecked={animal?.isRetired ?? false}
            className="h-4 w-4"
          />
          Retired
        </label>
      </div>

      <Button type="submit">{animal ? "Save changes" : "Add animal"}</Button>
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
