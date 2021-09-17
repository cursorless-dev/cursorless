import * as parser from "fast-xml-parser";
import { promises as fsp, read, readdirSync } from "fs";
import * as path from "path";

async function main() {
  const directory = path.join(__dirname, "../../images/hats");

  const dumper = new parser.j2xParser({
    ignoreAttributes: false,
    supressEmptyNode: true,
  });

  readdirSync(directory, { withFileTypes: true }).forEach(async (dirent) => {
    const filePath = path.join(directory, dirent.name);
    const rawSvg = await fsp.readFile(filePath, { encoding: "utf8" });
    const svgJson = parser.parse(rawSvg, { ignoreAttributes: false });

    svgJson.svg["@_width"] = "0.7em";
    svgJson.svg["@_height"] = "0.7em";

    if (
      rawSvg.match(/fill="[^"]+"/) == null &&
      rawSvg.match(/fill:[^;]+;/) == null
    ) {
      svgJson.svg["@_fill"] = "#123456";
    }

    await fsp.writeFile(filePath, dumper.parse(svgJson));
  });
}

main();
