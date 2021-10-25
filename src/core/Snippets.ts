import { readFile, stat } from "fs/promises";
import { cloneDeep, max, merge } from "lodash";
import { join } from "path";
import { workspace } from "vscode";
import { walkFiles } from "../testUtil/walkAsync";
import { Snippet, SnippetMap } from "../typings/snippet";
import { Graph } from "../typings/Types";
import { mergeStrict } from "../util/object";

const SNIPPET_DIR_REFRESH_INTERVAL_MS = 1000;

/**
 * Handles all cursorless snippets, including core, third-party and
 * user-defined.  Merges these collections and allows looking up snippets by
 * name.
 */
export class Snippets {
  private coreSnippets!: SnippetMap;
  private thirdPartySnippets: Record<string, SnippetMap> = {};
  private userSnippets!: SnippetMap;

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

  constructor(private graph: Graph) {
    this.updateUserSnippetsPath();

    this.updateUserSnippets = this.updateUserSnippets.bind(this);
    this.registerThirdPartySnippets =
      this.registerThirdPartySnippets.bind(this);

    const timer = setInterval(
      this.updateUserSnippets,
      SNIPPET_DIR_REFRESH_INTERVAL_MS
    );

    graph.extensionContext.subscriptions.push(
      workspace.onDidChangeConfiguration(() => {
        if (this.updateUserSnippetsPath()) {
          this.updateUserSnippets();
        }
      }),
      {
        dispose() {
          clearInterval(timer);
        },
      }
    );
  }

  async init() {
    const extensionPath = this.graph.extensionContext.extensionPath;
    const snippetsDir = join(extensionPath, "cursorless-snippets");
    const snippetFiles = await walkFiles(snippetsDir);
    this.coreSnippets = mergeStrict(
      ...(await Promise.all(
        snippetFiles.map(async (path) =>
          JSON.parse(await readFile(path, "utf8"))
        )
      ))
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
    const newUserSnippetsDir = workspace
      .getConfiguration("cursorless.experimental")
      .get<string>("snippetsDir");

    if (newUserSnippetsDir === this.userSnippetsDir) {
      return false;
    }

    // Reset mtime to -1 so that next time we'll update the snippets
    this.maxSnippetMtimeMs = -1;

    this.userSnippetsDir = newUserSnippetsDir;

    return true;
  }

  async updateUserSnippets() {
    const snippetFiles = this.userSnippetsDir
      ? await walkFiles(this.userSnippetsDir)
      : [];

    const maxSnippetMtime =
      max(
        (await Promise.all(snippetFiles.map((file) => stat(file)))).map(
          (stat) => stat.mtimeMs
        )
      ) ?? 0;

    if (maxSnippetMtime <= this.maxSnippetMtimeMs) {
      return;
    }

    this.maxSnippetMtimeMs = maxSnippetMtime;

    this.userSnippets = mergeStrict(
      ...(await Promise.all(
        snippetFiles.map(async (path) =>
          JSON.parse(await readFile(path, "utf8"))
        )
      ))
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
    this.mergedSnippets = {};

    // We make a list of all entries from all sources, in order of increasing
    // precedence: user > third party > core.
    const entries = [
      ...Object.entries(cloneDeep(this.coreSnippets)),
      ...Object.values(this.thirdPartySnippets).flatMap((snippets) =>
        Object.entries(cloneDeep(snippets))
      ),
      ...Object.entries(cloneDeep(this.userSnippets)),
    ];

    entries.forEach(([key, value]) => {
      if (this.mergedSnippets.hasOwnProperty(key)) {
        const { definitions, ...rest } = value;
        const mergedSnippet = this.mergedSnippets[key];

        // NB: We make sure that the new definitions appear before the previous
        // ones so that they take precedence
        mergedSnippet.definitions = definitions.concat(
          ...mergedSnippet.definitions
        );

        merge(mergedSnippet, rest);
      } else {
        this.mergedSnippets[key] = value;
      }
    });
  }

  /**
   * Looks in merged collection of snippets for a snippet with key
   * `snippetName`
   * @param snippetName The name of the snippet to look up
   * @returns The named snippet, or undefined if not found
   */
  getSnippet(snippetName: string): Snippet | undefined {
    return this.mergedSnippets[snippetName];
  }
}
