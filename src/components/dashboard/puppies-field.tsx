"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PuppyDraft = {
  id?: string;
  name: string;
  dateOfBirth: string;
  color: string;
  coatType: string;
  sex: "male" | "female";
};

type Row = PuppyDraft & { key: string };

function toRow(puppy: PuppyDraft, key: string): Row {
  return {
    key,
    id: puppy.id,
    name: puppy.name,
    dateOfBirth: puppy.dateOfBirth,
    color: puppy.color,
    coatType: puppy.coatType,
    sex: puppy.sex,
  };
}

export function PuppiesField({ defaultPuppies = [] }: { defaultPuppies?: PuppyDraft[] }) {
  const [puppies, setPuppies] = useState<Row[]>(() =>
    defaultPuppies.map((puppy, index) => toRow(puppy, puppy.id || `new-${index}`))
  );

  function update(key: string, patch: Partial<PuppyDraft>) {
    setPuppies((current) =>
      current.map((puppy) => (puppy.key === key ? { ...puppy, ...patch } : puppy))
    );
  }

  const payload = puppies.map((puppy) => ({
    id: puppy.id,
    name: puppy.name,
    dateOfBirth: puppy.dateOfBirth,
    color: puppy.color,
    coatType: puppy.coatType,
    sex: puppy.sex,
  }));

  return (
    <div className="space-y-3">
      <div>
        <Label>Puppies</Label>
        <p className="mt-1 text-xs text-muted-foreground">
          Add each puppy&apos;s name, date of birth, color, and coat type. They&apos;re saved as
          their own animals and linked to this parent. Remove a row to delete that puppy.
        </p>
      </div>
      <input type="hidden" name="puppiesJson" value={JSON.stringify(payload)} />

      {puppies.map((puppy, index) => (
        <div key={puppy.key} className="space-y-3 rounded-xl border bg-muted/30 p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">Puppy {index + 1}</p>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setPuppies((current) => current.filter((item) => item.key !== puppy.key))}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`${puppy.key}-name`}>Name</Label>
              <Input
                id={`${puppy.key}-name`}
                className="mt-1.5"
                value={puppy.name}
                onChange={(event) => update(puppy.key, { name: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`${puppy.key}-dob`}>Date of birth</Label>
              <Input
                id={`${puppy.key}-dob`}
                className="mt-1.5"
                type="date"
                value={puppy.dateOfBirth}
                onChange={(event) => update(puppy.key, { dateOfBirth: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`${puppy.key}-color`}>Color</Label>
              <Input
                id={`${puppy.key}-color`}
                className="mt-1.5"
                value={puppy.color}
                onChange={(event) => update(puppy.key, { color: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`${puppy.key}-coat`}>Coat type</Label>
              <Input
                id={`${puppy.key}-coat`}
                className="mt-1.5"
                placeholder="Smooth, long, wire…"
                value={puppy.coatType}
                onChange={(event) => update(puppy.key, { coatType: event.target.value })}
              />
            </div>
            <div>
              <Label htmlFor={`${puppy.key}-sex`}>Sex</Label>
              <select
                id={`${puppy.key}-sex`}
                className="mt-1.5 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={puppy.sex}
                onChange={(event) =>
                  update(puppy.key, { sex: event.target.value === "male" ? "male" : "female" })
                }
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() =>
          setPuppies((current) => [
            ...current,
            toRow(
              { name: "", dateOfBirth: "", color: "", coatType: "", sex: "female" },
              `new-${crypto.randomUUID()}`
            ),
          ])
        }
      >
        <Plus className="h-4 w-4" />
        Add puppy
      </Button>
    </div>
  );
}
