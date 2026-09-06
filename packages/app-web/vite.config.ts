import type { UserConfig } from "vite";
import { defineConfig } from "vite";
import purgeCss from "vite-plugin-purgecss";
import svgr from "vite-plugin-svgr";
import { CURSORLESS_ORG_URL } from "@cursorless/lib-common";
import {
  viteHtmlParams,
  vitePreactAlias,
  purgeCssOptions,
} from "@cursorless/lib-common/vite";
import {
  DESCRIPTION,
  TITLE,
  VIDEO_SHARE_THUMBNAIL_HEIGHT,
  VIDEO_SHARE_THUMBNAIL_URL,
  VIDEO_SHARE_THUMBNAIL_WIDTH,
  YOUTUBE_SLUG,
} from "./src/constants";

// oxlint-disable-next-line import/no-default-export
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
      alias: vitePreactAlias,
    },

    plugins: [
      purgeCss(purgeCssOptions),
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
    .split(/\r?\n/u)
    .map((l) => l.trimEnd())
    .map((l) => (l.length > maxLength ? `${l.slice(0, maxLength)}...` : l));
  return lines.join("\n");
}
