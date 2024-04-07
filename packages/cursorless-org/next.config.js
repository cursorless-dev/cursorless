import mdx from "@next/mdx";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const withMDX = mdx({
  options: {
    providerImportSource: "@mdx-js/react",
  },
});

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * The names of the packages that come from the same monorepo as this package.
 * We want these to be transpiled by Next.js because we are directly importing
 * the source typescript files from these packages.
 */
const references = JSON.parse(
  readFileSync(join(__dirname, "tsconfig.json"), "utf-8"),
).references.map(({ path }) => {
  return JSON.parse(
    readFileSync(join(__dirname, path, "package.json"), "utf-8"),
  ).name;
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    // Set our custom condition for the bundler so that we directly use
    // typescript from packages in our monorepo, which makes hot-reloading
    // smoother. Based on
    // https://github.com/vercel/next.js/discussions/33813#discussioncomment-7457277
    config.plugins.push({
      apply(compiler) {
        compiler.hooks.afterEnvironment.tap("NextEntryPlugin", () => {
          compiler.options.resolve.conditionNames.push("cursorless:bundler");
        });
      },
    });

    return config;
  },
  experimental: {
    mdxRs: true,
  },
  transpilePackages: references,
  reactStrictMode: true,
  output: "export",
};

export default withMDX(nextConfig);
