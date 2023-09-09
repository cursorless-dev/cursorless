import { getCursorlessRepoRoot } from "@cursorless/common";
import * as parser from "fast-xml-parser";
import { promises as fsp, readdirSync } from "fs";
import * as path from "path";

async function main() {
  const directory = path.join(getCursorlessRepoRoot(), "images/hats");

  const dumper = new parser.XMLBuilder({
    ignoreAttributes: false,
    suppressEmptyNode: true,
    format: true,
  });

  readdirSync(directory, { withFileTypes: true }).forEach(async (dirent) => {
    const filePath = path.join(directory, dirent.name);
    const rawSvg = await fsp.readFile(filePath, { encoding: "utf8" });
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

    await fsp.writeFile(filePath, outputSvg);
  });
}

main();
