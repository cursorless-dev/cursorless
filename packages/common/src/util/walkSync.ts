import * as path from "pathe";
import { readdirSync } from "fs";

/**
 * Note: Returns full paths
 * From https://gist.github.com/kethinov/6658166#gistcomment-1941504
 * @param dir
 * @param filelist
 * @returns
 */
export const walkFilesSync = (dir: string): string[] => {
  let filelist: string[] = [];
  readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
    const filePath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      filelist = filelist.concat(walkFilesSync(filePath));
    } else {
      filelist.push(filePath);
    }
  });
  return filelist;
};

/**
 * Note: Returns relative paths
 * @param dir
 * @param dirlist
 * @returns
 */
export const walkDirsSync = (dir: string): string[] => {
  // Inner function returns absolute paths
  const walkDirsSyncInner = (dir: string): string[] => {
    let dirlist: string[] = [];
    readdirSync(dir, { withFileTypes: true }).forEach((dirent) => {
      if (dirent.isDirectory()) {
        const dirPath = path.join(dir, dirent.name);
        dirlist.push(dirPath);
        dirlist = dirlist.concat(walkDirsSyncInner(dirPath));
      }
    });
    return dirlist;
  };
  // Convert to relative paths
  return walkDirsSyncInner(dir).map((absPath) => path.relative(dir, absPath));
};
