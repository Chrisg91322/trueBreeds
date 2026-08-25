"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Tenant } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { THEME_PRESETS, type ThemePresetKey } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { updateThemeSettings } from "@/lib/actions/settings";

export function ThemeSettingsForm({ tenant }: { tenant: Tenant }) {
  const [preset, setPreset] = useState<ThemePresetKey>(tenant.themePreset);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateThemeSettings({
          themePreset: preset,
          accentColor: String(form.get("accentColor") || THEME_PRESETS[preset].defaultAccent),
          logoUrl: String(form.get("logoUrl") || "") || undefined,
          heroImageUrl: String(form.get("heroImageUrl") || "") || undefined,
          tagline: String(form.get("tagline") || "") || undefined,
        });
        toast.success("Theme saved");
      } catch {
        toast.error("Failed to save theme");
      }
    });
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>Theme preset</Label>
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Object.values(THEME_PRESETS).map((t) => (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => setPreset(t.key)}
                  className={cn(
                    "rounded-xl border-2 p-3 text-left transition-colors",
                    preset === t.key ? "border-primary" : "border-transparent bg-muted/50"
                  )}
                >
                  <div className="flex gap-1">
                    <span
                      className="h-6 w-6 rounded-full"
                      style={{ background: t.background, border: "1px solid #ddd" }}
                    />
                    <span className="h-6 w-6 rounded-full" style={{ background: t.defaultAccent }} />
                  </div>
                  <div className="mt-2 text-sm font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="accentColor">Accent color</Label>
            <Input
              id="accentColor"
              name="accentColor"
              type="color"
              defaultValue={tenant.accentColor || THEME_PRESETS[preset].defaultAccent}
              className="mt-1.5 h-10 w-20 p-1"
            />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              name="tagline"
              defaultValue={tenant.tagline ?? ""}
              className="mt-1.5"
              placeholder="Health-tested, home-raised Labradors"
            />
          </div>
          <div>
            <Label htmlFor="logoUrl">Logo image URL</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              type="url"
              defaultValue={tenant.logoUrl ?? ""}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="heroImageUrl">Hero photo URL</Label>
            <Input
              id="heroImageUrl"
              name="heroImageUrl"
              type="url"
              defaultValue={tenant.heroImageUrl ?? ""}
              className="mt-1.5"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
