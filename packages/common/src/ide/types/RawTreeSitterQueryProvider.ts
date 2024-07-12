import { Disposable } from "@cursorless/common";

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
