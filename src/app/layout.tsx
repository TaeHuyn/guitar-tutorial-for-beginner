import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Be_Vietnam_Pro, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/layout/SiteNav";
import { ProgressProvider } from "@/components/progress/ProgressProvider";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { Analytics } from "@/components/layout/Analytics";
import { vi } from "@/i18n/vi";
import "./globals.css";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: vi.site.name, template: `%s · ${vi.site.name}` },
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: vi.site.name, statusBarStyle: "default" },
  description: vi.site.tagline,
  applicationName: vi.site.name,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1f1914" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      // Browser extensions (dark-mode, translators…) often add attributes to <html> before React hydrates.
      suppressHydrationWarning
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#noi-dung"
          className="bg-primary text-primary-foreground sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
        >
          {vi.site.skipToContent}
        </a>
        <ServiceWorker>
          <ProgressProvider>
            <SiteNav />
            <main
              id="noi-dung"
              className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-10 md:pb-12"
            >
              {children}
            </main>
            <footer className="text-muted-foreground mx-auto w-full max-w-5xl border-t px-4 pt-4 pb-24 text-xs md:pb-6">
              Âm thanh guitar: bộ âm thanh “Musyng Kite” (acoustic guitar steel) qua{" "}
              <a
                href="https://github.com/gleitz/midi-js-soundfonts"
                className="underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                midi-js-soundfonts
              </a>
              , giấy phép{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/3.0/deed.vi"
                className="underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC BY-SA 3.0
              </a>
              .
            </footer>
          </ProgressProvider>
        </ServiceWorker>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
