import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import remarkGfm from "remark-gfm";
import path from "node:path";

export default defineConfig({
  plugins: [{ enforce: "pre", ...mdx({ providerImportSource: "@mdx-js/react", remarkPlugins: [remarkGfm] }) }, react()],
  resolve: {
    alias: {
      "@content": path.resolve(import.meta.dirname, "content"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    setupFiles: ["tests/setup.ts"],
    globals: false,
    projects: [
      { extends: true, test: { name: "node", include: ["tests/unit/**/*.test.ts"], environment: "node" } },
      { extends: true, test: { name: "dom", include: ["tests/unit/**/*.test.tsx"], environment: "jsdom" } },
    ],
  },
});
