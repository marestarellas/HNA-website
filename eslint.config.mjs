import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),

  // ---------------------------------------------------------------------
  // Ported from the standalone map prototype (see CLAUDE.md §9, 2026-08-05).
  //
  // These two files were written against a looser config in their own repo
  // and came across essentially verbatim, which was deliberate: the port
  // changed behaviour in as few places as possible so that any regression
  // would be traceable to the move rather than to a simultaneous cleanup.
  // The findings below are real but stylistic — none of them is a bug, and
  // the page renders and talks to D1 correctly.
  //
  // Worth paying down, in rough priority order:
  //   * `react-hooks/static-components` — a couple of components are declared
  //     inside their parent's body, so they remount their subtree on every
  //     render. The genuine (if mild) performance issue in here.
  //   * `no-explicit-any` in the server — mostly D1 row shapes and model
  //     outputs that deserve real interfaces.
  //   * `set-state-in-effect` / `exhaustive-deps` — need case-by-case reading;
  //     several are intentional one-shot syncs.
  // Downgraded to warnings rather than disabled, so they stay visible.
  {
    files: ["src/server/app.ts", "src/components/stories/ContributionMap.jsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react/no-unescaped-entities": "warn",
      "prefer-const": "warn",
    },
  },
]);

export default eslintConfig;
