import type { ExtensionContext } from "vscode";
import { Messages, showInfo } from "@cursorless/common";
import { URI } from "vscode-uri";
import * as semver from "semver";
import * as vscode from "vscode";

/**
 * The key to use in global storage to track which release notes we've already
 * shown to the user
 */
export const SEEN_RELEASE_NOTES_VERSION_KEY = "seenReleaseNotesVersion";

const WHATS_NEW = "What's new?";

function roundDown(version: string) {
  const { major, minor } = semver.parse(version)!;
  return `${major}.${minor}.0`;
}

export class ReleaseNotes {
  constructor(
    private extensionContext: ExtensionContext,
    private messages: Messages,
  ) {}

  async maybeShow() {
    // Round down because we just use the patch number to enforce monotone
    // version numbers during CD
    const latestVersion = roundDown(
      getCursorlessVersion(this.extensionContext),
    );

    const seenReleaseNotesVersion =
      this.extensionContext.globalState.get<string>(
        SEEN_RELEASE_NOTES_VERSION_KEY,
      );

    if (
      // Don't show it in all the windows
      !vscode.window.state.focused ||
      // Don't show it if they've seen this version before
      (seenReleaseNotesVersion != null &&
        semver.gte(seenReleaseNotesVersion, latestVersion))
    ) {
      return;
    }

    await this.extensionContext.globalState.update(
      SEEN_RELEASE_NOTES_VERSION_KEY,
      latestVersion,
    );

    const result = await showInfo(
      this.messages,
      "releaseNotes",
      `Cursorless version ${latestVersion} has been released!`,
      WHATS_NEW,
    );

    if (result === WHATS_NEW) {
      await vscode.env.openExternal(
        URI.parse(
          `https://cursorless.org/docs/user/release-notes/${latestVersion}/`,
        ),
      );
    }
  }
}

function getCursorlessVersion(extensionContext: ExtensionContext): string {
  return extensionContext.extension.packageJSON.version;
}
