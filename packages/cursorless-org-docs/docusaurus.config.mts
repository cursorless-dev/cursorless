import type { Config } from "@docusaurus/types";
import type { Root } from "mdast";
import { relative, resolve } from "path";
import { themes } from "prism-react-renderer";
import * as unified from "unified";
import { visit } from "unist-util-visit";

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
function remarkPluginFixLinksToRepositoryArtifacts() {
  const transformer: unified.Transformer<Root> = async (ast, file) => {
    visit(ast, "link", (node) => {
      const link = node.url;
      if (link.startsWith("http://") || link.startsWith("https://")) {
        return;
      }

      // Docusaurus runs this plugin on its intermediate
      // markdown representaiton as well as on our original files.
      // These are relative links that docusaurus already figured out
      // based on realative links to .md files
      if (link.startsWith("/docs/")) {
        return;
      }

      const repoRoot = resolve(__dirname, "../..");
      const artifact = resolve(file.dirname!, link);
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
  return transformer;
}

const config: Config = {
  title: "Cursorless",
  tagline: "Structural voice coding at the speed of thought",
  url: "https://www.cursorless.org",
  baseUrl: "/docs/",
  favicon: "/docs/favicon.ico",
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
        src: "icon.svg",
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
