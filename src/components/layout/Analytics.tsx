"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/** page_view on every route; tool_open / lesson_start derived from the path. */
export function Analytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    track("page_view", pathname);
    if (pathname.startsWith("/cong-cu/") || pathname === "/hop-am") track("tool_open", pathname);
    if (/^\/hoc\/level-\d\/[^/]+$/.test(pathname)) track("lesson_start", pathname);
  }, [pathname]);
  return null;
}
