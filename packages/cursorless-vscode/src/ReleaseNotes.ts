import type { ExtensionContext } from "vscode";
import type { Messages } from "@cursorless/common";
import { showInfo } from "@cursorless/common";
import * as semver from "semver";
import type { VscodeApi } from "@cursorless/vscode-common";
import { URI } from "vscode-uri";

/**
 * The key to use in global storage to detect when Cursorless version number has
 * increased, so we can show release notes.
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
    private vscodeApi: VscodeApi,
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

    if (storedVersion == null) {
      // This is their initial install; note down initial install version, but
      // don't show release notes
      await this.extensionContext.globalState.update(
        VERSION_KEY,
        currentVersion,
      );
      return;
    }

    if (
      // Don't show it in all the windows
      !this.vscodeApi.window.state.focused ||
      // Don't show it if they've seen this version before
      !semver.lt(storedVersion, currentVersion)
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
      await this.vscodeApi.env.openExternal(
        URI.parse(
          `https://cursorless.org/docs/user/release-notes/${currentVersion}/`,
        ),
      );
    }
  }
}

function getCursorlessVersion(extensionContext: ExtensionContext): string {
  return extensionContext.extension.packageJSON.version;
}
