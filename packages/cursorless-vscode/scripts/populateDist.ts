// Copies files into `dist` directory for packaging
import { copy } from "fs-extra";
import { lstat, mkdir, readFile, writeFile } from "fs/promises";
import * as path from "path";

interface Asset {
  source: string;
  destination: string;
  ciOnly?: boolean;
  transformJson?: (json: any) => any;
}

const assets: Asset[] = [
  { source: "../../CHANGELOG.md", destination: "CHANGELOG.md" },
  { source: "../../LICENSE", destination: "LICENSE" },
  { source: "../../NOTICE.md", destination: "NOTICE.md" },
  { source: "../../README.md", destination: "README.md" },
  {
    source: "../../cursorless-nx/dist/apps/cheatsheet-local/index.html",
    destination: "cursorless-nx/dist/apps/cheatsheet-local/index.html",
  },
  { source: "../../cursorless-snippets", destination: "cursorless-snippets" },
  {
    source: "../../fonts/cursorless-glyph.svg",
    destination: "fonts/cursorless-glyph.svg",
  },
  {
    source: "../../fonts/cursorless.woff",
    destination: "fonts/cursorless.woff",
  },
  { source: "../../images/hats", destination: "images/hats" },
  { source: "../../images/icon.png", destination: "images/icon.png" },
  { source: "../../schemas", destination: "schemas" },
  {
    source: "../../third-party-licenses.csv",
    destination: "third-party-licenses.csv",
  },
  { source: "build-info.json", destination: "build-info.json", ciOnly: true },
  {
    source: "package.json",
    destination: "package.json",
    transformJson(json: any) {
      json.name = "cursorless";
      return json;
    },
  },
];

const sourceRoot = ".";
const destinationRoot = "dist";

const isCI = "CI" in process.env;

// Iterate over assets, copying each file to the destination.  Any parent
// directories will be created as necessary, and source directories will be
// copied recursively.
async function run() {
  await Promise.all(
    assets.map(async ({ source, destination, ciOnly, transformJson }) => {
      if (!isCI && ciOnly) {
        return;
      }

      const fullSource = path.join(sourceRoot, source);
      const fullDestination = path.join(destinationRoot, destination);
      await mkdir(path.dirname(fullDestination), { recursive: true });
      if (transformJson != null) {
        console.log(`Transforming ${fullSource} to ${fullDestination}`);
        const json = JSON.parse(await readFile(fullSource, "utf8"));
        await writeFile(
          fullDestination,
          JSON.stringify(transformJson(json), null, 2),
        );
        return;
      }
      console.log(`Copying ${fullSource} to ${fullDestination}`);
      // If directory, copy recursively
      if ((await lstat(fullSource)).isDirectory()) {
        await mkdir(fullDestination, { recursive: true });
      }
      await copy(fullSource, fullDestination);
    }),
  );
}

run();
