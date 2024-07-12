import { getCursorlessRepoRoot } from "@cursorless/common";
import * as parser from "fast-xml-parser";
import * as fs from "fs/promises";
import * as path from "pathe";

async function main() {
  const directory = path.join(getCursorlessRepoRoot(), "images/hats");

  const dumper = new parser.XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true,
    format: true,
  });

  const files = await fs.readdir(directory, { withFileTypes: true });

  for (const dirent of files) {
    if (!dirent.isFile() || !dirent.name.endsWith(".svg")) {
      continue;
    }
    const filePath = path.join(directory, dirent.name);
    const rawSvg = await fs.readFile(filePath, { encoding: "utf8" });
    const svgJson = new parser.XMLParser({ ignoreAttributes: false }).parse(
      rawSvg,
    );

    svgJson.svg["@_width"] = "1em";
    svgJson.svg["@_height"] = "1em";

    if (
      rawSvg.match(/fill="[^"]+"/) == null &&
      rawSvg.match(/fill:[^;]+;/) == null
    ) {
      svgJson.svg["@_fill"] = "#123456";
    }

    const outputSvg = dumper
      .build(svgJson)
      .replace(/fill="(?!none)[^"]+"/g, 'fill="#666666"')
      .replace(/fill:(?!none)[^;]+;/g, "fill:#666666;");

    await fs.writeFile(filePath, outputSvg);
  }
}

main();
