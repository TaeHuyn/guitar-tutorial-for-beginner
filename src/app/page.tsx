import Link from "next/link";
import { BookOpen, Gauge, Music2, Timer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getLevels, getPath, lessonHref } from "@/content/loader";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

const tools = [
  { href: "/cong-cu/len-day", label: vi.nav.tuner, body: "Lên dây chuẩn bằng micro", icon: Gauge },
  {
    href: "/cong-cu/may-dem-nhip",
    label: vi.metronome.title,
    body: "Giữ nhịp đều khi tập",
    icon: Timer,
  },
  {
    href: "/hop-am",
    label: vi.chord.libraryTitle,
    body: "84 hợp âm có sơ đồ và âm mẫu",
    icon: Music2,
  },
] as const;

export default function HomePage() {
  const first = getPath()[0];
  const levels = getLevels().filter((l) => !l.comingSoon);

  return (
    <div className="mx-auto max-w-3xl">
      <section className="py-6 sm:py-12">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">{vi.site.name}</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          {vi.home.heroTitle}
        </h1>
        <p className="text-muted-foreground mt-4 max-w-2xl text-lg">{vi.home.heroBody}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {first && (
            <Link
              href={lessonHref(first)}
              className={cn(buttonVariants({ size: "lg" }), "min-h-12 px-6 text-base")}
            >
              <BookOpen aria-hidden />
              {vi.home.start}
            </Link>
          )}
          <Link
            href="/hoc"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "min-h-12 px-6 text-base",
            )}
          >
            {vi.learn.pathTitle}
          </Link>
        </div>
      </section>

      <section aria-labelledby="lo-trinh" className="mt-4">
        <h2 id="lo-trinh" className="sr-only">
          {vi.learn.pathTitle}
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2">
          {levels.map((l) => (
            <li key={l.id} className="bg-card rounded-2xl border p-5">
              <p className="text-muted-foreground text-sm">
                {vi.learn.level} {l.id}
              </p>
              <p className="text-lg font-semibold">{l.title}</p>
              <p className="text-muted-foreground mt-1 text-sm">{l.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="cong-cu" className="mt-10">
        <h2 id="cong-cu" className="text-xl font-semibold">
          {vi.home.toolsTitle}
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {tools.map(({ href, label, body, icon: Icon }) => (
            <li key={href}>
              <Link
                href={href}
                className="bg-card hover:bg-muted flex h-full items-start gap-3 rounded-2xl border p-4"
              >
                <Icon aria-hidden className="text-primary mt-0.5 size-5 shrink-0" />
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="text-muted-foreground block text-sm">{body}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
