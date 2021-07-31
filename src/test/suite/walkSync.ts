import { statSync } from "fs";
import * as path from "path";
import { readdirSync } from "fs";

/**
 * From https://gist.github.com/kethinov/6658166#gistcomment-1941504
 * @param dir
 * @param filelist
 * @returns
 */
export const walkFilesSync = (dir: string, filelist: string[] = []) => {
  readdirSync(dir).forEach((file) => {
    filelist = statSync(path.join(dir, file)).isDirectory()
      ? walkFilesSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

export const walkDirsSync = (dir: string, filelist: string[] = []) => {
  readdirSync(dir).forEach((name) => {
    const file = path.join(dir, name);
    filelist = statSync(file).isDirectory()
      ? filelist.concat(file, ...walkFilesSync(file, filelist))
      : filelist;
  });
  return filelist
    .filter((file) => statSync(file).isDirectory())
    .map((file) => path.relative(dir, file));
};
