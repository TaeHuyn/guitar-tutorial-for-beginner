import { createSerwistRoute } from "@serwist/turbopack";

const revision = process.env.VERCEL_GIT_COMMIT_SHA ?? `${Date.now()}`;

/** Serves the bundled service worker at /serwist/sw.js. */
const route = createSerwistRoute({
  swSrc: "src/app/sw.ts",
  useNativeEsbuild: true,
  // Practice tools must open offline after the first visit (FR-034).
  additionalPrecacheEntries: ["/cong-cu/len-day", "/cong-cu/may-dem-nhip", "/hop-am", "/"].map(
    (url) => ({
      url,
      revision,
    }),
  ),
});

// Cache Components forbids the `dynamic`/`dynamicParams`/`revalidate` segment configs,
// so only the handler and static params are exported.
export const generateStaticParams = route.generateStaticParams;
export const GET = route.GET;
