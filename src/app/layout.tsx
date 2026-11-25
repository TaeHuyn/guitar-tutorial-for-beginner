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
    <html lang="vi" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
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
              className="mx-auto w-full max-w-5xl flex-1 px-4 pt-6 pb-24 md:pb-12"
            >
              {children}
            </main>
          </ProgressProvider>
        </ServiceWorker>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
