import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Constitution IV: audio must be scheduled on the AudioContext clock, never with setInterval.
    files: ["src/lib/audio/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "CallExpression[callee.name='setInterval']",
          message: "Không dùng setInterval để phát âm — dùng lập lịch theo AudioContext.currentTime.",
        },
        {
          selector: "CallExpression[callee.property.name='setInterval']",
          message: "Không dùng setInterval để phát âm — dùng lập lịch theo AudioContext.currentTime.",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/sw.js",
    "public/swe-worker*.js",
    "playwright-report/**",
    "test-results/**",
    ".specify/**",
    ".claude/**",
  ]),
]);

export default eslintConfig;
