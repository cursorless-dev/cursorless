import { join } from "path";
import { FileHandle, open, unlink } from "fs/promises";
import { tmpdir, userInfo } from "os";
import { HatNonDefaultColor, HatNonDefaultShape } from "./constants";

function getEnablementPath() {
  const info = userInfo();

  // NB: On Windows, uid < 0, and the tmpdir is user-specific, so we don't
  // bother with a suffix
  const suffix = info.uid >= 0 ? `-${info.uid}` : "";

  return join(tmpdir(), `cursorless-enablements${suffix}.json`);
}

async function writeJSON(file: FileHandle, body: unknown) {
  await file.write(`${JSON.stringify(body)}\n`);
}

async function removeOldPathIfExists(path: string) {
  try {
    await unlink(path);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
  }
}

export default async function exposeEnablements(value: {
  colors: HatNonDefaultColor[];
  shapes: HatNonDefaultShape[];
}) {
  const enablementPath = getEnablementPath();

  await removeOldPathIfExists(enablementPath);

  let enablementFile: FileHandle;
  try {
    enablementFile = await open(enablementPath, "wx");
  } catch (err) {
    // If someone else has already opened the file then we just let them write the enablements
    return;
  }

  try {
    await writeJSON(enablementFile, value);
  } finally {
    await enablementFile.close();
  }
}
