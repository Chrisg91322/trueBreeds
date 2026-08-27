import type { Metadata } from "next";
import { Geist_Mono, Nunito, Quicksand } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SITE_FONT_VARIABLES } from "@/lib/fonts";
import { appOrigin } from "@/lib/seo";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const origin = appOrigin();

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: "TrueBreeds — Professional websites for dog & cat breeders",
    template: "%s · TrueBreeds",
  },
  description:
    "Launch a professional kennel website in minutes. Manage litters, waitlists, deposits, and buyers from one dashboard built for dog and cat breeders.",
  keywords: [
    "breeder website",
    "kennel website builder",
    "dog breeder software",
    "cat breeder website",
    "puppy website",
    "litter management",
  ],
  authors: [{ name: "TrueBreeds" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: origin,
    siteName: "TrueBreeds",
    title: "TrueBreeds — Professional websites for dog & cat breeders",
    description:
      "Launch a professional kennel website in minutes. Litters, waitlists, deposits, and growth tools in one place.",
    images: [{ url: "/branding/pupsAndKittens4.png", width: 1200, height: 630, alt: "TrueBreeds" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueBreeds — Professional websites for dog & cat breeders",
    description:
      "Launch a professional kennel website in minutes. Litters, waitlists, deposits, and growth tools in one place.",
    images: ["/branding/pupsAndKittens4.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: { canonical: origin },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

  return (
    <html
      lang="en"
      className={`${nunito.variable} ${quicksand.variable} ${geistMono.variable} ${SITE_FONT_VARIABLES} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delay={150}>
          {children}
          <Toaster richColors position="top-center" />
        </TooltipProvider>
        {gaId ? <GoogleAnalytics measurementId={gaId} /> : null}
      </body>
    </html>
  );
}
