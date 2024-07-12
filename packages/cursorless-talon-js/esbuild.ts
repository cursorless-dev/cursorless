import * as esbuild from "esbuild";

const options: esbuild.BuildOptions = {
  entryPoints: ["src/extension.ts"],
  outfile: "out/talon.js",
  platform: "neutral",
  bundle: true,
  external: ["esbuild", "talon"],
  mainFields: ["main"],
};

// esbuild ./src/extension.ts --conditions=cursorless:bundler --bundle --outfile=out/talon.js --external:talon --format=cjs --platform=neutral --main-fields=main

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
