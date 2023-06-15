import { showError, Snippet, SnippetMap, walkFiles } from "@cursorless/common";
import { readFile, stat } from "fs/promises";
import { max } from "lodash";
import { join } from "path";
import { ide } from "../singletons/ide.singleton";
import { mergeStrict } from "../util/object";
import { mergeSnippets } from "./mergeSnippets";

const CURSORLESS_SNIPPETS_SUFFIX = ".cursorless-snippets";
const SNIPPET_DIR_REFRESH_INTERVAL_MS = 1000;

interface DirectoryErrorMessage {
  directory: string;
  errorMessage: string;
}

/**
 * Handles all cursorless snippets, including core, third-party and
 * user-defined.  Merges these collections and allows looking up snippets by
 * name.
 */
export class Snippets {
  private coreSnippets!: SnippetMap;
  private thirdPartySnippets: Record<string, SnippetMap> = {};
  private userSnippets!: SnippetMap[];

  private mergedSnippets!: SnippetMap;

  private userSnippetsDir?: string;

  /**
   * The maximum modification time of any snippet in user snippets dir.
   *
   * This variable will be set to -1 if no user snippets have yet been read or
   * if the user snippets path has changed.
   *
   * This variable will be set to 0 if the user has no snippets dir configured and
   * we've already set userSnippets to {}.
   */
  private maxSnippetMtimeMs: number = -1;

  /**
   * If the user has misconfigured their snippet dir, then we keep track of it
   * so that we can show them the error message if we can't find a snippet
   * later, and so that we don't show them the same error message every time
   * we try to poll the directory.
   */
  private directoryErrorMessage: DirectoryErrorMessage | null | undefined =
    null;

  constructor() {
    this.updateUserSnippetsPath();

    this.updateUserSnippets = this.updateUserSnippets.bind(this);
    this.registerThirdPartySnippets =
      this.registerThirdPartySnippets.bind(this);

    const timer = setInterval(
      this.updateUserSnippets,
      SNIPPET_DIR_REFRESH_INTERVAL_MS,
    );

    ide().disposeOnExit(
      ide().configuration.onDidChangeConfiguration(() => {
        if (this.updateUserSnippetsPath()) {
          this.updateUserSnippets();
        }
      }),
      {
        dispose() {
          clearInterval(timer);
        },
      },
    );
  }

  async init() {
    const extensionPath = ide().assetsRoot;
    const snippetsDir = join(extensionPath, "cursorless-snippets");
    const snippetFiles = await getSnippetPaths(snippetsDir);
    this.coreSnippets = mergeStrict(
      ...(await Promise.all(
        snippetFiles.map(async (path) =>
          JSON.parse(await readFile(path, "utf8")),
        ),
      )),
    );
    await this.updateUserSnippets();
  }

  /**
   * Updates the userSnippetsDir field if it has change, returning a boolean
   * indicating whether there was an update.  If there was an update, resets the
   * maxSnippetMtime to -1 to ensure snippet update.
   * @returns Boolean indicating whether path has changed
   */
  private updateUserSnippetsPath(): boolean {
    const newUserSnippetsDir = ide().configuration.getOwnConfiguration(
      "experimental.snippetsDir",
    );

    if (newUserSnippetsDir === this.userSnippetsDir) {
      return false;
    }

    // Reset mtime to -1 so that next time we'll update the snippets
    this.maxSnippetMtimeMs = -1;

    this.userSnippetsDir = newUserSnippetsDir;

    return true;
  }

  async updateUserSnippets() {
    let snippetFiles: string[];
    try {
      snippetFiles = this.userSnippetsDir
        ? await getSnippetPaths(this.userSnippetsDir)
        : [];
    } catch (err) {
      if (this.directoryErrorMessage?.directory !== this.userSnippetsDir) {
        // NB: We suppress error messages once we've shown it the first time
        // because we poll the directory every second and want to make sure we
        // don't show the same error message repeatedly
        const errorMessage = `Error with cursorless snippets dir "${
          this.userSnippetsDir
        }": ${(err as Error).message}`;

        showError(ide().messages, "snippetsDirError", errorMessage);

        this.directoryErrorMessage = {
          directory: this.userSnippetsDir!,
          errorMessage,
        };
      }

      this.userSnippets = [];
      this.mergeSnippets();

      return;
    }

    this.directoryErrorMessage = null;

    const maxSnippetMtime =
      max(
        (await Promise.all(snippetFiles.map((file) => stat(file)))).map(
          (stat) => stat.mtimeMs,
        ),
      ) ?? 0;

    if (maxSnippetMtime <= this.maxSnippetMtimeMs) {
      return;
    }

    this.maxSnippetMtimeMs = maxSnippetMtime;

    this.userSnippets = await Promise.all(
      snippetFiles.map(async (path) => {
        try {
          const content = await readFile(path, "utf8");

          if (content.length === 0) {
            // Gracefully handle an empty file
            return {};
          }

          return JSON.parse(content);
        } catch (err) {
          showError(
            ide().messages,
            "snippetsFileError",
            `Error with cursorless snippets file "${path}": ${
              (err as Error).message
            }`,
          );

          // We don't want snippets from all files to stop working if there is
          // a parse error in one file, so we just effectively ignore this file
          // once we've shown an error message
          return {};
        }
      }),
    );

    this.mergeSnippets();
  }

  /**
   * Allows extensions to register third-party snippets.  Calling this function
   * twice with the same extensionId will replace the older snippets.
   *
   * Note that third-party snippets take precedence over core snippets, but
   * user snippets take precedence over both.
   * @param extensionId The id of the extension registering the snippets.
   * @param snippets The snippets to be registered.
   */
  registerThirdPartySnippets(extensionId: string, snippets: SnippetMap) {
    this.thirdPartySnippets[extensionId] = snippets;
    this.mergeSnippets();
  }

  /**
   * Merge core, third-party, and user snippets, with precedence user > third
   * party > core.
   */
  private mergeSnippets() {
    this.mergedSnippets = mergeSnippets(
      this.coreSnippets,
      this.thirdPartySnippets,
      this.userSnippets,
    );
  }

  /**
   * Looks in merged collection of snippets for a snippet with key
   * `snippetName`. Throws an exception if the snippet of the given name could
   * not be found
   * @param snippetName The name of the snippet to look up
   * @returns The named snippet
   */
  getSnippetStrict(snippetName: string): Snippet {
    const snippet = this.mergedSnippets[snippetName];

    if (snippet == null) {
      let errorMessage = `Couldn't find snippet ${snippetName}. `;

      if (this.directoryErrorMessage != null) {
        errorMessage += `This could be due to: ${this.directoryErrorMessage.errorMessage}.`;
      }

      throw Error(errorMessage);
    }

    return snippet;
  }
}

async function getSnippetPaths(snippetsDir: string) {
  return (await walkFiles(snippetsDir)).filter((path) =>
    path.endsWith(CURSORLESS_SNIPPETS_SUFFIX),
  );
}
