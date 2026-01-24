import { execSync } from "node:child_process";
import * as path from "node:path";

export interface GitInfo {
  remoteUrl?: string;
  headSha?: string;
  relativePath?: string;
  defaultBranch?: string;
}

export function getGitInfo(absolutePath: string): GitInfo {
  const cwd = path.dirname(absolutePath);
  try {
    const remoteUrl = tryGetValue("git config --get remote.origin.url", cwd);
    const headSha = tryGetValue("git rev-parse HEAD", cwd);
    const root = tryGetValue("git rev-parse --show-toplevel", cwd);
    const relativePath =
      root != null
        ? path.relative(root, absolutePath).replace(/\\/g, "/")
        : undefined;
    const defaultBranch = sanitizeDefaultBranch(
      tryGetValue("git symbolic-ref --short refs/remotes/origin/HEAD", cwd),
    );

    return {
      remoteUrl: remoteUrl ?? undefined,
      headSha: headSha ?? undefined,
      relativePath,
      defaultBranch,
    };
  } catch (_err) {
    return {};
  }
}

function sanitizeDefaultBranch(value: string | null): string | undefined {
  if (value == null || value.length === 0) {
    return undefined;
  }
  return value.startsWith("origin/") ? value.slice("origin/".length) : value;
}

function tryGetValue(command: string, cwd: string): string | null {
  try {
    return execSync(command, {
      cwd,
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    return null;
  }
}
