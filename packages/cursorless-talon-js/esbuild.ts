import * as esbuild from "esbuild";

const options: esbuild.BuildOptions = {
  entryPoints: ["src/extension.ts"],
  outfile: "out/talon.js",
  platform: "neutral",
  bundle: true,
  external: ["talon", "postcss", "process", "node:assert", "util"],
  format: "esm",
  mainFields: ["main"],
  minify: false,
  //   packages: "external",
};

async function build() {
  await esbuild.build({
    ...options,
    minify: true,
  });
}

async function watch() {
  const ctx = await esbuild.context(options);
  await ctx.watch();
}

(() => {
  if (process.argv.includes("--watch")) {
    void watch();
  } else {
    void build();
  }
})();
