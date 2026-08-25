import type { CSSProperties } from "react";
import { fontStack } from "@/lib/fonts";

export type ThemePresetKey =
  | "heritage"
  | "meadow"
  | "modern"
  | "rustic"
  | "monochrome";

export type ThemeDefinition = {
  key: ThemePresetKey;
  label: string;
  description: string;
  background: string;
  surface: string;
  ink: string;
  mutedInk: string;
  border: string;
  defaultAccent: string;
  headingFont: string;
  bodyFont: string;
};

/**
 * 3–5 selectable presets (per spec, no free-form page builder in v1).
 * Each preset defines the neutral palette + font pairing; the breeder layers
 * their own accent color, logo, and photography on top.
 */
export const THEME_PRESETS: Record<ThemePresetKey, ThemeDefinition> = {
  heritage: {
    key: "heritage",
    label: "Heritage",
    description: "Warm cream & walnut — classic, editorial kennel feel.",
    background: "#FBF7F1",
    surface: "#FFFFFF",
    ink: "#2A231C",
    mutedInk: "#6B5F52",
    border: "#E7DCCB",
    defaultAccent: "#7C5C42",
    headingFont: "Fraunces",
    bodyFont: "Inter",
  },
  meadow: {
    key: "meadow",
    label: "Meadow",
    description: "Soft sage & linen — light, airy, farm-fresh.",
    background: "#F6F7F2",
    surface: "#FFFFFF",
    ink: "#232922",
    mutedInk: "#5E6B58",
    border: "#DDE5D3",
    defaultAccent: "#5B7553",
    headingFont: "Fraunces",
    bodyFont: "Inter",
  },
  modern: {
    key: "modern",
    label: "Modern",
    description: "Crisp white & graphite — minimal, gallery-like.",
    background: "#FFFFFF",
    surface: "#F7F7F8",
    ink: "#111114",
    mutedInk: "#5A5A63",
    border: "#E7E7EC",
    defaultAccent: "#1D4ED8",
    headingFont: "Manrope",
    bodyFont: "Inter",
  },
  rustic: {
    key: "rustic",
    label: "Rustic",
    description: "Deep barnwood & cream — cozy, homestead charm.",
    background: "#F5EFE6",
    surface: "#FFFBF4",
    ink: "#2E1F14",
    mutedInk: "#6E5A46",
    border: "#E3D2B8",
    defaultAccent: "#8A3B2B",
    headingFont: "Fraunces",
    bodyFont: "Source Sans 3",
  },
  monochrome: {
    key: "monochrome",
    label: "Monochrome",
    description: "Black, white & one accent — bold, high-contrast.",
    background: "#FFFFFF",
    surface: "#F4F4F4",
    ink: "#0A0A0A",
    mutedInk: "#525252",
    border: "#E5E5E5",
    defaultAccent: "#B91C1C",
    headingFont: "Manrope",
    bodyFont: "Inter",
  },
};

export function getThemeCssVars(preset: ThemePresetKey, accentColor: string) {
  const theme = THEME_PRESETS[preset] ?? THEME_PRESETS.heritage;
  return {
    "--site-bg": theme.background,
    "--site-surface": theme.surface,
    "--site-ink": theme.ink,
    "--site-muted-ink": theme.mutedInk,
    "--site-border": theme.border,
    "--site-accent": accentColor || theme.defaultAccent,
    "--site-heading-font": fontStack(theme.headingFont),
    "--site-body-font": fontStack(theme.bodyFont),
  } as CSSProperties;
}
