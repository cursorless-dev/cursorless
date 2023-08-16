import { Messages, State, showInfo } from "@cursorless/common";
import { ide } from "./singletons/ide.singleton";
import { URI } from "vscode-uri";
import * as semver from "semver";

const WHATS_NEW = "What's new?";

function roundDown(version: string) {
  const { major, minor } = semver.parse(version)!;
  return `${major}.${minor}.0`;
}

export class ReleaseNotes {
  constructor(
    private messages: Messages,
    private globalState: State,
  ) {}

  async maybeShow() {
    const latestVersion = roundDown(ide().version);
    const seenReleaseNotesVersion = this.globalState.get(
      "seenReleaseNotesVersion",
    );

    if (
      !ide().isFocused ||
      (seenReleaseNotesVersion != null &&
        semver.gte(seenReleaseNotesVersion, latestVersion))
    ) {
      return;
    }

    await this.globalState.set("seenReleaseNotesVersion", latestVersion);

    const result = await showInfo(
      this.messages,
      "releaseNotes",
      `Cursorless version ${latestVersion} has been released!`,
      WHATS_NEW,
    );

    if (result === WHATS_NEW) {
      await ide().openExternal(
        URI.parse(
          `https://cursorless.org/docs/user/release-notes/${latestVersion}/`,
        ),
      );
    }
  }
}
