import { Uri, type ExtensionContext } from "vscode";
import { Messages, showInfo } from "@cursorless/common";
import * as semver from "semver";
import { vscodeApi } from "./vscodeApi";

/**
 * The key to use in global storage to track which release notes we've already
 * shown to the user
 */
export const VERSION_KEY = "version";

export const WHATS_NEW = "What's new?";

function roundDown(version: string) {
  const { major, minor } = semver.parse(version)!;
  return `${major}.${minor}.0`;
}

/**
 * Responsible for showing a message to the users when Cursorless has new
 * release notes available.
 */
export class ReleaseNotes {
  constructor(
    private extensionContext: ExtensionContext,
    private messages: Messages,
  ) {}

  /**
   * Shows a message to the users if Cursorless has new release notes available
   * @returns A promise that resolves when the release notes have been shown
   */
  async maybeShow() {
    // Round down because we just use the patch number to enforce monotone
    // version numbers during CD
    const currentVersion = roundDown(
      getCursorlessVersion(this.extensionContext),
    );

    const storedVersion =
      this.extensionContext.globalState.get<string>(VERSION_KEY);

    if (
      // Don't show it in all the windows
      !vscodeApi.window.state.focused ||
      // Don't show it if they've seen this version before
      (storedVersion != null && !semver.lt(storedVersion, currentVersion))
    ) {
      return;
    }

    await this.extensionContext.globalState.update(VERSION_KEY, currentVersion);

    const result = await showInfo(
      this.messages,
      "releaseNotes",
      `Cursorless version ${currentVersion} has been released!`,
      WHATS_NEW,
    );

    if (result === WHATS_NEW) {
      await vscodeApi.env.openExternal(
        Uri.parse(
          `https://cursorless.org/docs/user/release-notes/${currentVersion}/`,
        ),
      );
    }
  }
}

function getCursorlessVersion(extensionContext: ExtensionContext): string {
  return extensionContext.extension.packageJSON.version;
}
