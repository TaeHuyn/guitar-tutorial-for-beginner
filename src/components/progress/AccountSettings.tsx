"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, TriangleAlert } from "lucide-react";
import { deleteAccount, updateProfile } from "@/actions/account";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProgress } from "@/hooks/useProgress";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { vi } from "@/i18n/vi";
import { cn } from "@/lib/utils";

function timeZones(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf(k: string): string[] }).supportedValuesOf(
      "timeZone",
    );
  } catch {
    return ["Asia/Ho_Chi_Minh"];
  }
}

/** Profile, time zone, sign out and account deletion (FR-031). */
export function AccountSettings() {
  const { ready, user, timeZone, setTimeZone, setDisplayName, store } = useProgress();
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [tz, setTz] = useState<string | null>(null);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleteError, setDeleteError] = useState("");

  if (!ready) return <p className="text-muted-foreground">{vi.common.loading}</p>;
  if (!user) {
    return (
      <div className="bg-card rounded-2xl border p-5">
        <p>{vi.dashboard.guestCta}</p>
        <Link
          href="/dang-nhap"
          className={cn(buttonVariants({ size: "lg" }), "mt-3 min-h-11 px-5")}
        >
          {vi.nav.signIn}
        </Link>
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await updateProfile({
      displayName: (name ?? user!.displayName ?? "").trim() || undefined,
      timezone: tz ?? timeZone,
    });
    if (r.ok) {
      if (r.data.timezone) setTimeZone(r.data.timezone);
      if (r.data.displayName) setDisplayName(r.data.displayName);
      setSaveStatus({ ok: true, text: "Đã lưu." });
    } else {
      setSaveStatus({ ok: false, text: r.message });
    }
  }

  async function signOut() {
    await getBrowserSupabase()?.auth.signOut();
    store?.clear();
    router.push("/");
  }

  async function remove() {
    setDeleting(true);
    setDeleteError("");
    const r = await deleteAccount({ confirm });
    setDeleting(false);
    if (!r.ok) {
      setDeleteError(r.message);
      return;
    }
    store?.clear();
    await getBrowserSupabase()?.auth.signOut();
    router.push("/");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={save} className="bg-card space-y-4 rounded-2xl border p-5">
        <p className="text-muted-foreground text-sm">{user.email}</p>
        <div className="space-y-1.5">
          <Label htmlFor="acc-name">{vi.account.displayName}</Label>
          <Input
            id="acc-name"
            maxLength={50}
            value={name ?? user.displayName ?? ""}
            onChange={(e) => setName(e.target.value)}
            className="h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="acc-tz">{vi.account.timezone}</Label>
          <select
            id="acc-tz"
            value={tz ?? timeZone}
            onChange={(e) => setTz(e.target.value)}
            className="bg-background h-11 w-full rounded-lg border px-3"
          >
            {timeZones().map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" size="lg" className="min-h-11">
          {vi.common.save}
        </Button>
        <p
          role="status"
          className={saveStatus?.ok === false ? "text-destructive text-sm" : "text-success text-sm"}
        >
          {saveStatus?.text}
        </p>
      </form>

      <Button type="button" variant="outline" size="lg" className="min-h-11" onClick={signOut}>
        <LogOut aria-hidden />
        {vi.auth.signOut}
      </Button>

      <section className="border-destructive/40 rounded-2xl border p-5">
        <h2 className="text-destructive flex items-center gap-2 font-semibold">
          <TriangleAlert aria-hidden className="size-5" />
          {vi.account.deleteTitle}
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">{vi.account.deleteBody}</p>
        <Dialog>
          <DialogTrigger render={<Button variant="destructive" className="mt-3 min-h-11" />}>
            {vi.account.deleteTitle}
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>{vi.account.deleteTitle}</DialogTitle>
            <DialogDescription>{vi.account.deleteBody}</DialogDescription>
            <Label htmlFor="acc-confirm">{vi.account.deleteConfirmHint}</Label>
            <Input
              id="acc-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="off"
              className="h-11"
            />
            <p role="alert" className="text-destructive min-h-5 text-sm">
              {deleteError}
            </p>
            <Button
              type="button"
              variant="destructive"
              disabled={confirm !== "XOA TAI KHOAN" || deleting}
              onClick={remove}
            >
              {vi.account.deleteButton}
            </Button>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
