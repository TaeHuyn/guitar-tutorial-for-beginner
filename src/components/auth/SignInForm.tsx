"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { vi } from "@/i18n/vi";

function callbackUrl() {
  return `${window.location.origin}/auth/callback`;
}

/** Magic-link email + Google sign-in (FR-025). */
export function SignInForm() {
  const supabase = getBrowserSupabase();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!supabase) {
    return (
      <p
        className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm"
        data-accounts-disabled
      >
        Tính năng tài khoản chưa được bật trên máy chủ này. Tiến độ của bạn vẫn được lưu trên thiết
        bị.
      </p>
    );
  }

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage(vi.auth.invalidEmail);
      return;
    }
    setStatus("sending");
    const { error } = await supabase!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl(), shouldCreateUser: true },
    });
    if (error) {
      setStatus("error");
      setMessage(vi.common.errorGeneric);
    } else {
      setStatus("sent");
      setMessage(vi.auth.checkInbox);
    }
  }

  async function google() {
    await supabase!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={sendLink} className="space-y-3" noValidate>
        <Label htmlFor="email">{vi.auth.email}</Label>
        <Input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 text-base"
          aria-invalid={status === "error"}
          aria-describedby="email-status"
        />
        <Button type="submit" size="lg" className="min-h-12 w-full" disabled={status === "sending"}>
          <Mail aria-hidden />
          {vi.auth.sendLink}
        </Button>
        <p
          id="email-status"
          role="status"
          className={status === "error" ? "text-destructive text-sm" : "text-success text-sm"}
        >
          {message}
        </p>
      </form>

      <div className="text-muted-foreground flex items-center gap-3 text-sm">
        <span className="bg-border h-px flex-1" />
        {vi.auth.or}
        <span className="bg-border h-px flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="min-h-12 w-full"
        onClick={google}
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5">
          <path
            fill="#EA4335"
            d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.3 12 2.3 6.6 2.3 2.3 6.6 2.3 12s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.5 0-.6-.1-1.1-.2-1.6H12z"
          />
        </svg>
        {vi.auth.google}
      </Button>
    </div>
  );
}
