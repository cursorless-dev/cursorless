import { Disposable } from "@cursorless/common";

export interface RawTreeSitterQueryProvider {
  /**
   * Listen for changes to language definitions
   */
  onChanges(listener: () => void): Disposable;

  /**
   * Read a query definition. The query name is the name of one of our `.scm` files.
   */
  readQuery(name: string): Promise<string | undefined>;
}
