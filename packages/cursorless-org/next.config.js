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
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
  experimental: {
    mdxRs: true,
  },
  transpilePackages: references,
  reactStrictMode: true,
  output: "export",
};

export default withMDX(nextConfig);
