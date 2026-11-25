import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-6xl" aria-hidden>
        🎸
      </p>
      <h1 className="mt-4 text-2xl font-bold">{vi.common.notFoundTitle}</h1>
      <p className="text-muted-foreground mt-2">{vi.common.notFoundBody}</p>
      <Link href="/" className={cn(buttonVariants({ size: "lg" }), "mt-6 min-h-11 px-5")}>
        {vi.common.goHome}
      </Link>
    </div>
  );
}
