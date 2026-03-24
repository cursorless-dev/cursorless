import * as path from "node:path";

export function toPosixPath(p: string) {
  return p.split(path.sep).join(path.posix.sep);
}
