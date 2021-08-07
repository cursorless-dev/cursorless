import { statSync } from "fs";
import * as path from "path";
import { readdirSync } from "fs";

/**
 * Note: Returns full paths
 * From https://gist.github.com/kethinov/6658166#gistcomment-1941504
 * @param dir
 * @returns
 */
export const walkFilesSync = (dir: string): string[] => {
  let files: string[] = [];

  readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    const filePath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      files = files.concat(walkFilesSync(filePath));
    } else {
      files.push(filePath);
    }
  });

  return files;
};

/**
 * Note: Returns relative paths
 * @param dir
 * @returns
 */
export const walkDirsSync = (dir: string): string[] => {
  // Inner function returns absolute paths
  const walkDirsSyncInner = (dir: string): string[] => {
    let dirs: string[] = [];

    readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
      if (dirent.isDirectory()) {
        const dirPath = path.join(dir, dirent.name);
        dirs.push(dirPath);
        dirs = dirs.concat(walkDirsSyncInner(dirPath));
      }
    });

    return dirs;
  };
  // Convert to relative paths
  return walkDirsSyncInner(dir).map((absPath) => path.relative(dir, absPath));
};
