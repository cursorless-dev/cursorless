import { promises as fsp } from "fs";
import { tmpdir, userInfo } from "os";
import { join } from "path";

function getEnablementPath() {
  const info = userInfo();

  // NB: On Windows, uid < 0, and the tmpdir is user-specific, so we don't
  // bother with a suffix
  const suffix = info.uid >= 0 ? `-${info.uid}` : "";

  return join(tmpdir(), `cursorless-default-enablements${suffix}.json`);
}

async function main() {
  console.log("running exposeDefaultStyleEnablements");
  const enablementPath = getEnablementPath();
  await fsp.writeFile(enablementPath, "hello\n");
}

main();
