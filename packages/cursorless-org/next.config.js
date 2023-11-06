const withMDX = require("@next/mdx")({
  options: {
    providerImportSource: "@mdx-js/react",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  experimental: {
    mdxRs: true,
  },
  reactStrictMode: true,
};

module.exports = withMDX(nextConfig);
