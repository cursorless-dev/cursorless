import path from "path";

export function toPosixPath(p: string) {
  return p.split(path.sep).join(path.posix.sep);
}
