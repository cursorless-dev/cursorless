// Copies files into `dist` directory for packaging
import { copy, exists } from "fs-extra";
import { lstat, mkdir, readFile, writeFile } from "fs/promises";
import * as path from "path";
import { assets } from "./assets";
import { Context } from "./context";

// Iterate over assets, copying each file to the destination.  Any parent
// directories will be created as necessary, and source directories will be
// copied recursively.
export async function run() {
  const context: Context = {
    isForLocalInstall: process.argv.includes("--local-install"),
    isDeploy: "CURSORLESS_DEPLOY" in process.env,
    isCi: "CI" in process.env,
  };

  const sourceRoot = ".";
  const destinationRoot = "dist";

  await Promise.all(
    assets.map(
      async ({
        source,
        generateContent,
        destination,
        transformJson,
        optionalInDev,
      }) => {
        if (
          (source == null && generateContent == null) ||
          (source != null && generateContent != null)
        ) {
          throw Error(
            "Must specify either `source` or `generateContent`, but not both",
          );
        }

        const fullDestination = path.join(destinationRoot, destination);
        await mkdir(path.dirname(fullDestination), { recursive: true });

        if (source == null) {
          const content = await generateContent!(context);

          if (content != null) {
            console.log(`Generating ${fullDestination}`);
            await writeFile(fullDestination, content);
          } else {
            console.log(`Skipping ${fullDestination}`);
          }

          return;
        }

        const fullSource = path.join(sourceRoot, source);

        if (!(await exists(fullSource))) {
          if (context.isCi || !optionalInDev) {
            throw Error(`Missing asset: ${fullSource}`);
          }
          console.warn(`Missing asset: ${fullSource}`);
          return;
        }

        if (transformJson != null) {
          console.log(`Transforming ${fullSource} to ${fullDestination}`);
          const json = JSON.parse(await readFile(fullSource, "utf8"));
          await writeFile(
            fullDestination,
            JSON.stringify(await transformJson(context, json), null, 2),
          );
          return;
        }

        console.log(`Copying ${fullSource} to ${fullDestination}`);
        // If directory, copy recursively
        if ((await lstat(fullSource)).isDirectory()) {
          await mkdir(fullDestination, { recursive: true });
        }
        await copy(fullSource, fullDestination);
      },
    ),
  );
}
