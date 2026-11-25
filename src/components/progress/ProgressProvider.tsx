"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import {
  getProgressSnapshot,
  markLessonComplete,
  mergeGuestProgress,
  unmarkLessonComplete,
} from "@/actions/progress";
import { deletePracticeSession, logPracticeSession } from "@/actions/practice";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  GUEST_KEY,
  ProgressStore,
  userKey,
  type RemoteApi,
  type Snapshot,
  type StorageLike,
} from "@/lib/progress/progress-store";
import { browserTimeZone } from "@/lib/progress/streaks";

export interface ProgressUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

interface ProgressContextValue {
  ready: boolean;
  accountsEnabled: boolean;
  user: ProgressUser | null;
  timeZone: string;
  store: ProgressStore | null;
  snapshot: Snapshot;
  setTimeZone: (tz: string) => void;
  setDisplayName: (name: string) => void;
  /** Runs `fn` with the store now, or as soon as it exists. */
  withStore: (fn: (s: ProgressStore) => void) => void;
}

const EMPTY: Snapshot = { version: 1, completed: {}, sessions: [], pendingOps: [] };
const ProgressContext = createContext<ProgressContextValue | null>(null);

const remote: RemoteApi = {
  markLessonComplete: (i) => markLessonComplete(i),
  unmarkLessonComplete: (i) => unmarkLessonComplete(i),
  logPracticeSession: (s) => logPracticeSession(s),
  deletePracticeSession: (i) => deletePracticeSession(i),
};

function safeStorage(): StorageLike {
  try {
    const k = "gt:v1:probe";
    window.localStorage.setItem(k, "1");
    window.localStorage.removeItem(k);
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return {
      getItem: (key) => mem.get(key) ?? null,
      setItem: (key, value) => void mem.set(key, value),
      removeItem: (key) => void mem.delete(key),
    };
  }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const accountsEnabled = isSupabaseConfigured();
  const [store, setStore] = useState<ProgressStore | null>(null);
  const [user, setUser] = useState<ProgressUser | null>(null);
  const [ready, setReady] = useState(false);
  const [timeZone, setTz] = useState("Asia/Ho_Chi_Minh");

  // Build the right store for the current auth state.
  useEffect(() => {
    let cancelled = false;
    const storage = safeStorage();
    const tz = browserTimeZone();
    // Auth can report the same user several times (getSession + SIGNED_IN after a magic link).
    // Only the latest identity is initialised, and stale async steps are dropped.
    let currentIdentity: string | null = null;
    let generation = 0;

    async function init(sessionUser: { id: string; email?: string | null } | null) {
      const identity = sessionUser ? `user:${sessionUser.id}` : "guest";
      if (identity === currentIdentity) return;
      currentIdentity = identity;
      const gen = ++generation;
      const stale = () => cancelled || gen !== generation;

      if (!sessionUser) {
        setUser(null);
        setTz(tz);
        setStore(new ProgressStore({ storage, key: GUEST_KEY, timeZone: tz }));
        setReady(true);
        return;
      }

      const userStore = new ProgressStore({
        storage,
        key: userKey(sessionUser.id),
        timeZone: tz,
        remote,
      });

      // Move guest progress into the account once (FR-026) — before showing account data.
      const guest = new ProgressStore({ storage, key: GUEST_KEY, timeZone: tz }).snapshot();
      const hasGuestData = Object.keys(guest.completed).length > 0 || guest.sessions.length > 0;
      if (hasGuestData) {
        const r = await mergeGuestProgress({
          completed: Object.entries(guest.completed).map(([lessonSlug, e]) => ({
            lessonSlug,
            ...e,
          })),
          sessions: guest.sessions,
        }).catch(() => null);
        if (r?.ok) storage.removeItem(GUEST_KEY);
        if (stale()) return;
      }

      setStore(userStore);
      setUser({ id: sessionUser.id, email: sessionUser.email ?? null, displayName: null });
      setReady(true);

      await userStore.flush();
      const snap = await getProgressSnapshot().catch(() => null);
      if (stale() || !snap?.ok) return;
      userStore.replaceFromServer(snap.data);
      userStore.setTimeZone(snap.data.profile.timezone);
      setTz(snap.data.profile.timezone);
      setUser((u) => (u ? { ...u, displayName: snap.data.profile.displayName } : u));
    }

    if (!accountsEnabled) {
      void init(null);
      return () => {
        cancelled = true;
      };
    }

    // No Supabase session cookie → definitely a guest: start immediately instead of waiting
    // for the auth library, so early clicks are never lost.
    if (!/(^|;\s*)sb-[^=]*-auth-token/.test(document.cookie)) void init(null);

    // Supabase JS is loaded lazily so guests' first paint stays inside the JS budget.
    let unsubscribe = () => {};
    void import("@/lib/supabase/client").then(({ getBrowserSupabase }) => {
      const supabase = getBrowserSupabase();
      if (cancelled) return;
      if (!supabase) return void init(null);
      void supabase.auth.getSession().then(({ data }) => init(data.session?.user ?? null));
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_IN" || event === "SIGNED_OUT") void init(session?.user ?? null);
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [accountsEnabled]);

  // Actions taken before the store exists (e.g. a very fast first click) are replayed.
  const pendingRef = useRef<((s: ProgressStore) => void)[]>([]);
  useEffect(() => {
    if (!store || pendingRef.current.length === 0) return;
    const queued = pendingRef.current.splice(0);
    queued.forEach((fn) => fn(store));
  }, [store]);
  const withStore = useCallback(
    (fn: (s: ProgressStore) => void) => {
      if (store) fn(store);
      else pendingRef.current.push(fn);
    },
    [store],
  );

  // Retry queued operations when the connection comes back.
  useEffect(() => {
    if (!store?.remote) return;
    const onOnline = () => void store.flush();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [store]);

  const subscribe = useCallback(
    (cb: () => void) => (store ? store.subscribe(cb) : () => {}),
    [store],
  );
  const snapshot = useSyncExternalStore(
    subscribe,
    () => store?.snapshot() ?? EMPTY,
    () => EMPTY,
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      ready,
      accountsEnabled,
      user,
      timeZone,
      store,
      snapshot,
      setTimeZone: (tz) => {
        setTz(tz);
        store?.setTimeZone(tz);
      },
      setDisplayName: (name) => setUser((u) => (u ? { ...u, displayName: name } : u)),
      withStore,
    }),
    [ready, accountsEnabled, user, timeZone, store, snapshot, withStore],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgressContext(): ProgressContextValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used inside <ProgressProvider>");
  return ctx;
}
