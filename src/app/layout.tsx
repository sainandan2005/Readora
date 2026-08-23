import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import Providers from "@/components/Providers";
import Nav from "@/components/Nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Readora — Read freely",
    template: "%s — Readora",
  },
  description:
    "A quiet home for public-domain books. Automatic progress saving, bookmarks, and a reader designed for long evenings.",
};

const themeInit = `(function(){try{var t=localStorage.getItem("readora-theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}if(t==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] paper-noise">
        <Providers>
          <Nav />
          {children}
        </Providers>
      </body>
    </html>
  );
}
