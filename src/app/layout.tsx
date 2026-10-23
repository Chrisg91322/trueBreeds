import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
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
    default: "TrueBreeds — The CRM for livestock, dog, and cat breeders",
    template: "%s · TrueBreeds",
  },
  description:
    "A CRM for livestock, dog, and cat breeders. Inquiries, animals, and a website we set up and keep current — quick and easy setup.",
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
    title: "TrueBreeds — The CRM for livestock, dog, and cat breeders",
    description:
      "Inquiries, animals, and a website we set up and keep current. Quick and easy setup for livestock, dog, and cat breeders.",
    images: [{ url: "/branding/pupsAndKittens4.png", width: 1200, height: 630, alt: "TrueBreeds" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueBreeds — The CRM for livestock, dog, and cat breeders",
    description:
      "Inquiries, animals, and a website we set up and keep current. Quick and easy setup for livestock, dog, and cat breeders.",
    images: ["/branding/pupsAndKittens4.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
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
        <Analytics />
      </body>
    </html>
  );
}
