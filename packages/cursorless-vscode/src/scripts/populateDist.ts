// Copies files into `dist` directory for packaging
import { getEnvironmentVariableStrict } from "@cursorless/common";
import { exec } from "child_process";
import { copy, exists } from "fs-extra";
import { lstat, mkdir, readFile, writeFile } from "fs/promises";
import * as path from "path";
import * as semver from "semver";
import { promisify } from "util";

/**
 * If `true`, then we override the extension id in order to install the
 * extension locally without new Cursorless version releases clobbering it.
 */
const isForLocalInstall = process.argv.includes("--local-install");

const isDeploy = "CURSORLESS_DEPLOY" in process.env;
const isCi = "CI" in process.env;

interface Asset {
  source?: string;

  /**
   * If `generateContent` is defined, then it will be called in order to
   * generate the content of the destination file. Mutually exclusive with
   * {@link source}.
   * @returns The content to write to the destination file, or `undefined` if
   * the destination file should not be created.
   */
  generateContent?(): Promise<string | undefined>;

  destination: string;

  /**
   * Indicates that it is ok for the file to not exist in dev mode
   */
  optionalInDev?: boolean;

  /**
   * Can be used to transform the given file's json before writing it to the
   * destination
   * @param json The input json
   * @returns The transformed json
   */
  transformJson?: (json: any) => Promise<any>;
}

const assets: Asset[] = [
  { source: "../../CHANGELOG.md", destination: "CHANGELOG.md" },
  { source: "../../LICENSE", destination: "LICENSE" },
  { source: "../../NOTICE.md", destination: "NOTICE.md" },
  { source: "../../README.md", destination: "README.md" },
  {
    source: "../cheatsheet-local/dist/index.html",
    destination: "cheatsheet.html",
    // We allow this to be optional in dev mode because it is expensive to
    // build, and is only used when they say "cursorless cheatsheet".
    optionalInDev: true,
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
  {
    async generateContent() {
      // In CI, we generate a file called `build-info.json` that contains
      // information about the build for provenance. We include the git sha of
      // the current branch as well as the build URL.
      if (!isCi) {
        return undefined;
      }

      // These are automatically set for Github actions
      // See https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
      const repository = getEnvironmentVariableStrict("GITHUB_REPOSITORY");
      const runId = getEnvironmentVariableStrict("GITHUB_RUN_ID");
      const githubBaseUrl = getEnvironmentVariableStrict("GITHUB_SERVER_URL");

      return JSON.stringify({
        gitSha: (await runCommand("git rev-parse HEAD")).trim(),
        buildUrl: `${githubBaseUrl}/${repository}/actions/runs/${runId}`,
      });
    },
    destination: "build-info.json",
  },
  {
    source: "package.json",
    destination: "package.json",
    async transformJson(json: any) {
      if (isForLocalInstall) {
        json.name = "cursorless-development";
        json.displayName = "Cursorless (development)";
      } else {
        json.name = "cursorless";
      }

      json.dependencies = [];
      json.devDependencies = {
        ["@types/vscode"]: json.devDependencies["@types/vscode"],
      };

      delete json.private;

      if (isDeploy) {
        // During deployment, we change the package version so that the patch
        // number is the number of commits on the current branch
        const { major, minor } = semver.parse(json.version)!;
        const commitCount = (
          await runCommand("git rev-list --count HEAD")
        ).trim();
        json.version = `${major}.${minor}.${commitCount}`;
      }

      return json;
    },
  },
];

const sourceRoot = ".";
const destinationRoot = "dist";

// Iterate over assets, copying each file to the destination.  Any parent
// directories will be created as necessary, and source directories will be
// copied recursively.
async function run() {
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
          if (generateContent == null) {
            throw Error(
              "Must specify either `source` or `generateContent`, but not both",
            );
          }

          const content = await generateContent();

          if (content != null) {
            console.log(`Generating ${fullDestination}`);
            await writeFile(fullDestination, content);
          } else {
            console.log(`Skipping ${fullDestination}`);
          }

          return;
        }

        if (generateContent != null) {
          throw Error(
            "Must specify either `source` or `generateContent`, but not both",
          );
        }

        const fullSource = path.join(sourceRoot, source);

        if (!(await exists(fullSource))) {
          if (isCi || !optionalInDev) {
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
            JSON.stringify(await transformJson(json), null, 2),
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

const execAsync = promisify(exec);

async function runCommand(command: string) {
  const { stdout, stderr } = await execAsync(command);

  if (stderr) {
    throw new Error(stderr);
  }

  return stdout;
}

run();
