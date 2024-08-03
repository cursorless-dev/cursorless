import { getEnvironmentVariableStrict } from "@cursorless/common";
import { runCommand } from "./runCommand";
import type { Context } from "./context";

export async function generateBuildInfo({ isCi }: Context) {
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
}
