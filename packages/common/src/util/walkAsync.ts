import * as path from "path";
import { readdir } from "fs/promises";
import { flatten } from "lodash";

/**
 * Note: Returns full paths
 * Based on https://gist.github.com/kethinov/6658166#gistcomment-1941504
 * @param dir
 * @param fileEnding If defined, only return files ending with this string. Eg `.txt`
 * @returns
 */
export const walkFiles = async (
  dir: string,
  fileEnding?: string,
): Promise<string[]> => {
  const dirEntries = await readdir(dir, { withFileTypes: true });

  const files = flatten(
    await Promise.all(
      dirEntries.map(async (dirent) => {
        const filePath = path.join(dir, dirent.name);
        return dirent.isDirectory() ? await walkFiles(filePath) : [filePath];
      }),
    ),
  );

  if (fileEnding != null) {
    return files.filter((file) => file.endsWith(fileEnding));
  }

  return files;
};
