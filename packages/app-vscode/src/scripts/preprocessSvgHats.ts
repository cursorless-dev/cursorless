import { readdirSync } from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { XMLParser, XMLBuilder } from "fast-xml-parser";
import { getCursorlessRepoRoot } from "@cursorless/lib-node-common";

async function main() {
  const directory = path.join(getCursorlessRepoRoot(), "resources/images/hats");

  const dumper = new XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true,
    format: true,
  });

  for (const dirent of readdirSync(directory, { withFileTypes: true })) {
    if (!dirent.isFile() || !dirent.name.endsWith(".svg")) {
      continue;
    }
    const filePath = path.join(directory, dirent.name);
    const rawSvg = await fsp.readFile(filePath, { encoding: "utf8" });
    const svgJson = new XMLParser({ ignoreAttributes: false }).parse(rawSvg);

    svgJson.svg["@_width"] = "1em";
    svgJson.svg["@_height"] = "1em";

    if (
      rawSvg.match(/fill="[^"]+"/u) == null &&
      rawSvg.match(/fill:[^;]+;/u) == null
    ) {
      svgJson.svg["@_fill"] = "#123456";
    }

    const outputSvg = dumper
      .build(svgJson)
      .replaceAll(/fill="(?!none)[^"]+"/gu, 'fill="#666666"')
      .replaceAll(/fill:(?!none)[^;]+;/gu, "fill:#666666;");

    await fsp.writeFile(filePath, outputSvg);
  }
}

await main();
