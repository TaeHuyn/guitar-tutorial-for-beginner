import type { Metadata } from "next";
import { SignInForm } from "@/components/auth/SignInForm";
import { vi } from "@/i18n/vi";

export const metadata: Metadata = { title: vi.auth.title };

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl font-bold tracking-tight">{vi.auth.title}</h1>
      <p className="text-muted-foreground mt-2 mb-6">{vi.auth.intro}</p>
      <SignInForm />
    </div>
  );
}
