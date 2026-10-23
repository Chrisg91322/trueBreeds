import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPECIES, type SpeciesId } from "@/lib/species";

export function SpeciesSelect({
  id,
  name = "species",
  defaultValue = "dog",
  plural = false,
  className,
}: {
  id: string;
  name?: string;
  defaultValue?: SpeciesId;
  plural?: boolean;
  className?: string;
}) {
  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger id={id} className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SPECIES.map((species) => (
          <SelectItem key={species.id} value={species.id}>
            {plural ? species.plural : species.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
