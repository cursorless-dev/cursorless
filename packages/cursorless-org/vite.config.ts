import { CURSORLESS_ORG_URL, viteHtmlParams } from "@cursorless/common";
import react from "@vitejs/plugin-react";
import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";
import {
  DESCRIPTION,
  TITLE,
  VIDEO_SHARE_THUMBNAIL_HEIGHT,
  VIDEO_SHARE_THUMBNAIL_URL,
  VIDEO_SHARE_THUMBNAIL_WIDTH,
  YOUTUBE_SLUG,
} from "./src/constants";

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

    plugins: [
      react(),
      svgr(),
      viteHtmlParams({
        CURSORLESS_ORG_URL,
        TITLE,
        DESCRIPTION,
        YOUTUBE_SLUG,
        VIDEO_SHARE_THUMBNAIL_URL,
        VIDEO_SHARE_THUMBNAIL_WIDTH,
        VIDEO_SHARE_THUMBNAIL_HEIGHT,
      }),
    ],
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
