import * as os from "node:os";
import * as childProcess from "node:child_process";

const MAX_OUTPUT_TO_EAT = 20;

/**
 * A wrapper around the Talon REPL that allows us to send commands to Talon
 */
export class TalonRepl {
  private child?: childProcess.ChildProcessWithoutNullStreams;

  action(action: string): Promise<string> {
    return this.command(`actions.${action}`);
  }

  start(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const path = getReplPath();
      this.child = childProcess.spawn(path);

      if (!this.child.stdin) {
        reject("stdin is null");
        return;
      }

      // The first data from the repl is always: Talon REPL | Python 3.9.13 ...
      this.child.stdout.once("data", resolve);
    });
  }

  stop(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.child != null) {
        this.child.on("close", () => {
          this.child = undefined;
          resolve();
        });

        this.child.stdin.end();
      } else {
        resolve();
      }
    });
  }

  private command(command: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      if (this.child != null) {
        this.child.stdout.once("data", (data) => {
          resolve(data.toString());
        });

        this.child.stdin.write(command);
        this.child.stdin.write("\n");
      } else {
        reject();
      }
    });
  }

  /**
   * Eat all output from the repl until it is responsive again. Prints the
   * output to the console.
   */
  async eatOutput(): Promise<void> {
    let data: string;
    let tryCount = 0;

    while (true) {
      // As a hack, we just put `[]` in the REPL, which should cause it to print
      // `[]` back to us (we could put any Python value in there; `[]` is just a
      // simple one). We keep doing this until we get `[]` back, which means the
      // REPL is responsive again.
      data = await this.command("[]");

      if (data.trim() === "[]") {
        break;
      }

      console.log(data.trim());

      if (tryCount++ > MAX_OUTPUT_TO_EAT) {
        throw Error("Too much output to eat");
      }
    }
  }
}

function getReplPath() {
  return os.platform() === "win32"
    ? `${os.homedir()}\\AppData\\Roaming\\talon\\venv\\3.11\\Scripts\\repl.bat`
    : `${os.homedir()}/.talon/.venv/bin/repl`;
}
