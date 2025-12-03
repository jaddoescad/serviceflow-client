import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    files: [
      "src/components/**/*.{ts,tsx}",
      "src/features/**/*.{ts,tsx}",
      "src/hooks/**/*.{ts,tsx}",
      "src/app/(dashboard)/**/*.{ts,tsx}",
      "src/app/(auth)/**/*.{ts,tsx}",
      "src/app/company/**/*.{ts,tsx}",
      "src/app/organizations/**/*.{ts,tsx}",
    ],
    rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                {
                  group: [
                    "@/server/**",
                    "@/server/data/**",
                    "@/server/api-services/**",
                    "@/app/api/_server/**",
                  ],
                  message:
                    "Client UI must call the API (/api/**); do not import server-only modules directly.",
                },
              ],
            },
      ],
    },
  },
];

export default eslintConfig;
