import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig((): UserConfig => {
  return {
    build: {
      outDir: "out",

      rolldownOptions: {
        onLog(level, log, defaultHandler) {
          if (level === "warn") {
            log.message = formatMessage(log.message);
          }
          defaultHandler(level, log);
        },
      },
    },

    resolve: {
      conditions: ["cursorless:bundler"],
    },

    plugins: [react(), svgr()],
  };
});

function formatMessage(message: string): string {
  const maxLength = 1000;
  const lines = message
    .split("\r?\n")
    .map((l) => l.trimEnd())
    .map((l) => (l.length > maxLength ? l.slice(0, maxLength) + "..." : l));
  return lines.join("\n");
}
