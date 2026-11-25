import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import { withSerwist } from "@serwist/turbopack";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withMDX = createMDX({
  // Plugins are passed by name so the config stays serialisable for Turbopack.
  options: { remarkPlugins: [["remark-gfm", {}]] },
});

export default withSerwist(withMDX(nextConfig));
