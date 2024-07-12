import { Disposable } from "@cursorless/common";

/**
 * Provides raw tree-sitter queries. These are usually read from `.scm` files
 * on the filesystem, but this class abstracts away the details of how the
 * queries are stored.
 */
export interface RawTreeSitterQueryProvider {
  /**
   * Listen for changes to queries. For now, this is only used during
   * development, when we want to hot-reload queries.
   */
  onChanges(listener: () => void): Disposable;

  /**
   * Return the raw text of the tree-sitter query of the given name. The query
   * name is the name of one of the `.scm` files in our monorepo.
   */
  readQuery(name: string): Promise<string | undefined>;
}
