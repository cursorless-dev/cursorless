import {
  cursorlessCommandDescriptions,
  cursorlessCommandIds,
} from "@cursorless/common";
import * as semver from "semver";
import { Context } from "./context";
import { runCommand } from "./runCommand";

export async function transformPackageJson(
  { isForLocalInstall, isDeploy }: Context,
  json: any,
) {
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

  json.contributes.commands = Object.entries(cursorlessCommandDescriptions).map(
    ([id, command]) => ({
      command: id,
      title: command.title,
      enablement: command.isVisible ? "true" : "false",
    }),
  );

  json.activationEvents = [
    "onLanguage",
    ...cursorlessCommandIds.map((id) => `onCommand:${id}`),
  ];

  delete json.private;

  if (isDeploy) {
    // During deployment, we change the package version so that the patch
    // number is the number of commits on the current branch
    const { major, minor } = semver.parse(json.version)!;
    const commitCount = (await runCommand("git rev-list --count HEAD")).trim();
    json.version = `${major}.${minor}.${commitCount}`;
  } else {
    const gitSha = (await runCommand("git rev-parse --short HEAD")).trim();
    json.version = `${json.version}-${gitSha}`;
  }

  return json;
}
