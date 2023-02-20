import * as path from "path";
import { readdir } from "fs/promises";
import { flatten } from "lodash";

/**
 * Note: Returns full paths
 * Based on https://gist.github.com/kethinov/6658166#gistcomment-1941504
 * @param dir
 * @param filelist
 * @returns
 */
export const walkFiles = async (dir: string): Promise<string[]> => {
  const dirEntries = await readdir(dir, { withFileTypes: true });

  return flatten(
    await Promise.all(
      dirEntries.map(async (dirent) => {
        const filePath = path.join(dir, dirent.name);
        return dirent.isDirectory() ? await walkFiles(filePath) : [filePath];
      }),
    ),
  );
};
