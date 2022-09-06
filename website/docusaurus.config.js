// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");
const path = require("path");

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
  /** @type {import('unified').Transformer} */
  const transformer = async (ast, file) => {
    // Package does not support require es modules.
    // Easiest workaround I found.
    let { visit } = await import("unist-util-visit");
    visit(ast, "link", (node) => {
      /** @type string */
      let link = node.url;
      if (link.startsWith("http://") || link.startsWith("https://")) {
        return;
      }

      // Docusaurus runs this plugin on its intermediate
      // markdown representaiton as well as on our original files.
      // These are relative links that docusaurus already figured out
      // based on realative links to .md files
      if (link.startsWith("/docs")) {
        return;
      }

      let repoRoot = path.resolve(__dirname, "..");
      let artifact = path.resolve(file.dirname, link);
      let artifactRelative = path.relative(repoRoot, artifact);

      // We host all files under docs, will resolve as a relative link
      if (artifactRelative.startsWith("docs")) {
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

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Cursorless",
  tagline: "Structural voice coding at the speed of thought",
  url: "https://www.cursorless.org",
  baseUrl: "/docs/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "throw",
  trailingSlash: true,

  plugins: [
    [
      "docusaurus-plugin-typedoc",
      // TypeDoc options merged with docusaurus specific options
      {
        ...require("./typedoc.js"),
        docsRoot: "../docs",
        // Out path is relative to docsRoot
        out: "contributing/api",
      },
    ],
  ],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: "../docs",
          // Followed https://ricard.dev/how-to-set-docs-as-homepage-for-docusaurus/
          // to serve a markdown document on homepage
          routeBasePath: "/",
          editUrl:
            "https://github.com/cursorless-dev/cursorless/edit/main/docs/",
          sidebarPath: require.resolve("./sidebar.js"),
          beforeDefaultRemarkPlugins: [
            remarkPluginFixLinksToRepositoryArtifacts,
          ],
        },
        theme: {
          customCss: [require.resolve("./src/css/custom.css")],
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Cursorless",
        logo: {
          alt: "Cursorless",
          src: "icon.svg",
        },
        items: [
          {
            position: "left",
            type: "doc",
            docId: "user/README",
            to: "user/",
            sidebarId: "user",
            label: "For users",
          },
          {
            type: "doc",
            position: "left",
            docId: "contributing/CONTRIBUTING",
            to: "contributing/",
            sidebarId: "contributing",
            label: "For contributors",
          },
          {
            href: "https://github.com/cursorless-dev/cursorless",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
      algolia: {
        appId: "YTJQ4I3GBJ",
        apiKey: "2cc808dde95f119a19420ddc2941ee7d",
        indexName: "cursorless",
      },
    }),
};

module.exports = config;
