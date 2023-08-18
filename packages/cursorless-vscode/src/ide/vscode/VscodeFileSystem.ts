import {
  Disposable,
  FileSystem,
  PathChangeListener,
  walkFiles,
} from "@cursorless/common";
import { stat } from "fs/promises";
import { max } from "lodash";

export class VscodeFileSystem implements FileSystem {
  watchDir(path: string, onDidChange: PathChangeListener): Disposable {
    // Just poll for now; we can take advantage of VSCode's sophisticated
    // watcher later. Note that we would need to do a version check, as VSCode
    // file watcher is only available in more recent versions of VSCode.
    return new PollingFileSystemWatcher(path, onDidChange);
  }
}

const CHECK_INTERVAL_MS = 1000;

class PollingFileSystemWatcher implements Disposable {
  private maxMtimeMs: number = -1;
  private timer: NodeJS.Timer;

  constructor(
    private readonly path: string,
    private readonly onDidChange: PathChangeListener,
  ) {
    this.checkForChanges = this.checkForChanges.bind(this);
    this.timer = setInterval(this.checkForChanges, CHECK_INTERVAL_MS);
  }

  private async checkForChanges() {
    const paths = await walkFiles(this.path);

    const maxMtime =
      max(
        (await Promise.all(paths.map((file) => stat(file)))).map(
          (stat) => stat.mtimeMs,
        ),
      ) ?? 0;

    if (maxMtime > this.maxMtimeMs) {
      this.maxMtimeMs = maxMtime;
      this.onDidChange();
    }
  }

  dispose() {
    clearInterval(this.timer);
  }
}
