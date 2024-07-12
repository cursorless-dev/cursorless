import {
  getCursorlessRepoRoot,
  type Disposable,
  type FileSystem,
  type IDE,
  type RawTreeSitterQueryProvider,
  Notifier,
} from "@cursorless/common";
import * as path from "pathe";

export class FileSystemRawTreeSitterQueryProvider
  implements RawTreeSitterQueryProvider
{
  private queryDir: string;
  private notifier: Notifier = new Notifier();
  private disposables: Disposable[] = [];

  constructor(
    ide: IDE,
    private fileSystem: FileSystem,
  ) {
    // Use the repo root as the root for development mode, so that we can
    // we can make hot-reloading work for the queries
    this.queryDir =
      ide.runMode === "development"
        ? path.join(getCursorlessRepoRoot(), "queries")
        : "queries";

    if (ide.runMode === "development") {
      this.disposables.push(
        fileSystem.watchDir(this.queryDir, () => {
          this.notifier.notifyListeners();
        }),
      );
    }
  }

  onChanges = this.notifier.registerListener;

  readQuery(filename: string): Promise<string | undefined> {
    const queryPath = path.join(this.queryDir, filename);
    return this.fileSystem.readBundledFile(queryPath);
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
