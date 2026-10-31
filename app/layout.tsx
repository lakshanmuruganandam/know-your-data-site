import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Instrument_Serif, JetBrains_Mono, Syne } from "next/font/google";
import { Providers, Stage } from "@/components/Providers";
import { Navigation } from "@/components/Navigation";
import { GhostLens } from "@/components/GhostLens";
import { ShadowDock } from "@/components/ShadowDock";
import { Footer } from "@/components/Footer";
import "./globals.css";

// next/font downloads these at build time and serves them from our own origin — no Google requests at runtime.
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["600", "700", "800"] });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono" });
const serif = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: "Know Your Data — see what the web sees",
  description:
    "An interactive privacy intelligence platform by the Millennium Fellowship 2026 cohort at IIT Delhi Abu Dhabi: live browser audit, corporate exploit vault, the economics of data exploitation, a 90-minute defense toolkit and a UAE PDPL request generator.",
  authors: [{ name: "Lakshan Muruganandam" }, { name: "Aditya Rajan Sharma" }, { name: "Krishna" }],
};

export const viewport: Viewport = { themeColor: "#07080B", colorScheme: "dark" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // reading the request makes every page render per-request, so Next stamps its scripts with the CSP nonce
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" className={`${syne.variable} ${geist.variable} ${mono.variable} ${serif.variable}`}>
      <body className="grain min-h-dvh">
        <noscript>
          <style nonce={nonce}>{"#kyd-intro{display:none}"}</style>
        </noscript>
        <div aria-hidden className="vignette" />
        <Providers>
          <Navigation />
          <Stage>{children}</Stage>
          <Footer />
          <ShadowDock />
          <GhostLens />
        </Providers>
      </body>
    </html>
  );
}
