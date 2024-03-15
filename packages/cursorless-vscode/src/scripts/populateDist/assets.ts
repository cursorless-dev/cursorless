import { transformPackageJson } from "./transformPackageJson";
import { generateBuildInfo } from "./generateBuildInfo";
import { Asset } from "./Asset";

export const assets: Asset[] = [
  { source: "../../CHANGELOG.md", destination: "CHANGELOG.md" },
  { source: "../../LICENSE", destination: "LICENSE" },
  { source: "../../NOTICE.md", destination: "NOTICE.md" },
  { source: "../../README.md", destination: "README.md" },
  {
    source: "../cheatsheet-local/dist/index.html",
    destination: "cheatsheet.html",
    // We allow this to be optional in dev mode because it is expensive to
    // build, and is only used when they say "cursorless cheatsheet".
    optionalInDev: true,
  },
  { source: "../../cursorless-snippets", destination: "cursorless-snippets" },
  {
    source: "../../fonts/cursorless-glyph.svg",
    destination: "fonts/cursorless-glyph.svg",
  },
  {
    source: "../../fonts/cursorless.woff",
    destination: "fonts/cursorless.woff",
  },
  { source: "../../images/hats", destination: "images/hats" },
  {
    source: "../cursorless-vscode-e2e/src/suite/fixtures/recorded/tutorial",
    destination: "tutorial",
  },
  {
    source: "../cursorless-vscode-tutorial-webview/out/index.js",
    destination: "media/tutorialWebview.js",
  },
  {
    source: "../cursorless-vscode-tutorial-webview/out/index.css",
    destination: "media/tutorialWebview.css",
  },
  { source: "./images/logo.png", destination: "images/logo.png" },
  { source: "../../images/logo.svg", destination: "images/logo.svg" },
  {
    source: "resources/font_measurements.js",
    destination: "resources/font_measurements.js",
  },
  { source: "../../schemas", destination: "schemas" },
  {
    source: "../../third-party-licenses.csv",
    destination: "third-party-licenses.csv",
  },
  {
    source: "../../queries",
    destination: "queries",
  },
  {
    generateContent: generateBuildInfo,
    destination: "build-info.json",
  },
  {
    source: "package.json",
    destination: "package.json",
    transformJson: transformPackageJson,
  },
];
