import type { Metadata } from "next";
import { AccountSettings } from "@/components/progress/AccountSettings";
import { vi } from "@/i18n/vi";

export const metadata: Metadata = { title: vi.account.title };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{vi.account.title}</h1>
      <AccountSettings />
    </div>
  );
}
