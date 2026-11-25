"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Gauge, LayoutDashboard, Music2, Timer, UserRound } from "lucide-react";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

const items = [
  { href: "/hoc", label: vi.nav.learn, icon: BookOpen },
  { href: "/hop-am", label: vi.nav.chords, icon: Music2 },
  { href: "/cong-cu/len-day", label: vi.nav.tuner, icon: Gauge },
  { href: "/cong-cu/may-dem-nhip", label: vi.nav.metronome, icon: Timer },
  { href: "/tong-quan", label: vi.nav.dashboard, icon: LayoutDashboard },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Top bar on desktop, bottom tab bar on mobile (one-handed use next to the guitar). */
export function SiteNav() {
  const pathname = usePathname() ?? "/";

  return (
    <>
      <header className="bg-background/90 sticky top-0 z-40 border-b backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span aria-hidden className="text-xl">
              🎸
            </span>
            {vi.site.name}
          </Link>
          <div className="flex items-center gap-1">
            <nav aria-label={vi.nav.mainNav} className="hidden md:block">
              <ul className="flex items-center gap-1">
                {items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isActive(pathname, href) ? "page" : undefined}
                      className={cn(
                        "text-muted-foreground hover:bg-muted hover:text-foreground inline-flex min-h-11 items-center rounded-md px-3 text-sm font-medium",
                        isActive(pathname, href) && "bg-muted text-foreground",
                      )}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <Link
              href="/tai-khoan"
              aria-label={vi.nav.account}
              className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-11 items-center justify-center rounded-full"
            >
              <UserRound aria-hidden className="size-5" />
            </Link>
          </div>
        </div>
      </header>

      <nav
        aria-label={vi.nav.mainNav}
        className="bg-background/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-5">
          {items.map(({ href, label, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={isActive(pathname, href) ? "page" : undefined}
                className={cn(
                  "text-muted-foreground flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px]",
                  isActive(pathname, href) && "text-primary font-semibold",
                )}
              >
                <Icon aria-hidden className="size-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
