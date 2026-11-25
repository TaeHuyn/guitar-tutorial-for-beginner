"use client";

import { Button } from "@/components/ui/button";
import { vi } from "@/i18n/vi";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-md py-16 text-center" role="alert">
      <h1 className="text-2xl font-bold">{vi.common.errorGeneric}</h1>
      <Button type="button" size="lg" className="mt-6 min-h-11 px-5" onClick={reset}>
        {vi.common.retry}
      </Button>
    </div>
  );
}
