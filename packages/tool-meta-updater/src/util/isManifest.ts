import type { FormatPluginFnOptions } from "@pnpm/meta-updater";

export function isAppWebDocs(options: FormatPluginFnOptions): boolean {
  return options.manifest.name === "@cursorless/app-web-docs";
}

export function isAppVscode(options: FormatPluginFnOptions): boolean {
  return options.manifest.name === "@cursorless/app-vscode";
}

export function isAppNeovim(options: FormatPluginFnOptions): boolean {
  return options.manifest.name === "@cursorless/app-neovim";
}

export function isTestRunner(options: FormatPluginFnOptions): boolean {
  return options.manifest.name === "@cursorless/test-runner";
}
