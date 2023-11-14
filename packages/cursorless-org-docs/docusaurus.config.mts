import type { Config } from "@docusaurus/types";
import type { Root } from "mdast";
import { dirname, relative, resolve } from "path";
import { themes } from "prism-react-renderer";
import type { Transformer } from "unified";
import { visit } from "unist-util-visit";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

/**
 * Files within /docs reference repository directories
 * and files outside of that folder. They are not served
 * in documentation hub.
 *
 * This plugin rewrites these links to point to GitHub.
 * The algorithm roughly is:
 * - For each link:
 * - If absolute or already relative to index - do nothing.
 * - Try resolving it relative to repo root.
 * - If anywhere but /docs - link to GitHub.
 */
function remarkPluginFixLinksToRepositoryArtifacts(): Transformer<Root> {
  return (ast, file) => {
    visit(ast, "link", (node) => {
      const { url } = node;
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return;
      }

      // Docusaurus runs this plugin on its intermediate
      // markdown representaiton as well as on our original files.
      // These are relative links that docusaurus already figured out
      // based on realative links to .md files
      if (url.startsWith("/docs/")) {
        return;
      }

      const repoRoot = resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../..",
      );
      const artifact = resolve(file.dirname!, url);
      const artifactRelative = relative(repoRoot, artifact);

      // We host all files under docs, will resolve as a relative link
      if (artifactRelative.startsWith("docs/")) {
        return;
      }

      const repoLink =
        "https://github.com/cursorless-dev/cursorless/tree/main/";
      const linkToRepositoryArtifact = repoLink.concat(artifactRelative);

      node.url = linkToRepositoryArtifact;
    });
  };
}

const config: Config = {
  title: "Cursorless",
  tagline: "Structural voice coding at the speed of thought",
  url: "https://www.cursorless.org",
  baseUrl: "/docs/",
  stylesheets: [
    // Icons generated with https://favicon.io/favicon-generator/
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "/favicon.svg",
    },
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      href: "/apple-touch-icon.png?v=1",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      href: "/favicon-32x32.png?v=1",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      href: "/favicon-16x16.png?v=1",
    },
    { rel: "manifest", href: "/site.webmanifest?v=1" },
    {
      rel: "mask-icon",
      href: "/safari-pinned-tab.svg?v=1",
      color: "#7c7c7c",
    },
    { rel: "shortcut icon", href: "/favicon.ico?v=1" },
  ],
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  trailingSlash: true,

  presets: [
    [
      "classic",
      {
        docs: {
          path: "../../docs",
          // Followed https://ricard.dev/how-to-set-docs-as-homepage-for-docusaurus/
          // to serve a markdown document on homepage
          routeBasePath: "/",
          // Note that we add dummy/dummy so that the `../..` above has something to strip
          editUrl:
            "https://github.com/cursorless-dev/cursorless/edit/main/dummy/dummy",
          sidebarPath: require.resolve("./sidebar.js"),
          beforeDefaultRemarkPlugins: [
            remarkPluginFixLinksToRepositoryArtifacts,
          ],
        },
        theme: {
          customCss: [require.resolve("./src/css/custom.css")],
        },
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: "Cursorless",
      logo: {
        alt: "Cursorless",
        src: "logo.svg",
        srcDark: "logo-dark.svg",
        href: "https://www.cursorless.org/",
        target: "_self",
      },
      items: [
        {
          position: "left",
          type: "docSidebar",
          to: "user/",
          sidebarId: "user",
          label: "For users",
        },
        {
          type: "docSidebar",
          position: "left",
          to: "contributing/",
          sidebarId: "contributing",
          label: "For contributors",
        },
        {
          href: "https://github.com/cursorless-dev/cursorless",
          position: "right",
          className: "header-github-link",
          ["aria-label"]: "GitHub repository",
        },
      ],
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ["bash", "diff", "json", "python"],
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    algolia: {
      appId: "YTJQ4I3GBJ",
      apiKey: "2cc808dde95f119a19420ddc2941ee7d",
      indexName: "cursorless",
    },
  },
};

export default config;
