import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/ui/JsonLd";
import { PreviewBanner } from "@/features/preview/PreviewBanner";
import { SITE } from "@/lib/site";

// Display serif: Light for monumental headings, Medium for small headings. Preloaded.
const cormorant = localFont({
  src: [
    { path: "./fonts/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "./fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

// Italic accent face: used for a few words per page, so it is not preloaded.
const cormorantItalic = localFont({
  src: [{ path: "./fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" }],
  variable: "--font-cormorant-italic",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  title: { default: `${SITE.name} | ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${cormorantItalic.variable} ${inter.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="label sr-only z-50 bg-ivory px-5 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <PreviewBanner />
        <Header />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>
        <Footer />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE.name,
            url: SITE.origin,
            publisher: { "@type": "Organization", name: SITE.name, url: SITE.origin, email: SITE.email },
          }}
        />
      </body>
    </html>
  );
}
