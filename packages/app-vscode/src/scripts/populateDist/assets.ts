import type { Asset } from "./Asset";
import { generateBuildInfo } from "./generateBuildInfo";
import { transformPackageJson } from "./transformPackageJson";

export const assets: Asset[] = [
  { source: "../../CHANGELOG.md", destination: "CHANGELOG.md" },
  { source: "../../LICENSE", destination: "LICENSE" },
  { source: "../../README.md", destination: "README.md" },
  {
    source: "../lib-cheatsheet-local/out/index.html",
    destination: "cheatsheet.html",
    // We allow this to be optional in dev mode because it is expensive to
    // build, and is only used when they say "cursorless cheatsheet".
    optionalInDev: true,
  },
  {
    source: "../../resources/fonts/cursorless-glyph.svg",
    destination: "fonts/cursorless-glyph.svg",
  },
  {
    source: "../../resources/fonts/cursorless.woff",
    destination: "fonts/cursorless.woff",
  },
  {
    source: "../../resources/images/hats",
    destination: "images/hats",
  },
  {
    source: "../../resources/fixtures/recorded/tutorial",
    destination: "tutorial",
  },
  {
    source: "../lib-vscode-tutorial-webview/out/index.js",
    destination: "media/tutorialWebview.js",
  },
  {
    source: "../lib-vscode-tutorial-webview/out/index.css",
    destination: "media/tutorialWebview.css",
  },
  { source: "./images/logo.png", destination: "images/logo.png" },
  {
    source: "../../resources/images/logo.svg",
    destination: "images/logo.svg",
  },
  {
    source: "resources/font_measurements.js",
    destination: "resources/font_measurements.js",
  },
  {
    source: "resources/installationDependencies.html",
    destination: "resources/installationDependencies.html",
  },
  {
    source: "resources/installationDependencies.js",
    destination: "resources/installationDependencies.js",
  },
  {
    source: "../../resources/queries",
    destination: "resources/queries",
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
