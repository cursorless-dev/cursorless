// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');

/**
 * Markdown documentation in docs/ references repository directories
 * and files. Relative paths are used so manually written documentation 
 * can be read on GitHub entirely. 
 * For our own documentation website we want to transform these
 * relative links to matching GitHub link. 
 * This will ensure consistent experience no matter where you
 * start browsing the documentation.
 * 
 * Keep in mind docs/ is copied to website/docs/.
 * Needed to work around an issue with TypeDoc x Docusaurus plugin.
 * 
 * The algorithm roughly is:
 * - Visit all relative links within markdown documents.
 * - Try resolving it relative to repo root. Some magic involved here. 
 * - If it matches one of the hardcoded prefixes make it a GitHub link.
 */
function remarkPluginFixLinksToRepositoryArtifacts() {
  /** @type {import('unified').Transformer} */
  const transformer = async (ast, file) => {
    // Package does not support require es modules.
    // Easiest workaround I found.
    let { visit } = await import('unist-util-visit');
    visit(ast, 'link', (node) => {
      /** @type string */
      let link = node.url;
      if (link.startsWith('http://') || link.startsWith('https://')) {
        return;
      }
      let repoRoot = path.resolve(__dirname, '..');
      let absolute = path.resolve(repoRoot, file.dirname, link);
      let relative = path.relative(__dirname, absolute);
      if (!relative.startsWith('docs')) {
        const repoLink = 'https://github.com/cursorless-dev/cursorless-vscode/tree/main/';
        const linkToRepositoryArtifact = repoLink.concat(relative);
        node.url = linkToRepositoryArtifact;
      }
    });
  };
  return transformer;
};

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cursorless',
  tagline: 'Never use the cursor again',
  // GitHub pages url
  url: 'https://cursorless-dev.github.io/',
  baseUrl: '/cursorless-vscode/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'pokey',
  projectName: 'cursorless',

  staticDirectories: [
    'static',
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',

      // Plugin / TypeDoc options
      {
        entryPoints: ['../src/'],
        entryPointStrategy: 'expand',
        readme: 'none',
        tsconfig: '../tsconfig.json',
        out: 'contributing/api',
        plugin: [
          'typedoc-plugin-rename-defaults', 
          'typedoc-plugin-mdn-links',
          // typedoc generates using <internal> tag that is not closed. 
          // MDX in docusaurus does not like that and reports unclosed jsx tag.
          // 'typedoc-plugin-missing-exports'
        ]
      }
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebar.js'),
          beforeDefaultRemarkPlugins: [remarkPluginFixLinksToRepositoryArtifacts],
        },
      })
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Cursorless',
        logo: {
          alt: 'Cursorless',
          src: 'icon.svg',
        },
        items: [
          {
            position: 'left',
            type: 'doc',
            docId: 'user/README',
            to: '/',
            sidebarId: 'user',
            label: 'For users',
          },
          {
            type: 'doc',
            position: 'left',
            docId: 'contributing/adding-a-new-language',
            to: 'contributing/',
            sidebarId: 'contributing',
            label: 'For contributors',
          }
        ]
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
