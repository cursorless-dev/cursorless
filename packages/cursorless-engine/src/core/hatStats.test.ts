import {
  HatStability,
  HatStyleMap,
  HatStyleName,
  MockTextDocument,
  MockTextEditor,
  Selection,
  TokenHat,
  TokenHatSplittingMode,
  getCursorlessRepoRoot,
  shouldUpdateFixtures,
} from "@cursorless/common";
import * as fs from "fs";
import { unitTestSetup } from "../test/unitTestSetup";
import { TokenGraphemeSplitter } from "../tokenGraphemeSplitter";
import { allocateHats } from "../util/allocateHats";
import path = require("path");
import {
  RankedToken,
  getRankedTokens,
} from "../util/allocateHats/getRankedTokens";
import assert = require("assert");

// We use special hat "colors"/"shapes" for nice ASCII art output.
const HAT_COLORS = ["default", ..."ABCDEF"];
const HAT_NON_DEFAULT_SHAPES = [..."123456"];
const allHatStyles: HatStyleMap = {
  ...Object.fromEntries(
    HAT_COLORS.map((color) => [
      color,
      {
        color,
        shape: "default",
        penalty: penaltyForColorShape(color, "default"),
      },
    ]),
  ),
  ...Object.fromEntries(
    HAT_COLORS.flatMap((color) =>
      HAT_NON_DEFAULT_SHAPES.map((shape) => [
        `${color}-${shape}`,
        {
          color,
          shape,
          penalty: penaltyForColorShape(color, shape),
        },
      ]),
    ),
  ),
};

const tokenHatSplittingDefaults: TokenHatSplittingMode = {
  preserveCase: false,
  lettersToPreserve: [],
  symbolsToPreserve: [],
};

// map of file extension to language id
// TODO: is there a canonical list of these somewhere else?
const languageIdMap: { [key: string]: string } = {
  txt: "plaintext",
  js: "javascript",
  ts: "typescript",
  go: "go",
  py: "python",
  rs: "rust",
  java: "java",
  c: "c",
};

suite("hatStats", () => {
  unitTestSetup(({ configuration }) => {
    configuration.mockConfiguration("tokenHatSplittingMode", {
      ...tokenHatSplittingDefaults,
    });
  });

  const fixturePath = path.join(
    getCursorlessRepoRoot(),
    "packages",
    "cursorless-engine",
    "src",
    "test",
    "fixtures",
    "hat-stats",
  );

  fs.readdirSync(fixturePath).forEach((file) => {
    if (
      file.endsWith(".stats") ||
      file.endsWith(".golden") ||
      file === "readme.md" ||
      file.startsWith(".") // silly dot files
    ) {
      return;
    }

    test(file, () => {
      const filepath = path.join(fixturePath, file);
      const extension = file.slice(file.lastIndexOf("."));
      const languageId = languageIdMap[extension.slice(1)];

      const contents = fs.readFileSync(filepath, "utf-8");
      const doc: MockTextDocument = new MockTextDocument(
        filepath.toString(),
        languageId,
        contents,
      );

      // get a list of all tokens so that we can iterate over them,
      // placing the primary selection before each one in turn
      const editor = new MockTextEditor(doc, true);
      const allTokens = getRankedTokens(editor, [editor]);

      const nHats: number[] = [];
      const nPenalty0: number[] = [];
      const nPenalty1: number[] = [];
      const nPenalty2: number[] = [];
      // Generate hats at ~16 evenly spaced tokens from allTokens.
      // It's too slow to do more, even though that would give us more interesting statistics.
      const someTokens = allTokens.filter(
        (_, index) => index % Math.floor(allTokens.length / 16) === 0,
      );

      let tokenSpark: string = "";

      someTokens.forEach((token, index) => {
        editor.primarySelection = new Selection(
          token.token.range.start,
          token.token.range.start,
        );

        const tokenHat = allocateHats(
          new TokenGraphemeSplitter(),
          allHatStyles,
          [], // for now, no old token hats
          HatStability.greedy, // doesn't matter for now, because there are no old hats
          editor,
          [editor],
        );

        if (index === 0) {
          const golden = goldenHatFile(contents, allTokens, tokenHat);
          tokenSpark = makeTokenSpark(allTokens, tokenHat);
          const goldenPath = filepath + ".golden";
          if (shouldUpdateFixtures()) {
            fs.writeFileSync(goldenPath, golden);
          } else {
            let actual = fs.readFileSync(goldenPath, "utf-8");
            // convert \r\n to just \n (hi, Windows!)
            actual = actual.replace(/\r\n/g, "\n");
            assert.equal(actual, golden);
          }
        }

        nHats.push((100 * tokenHat.length) / allTokens.length);
        const nTokensWithPenalty: number[] = [0, 0, 0];
        tokenHat.forEach((tokenHat) => {
          const hatStyle = tokenHat.hatStyle;
          const penalty = penaltyForHatStyle(hatStyle);
          nTokensWithPenalty[penalty] += 1;
        });
        nPenalty0.push((100 * nTokensWithPenalty[0]) / allTokens.length);
        nPenalty1.push((100 * nTokensWithPenalty[1]) / allTokens.length);
        nPenalty2.push((100 * nTokensWithPenalty[2]) / allTokens.length);

        // todo: do another allocation nearby with balanced/stable,
        // and track % of hats that move
        // TODO: test with fewer hats enabled also?
      });

      let s = "";
      s += `nTokens: ${allTokens.length}\n\n`;
      s += `tokenSpark:\n`;
      for (let i = 0; i < tokenSpark.length; i += 60) {
        s += "\t" + tokenSpark.slice(i, i + 60) + "\n";
      }
      s += "\n";
      s += describeDistribution("nHats", nHats) + "\n";
      s += describeDistribution("nPenalty0", nPenalty0) + "\n";
      s += describeDistribution("nPenalty1", nPenalty1) + "\n";
      s += describeDistribution("nPenalty2", nPenalty2) + "\n";
      // replace multiple trailing newlines with just one to placate pre-commit
      s = s.replace(/\n+$/, "\n");
      const statsPath = filepath + ".stats";
      if (shouldUpdateFixtures()) {
        fs.writeFileSync(filepath + ".stats", s);
      } else {
        let actual = fs.readFileSync(statsPath, "utf-8");
        actual = actual.replace(/\r\n/g, "\n");
        assert.equal(actual, s);
      }
    });
  });
});

function colorShapeForHatStyle(hatStyle: HatStyleName): [string, string] {
  const [color, shape] = hatStyle.split("-");
  return [color, shape ?? "default"];
}

function penaltyForHatStyle(hatStyle: HatStyleName): number {
  const [color, shape] = colorShapeForHatStyle(hatStyle);
  return penaltyForColorShape(color, shape ?? "default");
}

function penaltyForColorShape(color: string, shape: string): number {
  return (shape === "default" ? 0 : 1) + (color === "default" ? 0 : 1);
}

function describeDistribution(name: string, x: number[]): string {
  const n = x.length;
  const mean = x.reduce((a, b) => a + b, 0) / n;
  const variance =
    x.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) / (n - 1);
  const std = Math.sqrt(variance);
  const min = Math.min(...x);
  const max = Math.max(...x);
  // create a sparkline histogram with 50 bins
  const binCounts = new Array(51).fill(0);
  x.forEach((x) => {
    const bin = Math.floor((x / 100) * 50);
    binCounts[bin] += 1;
  });
  const spark = sparkline(binCounts);
  return `${name}:\n\tmean: ${asPercent(mean)}\n\tstd: ${asPercent(
    std,
  )}\n\tmin: ${asPercent(min)}\n\tmax: ${asPercent(max)}\n\tspark: ${spark}\n`;
}

function asPercent(n: number): string {
  return (
    n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + "%"
  );
}

function sparkline(pcts: number[]) {
  const bars = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];
  const max = Math.max(...pcts);
  const chars = pcts.map((pct) => {
    if (pct === 0) {
      return " ";
    }
    const idx = Math.ceil((pct / max) * bars.length) - 1;
    return bars[idx];
  });
  const chunk = chars.length / 4;
  return (
    `0 ${chars.slice(0 * chunk, 1 * chunk).join("")} ` +
    `25 ${chars.slice(1 * chunk, 2 * chunk).join("")} ` +
    `50 ${chars.slice(2 * chunk, 3 * chunk).join("")} ` +
    `75 ${chars.slice(3 * chunk, 4 * chunk).join("")} ` +
    `100`
  );
}

function makeTokenSpark(
  allTokens: RankedToken[],
  tokenHats: TokenHat[],
): string {
  const bars = ["▁", "▃", "▅", "█"];
  const penalties = allTokens.map((token) => {
    const hat = tokenHats.find((hat) =>
      hat.token.range.isEqual(token.token.range),
    ) as TokenHat;
    if (hat === undefined) {
      return 3;
    }
    const hatStyle = hat.hatStyle;
    return penaltyForHatStyle(hatStyle);
  });
  const chars = penalties.map((penalty) => {
    return bars[penalty];
  });
  return chars.join("");
}

function goldenHatFile(
  contents: string,
  allTokens: RankedToken[],
  tokenHats: TokenHat[],
): string {
  // Iterate over all tokens, writing out hats, ranges, and content.
  let out: string = "";
  const lines = contents.split(/\r?\n/);
  lines.forEach((line, lineno) => {
    // Use only one empty line per empty input line, rather than three
    if (line.length === 0) {
      return;
    }
    // TODO: this is wasteful. oh well?
    const lineTokens = allTokens.filter(
      (token) => token.token.range.end.line === lineno,
    );
    let line1 = "";
    let line2 = "";
    let rangeLine = "";
    lineTokens.forEach((token) => {
      const tokenRange = token.token.range;
      if (tokenRange.start.line !== tokenRange.end.line) {
        throw new Error(
          `multi-line tokens not supported, have ${tokenRange.concise()}`,
        );
      }

      const hat = tokenHats.find((hat) =>
        hat.token.range.isEqual(token.token.range),
      ) as TokenHat;
      if (hat === undefined) {
        // TODO: visually call out tokens without hats?
        return;
      }
      const hatRange = hat.hatRange;
      const [color, shape] = colorShapeForHatStyle(hat.hatStyle);
      const penalty = penaltyForHatStyle(hat.hatStyle);
      if (penalty === 0) {
        line1 += " ".repeat(hatRange.start.character - line1.length);
        line1 += "_";
      } else if (penalty === 1) {
        const char = color === "default" ? shape : color;
        line1 += " ".repeat(hatRange.start.character - line1.length);
        line1 += char;
      } else if (penalty === 2) {
        line1 += " ".repeat(hatRange.start.character - line1.length);
        line1 += shape;
        line2 += " ".repeat(hatRange.start.character - line2.length);
        line2 += color;
      } else {
        throw new Error(`unexpected penalty: ${penalty}`);
      }
      const width = tokenRange.end.character - tokenRange.start.character;
      let rangeStr = "";
      if (width === 1) {
        rangeStr = "|";
      } else if (width === 2) {
        rangeStr = "[]";
      } else if (width > 2) {
        rangeStr = "[" + "-".repeat(width - 2) + "]";
      } else {
        throw new Error(`unexpected width: ${width}`);
      }
      rangeLine += " ".repeat(tokenRange.start.character - rangeLine.length);
      rangeLine += rangeStr;
    });
    if (line2.length !== 0) {
      out += line2 + "\n";
    }
    if (line1.length !== 0) {
      out += line1 + "\n";
    }
    if (line.length !== 0) {
      // TODO: tabs, emoji, sigh
      line = line.replaceAll(/\t/g, "␉");
      out += line + "\n";
    }
    if (rangeLine.length !== 0) {
      out += rangeLine + "\n";
    }
    out += "\n";
  });
  // replace multiple trailing newlines with just one to placate pre-commit
  out = out.replace(/\n+$/, "\n");
  return out;
}
