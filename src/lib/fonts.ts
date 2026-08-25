import {
  Fraunces,
  Inter,
  Manrope,
  Source_Sans_3,
} from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const SITE_FONT_VARIABLES = [
  fraunces.variable,
  inter.variable,
  manrope.variable,
  sourceSans.variable,
].join(" ");

const FONT_STACKS: Record<string, string> = {
  Fraunces: `var(--font-fraunces), serif`,
  Inter: `var(--font-inter), sans-serif`,
  Manrope: `var(--font-manrope), sans-serif`,
  "Source Sans 3": `var(--font-source-sans), sans-serif`,
};

export function fontStack(fontName: string) {
  return FONT_STACKS[fontName] ?? `var(--font-inter), sans-serif`;
}
