import * as semver from "semver";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile } from "fs/promises";

const execAsync = promisify(exec);

/**
 * Prepares the directory for extension publication. Does the following:
 *
 * 1. Changes the package version so that the patch number is the number of
 *    commits on the current branch
 * 2. Writes a file called `build-info.json` for provenance
 */
async function main() {
  const { major, minor } = semver.parse(process.env.npm_package_version)!;

  const commitCount = await runCommand("git rev-list --count HEAD");

  const newVersion = `${major}.${minor}.${commitCount}`;

  await runCommand(`npm --no-git-tag-version version ${newVersion}`);

  // These are automatically set for Github actions
  // See https://docs.github.com/en/actions/learn-github-actions/environment-variables#default-environment-variables
  const repository = process.env["GITHUB_REPOSITORY"];
  const runId = process.env["GITHUB_RUN_ID"];
  const githubBaseUrl = process.env["GITHUB_SERVER_URL"];

  if (repository == null) {
    throw new Error("Missing environment variable GITHUB_REPOSITORY");
  }

  if (runId == null) {
    throw new Error("Missing environment variable GITHUB_RUN_ID");
  }

  if (githubBaseUrl == null) {
    throw new Error("Missing environment variable GITHUB_SERVER_URL");
  }

  await writeFile(
    "build-info.json",
    JSON.stringify({
      gitSha: (await runCommand("git rev-parse HEAD")).trim(),
      buildUrl: `${githubBaseUrl}/${repository}/actions/runs/${runId}`,
    }),
  );
}

async function runCommand(command: string) {
  const { stdout, stderr } = await execAsync(command);

  if (stderr) {
    throw new Error(stderr);
  }

  return stdout;
}

main();
