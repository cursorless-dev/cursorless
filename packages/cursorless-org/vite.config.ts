import { compile } from "@mdx-js/mdx";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { PluginOption } from "vite";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

const references = JSON.parse(
  readFileSync(join(__dirname, "tsconfig.json"), "utf-8"),
).references.map(({ path }: { path: string }) => join(__dirname, path));

export default defineConfig(() => {
  return {
    build: {
      outDir: "out",
    },

    plugins: [mdxPlugin(), react({ include: /\.(mdx|js|jsx|ts|tsx)$/ })],

    define: {
      __ENABLEMENT_GROUP_EMAIL__: JSON.stringify(
        parseEmailAddress(process.env["ENABLEMENT_GROUP_EMAIL"]),
      ),
    },

    resolve: {
      conditions: ["cursorless:bundler"],
    },

    server: {
      fs: {
        allow: [__dirname, ...references],
      },
    },
  };
});

function mdxPlugin(): PluginOption {
  return {
    name: "cursorless-org-mdx",
    enforce: "pre",
    async transform(source, id) {
      if (!id.endsWith(".mdx")) {
        return null;
      }

      const file = await compile(source, {
        providerImportSource: "@mdx-js/react",
      });

      return {
        code: String(file),
        map: null,
      };
    },
  };
}

function parseEmailAddress(email: string | undefined) {
  const [username = "user", domain = "example.com"] = (email ??
    "user@example.com").split("@");
  return { username, domain };
}
