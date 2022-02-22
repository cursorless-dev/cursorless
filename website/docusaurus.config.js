// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');

function remarkPluginFixLinks() {
  /** @type {import('unified').Transformer} */
  const transformer = async (ast, file) => {
    // Package does not support require es modules
    let { visit } = await import('unist-util-visit');
    visit(ast, (node) => {
      if (node.type !== 'link') {
        return;
      }
      /** @type string */
      let link = node.url;
      if (link.indexOf('http') !== -1) {
        return;
      }
      let srcDirPath = path.resolve(__dirname, '..');
      let absolutePath = path.resolve(__dirname, '..', file.dirname, link);
      let pathRelativeToSrc = path.relative(srcDirPath, absolutePath);
      if (pathRelativeToSrc.startsWith('src')
        || pathRelativeToSrc.startsWith('cursorless-snippets')
        || pathRelativeToSrc.startsWith('.github')) {
        const repositoryPath = 'https://github.com/cursorless-dev/cursorless-vscode/tree/main/';
        const linkToRepositoryArtifact = repositoryPath.concat(pathRelativeToSrc);
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
  url: 'https://github.com/',
  baseUrl: '/cursorless-dev/cursorless-vscode/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'pokey',
  projectName: 'cursorless',

  staticDirectories: [
    'static',
    path.join(__dirname, '/images'),
  ],

  plugins: [
    // [
    //   'docusaurus-plugin-typedoc',

    //   // Plugin / TypeDoc options
    //   {
    //     entryPoints: ['../src/'],
    //     entryPointStrategy: 'expand',
    //     readme: 'none',
    //     tsconfig: '../tsconfig.json',
    //     out: 'api',
    //     plugin: [
    //       'typedoc-plugin-rename-defaults', 
    //       'typedoc-plugin-mdn-links',
    //       // typedoc generates using <internal> tag that is not closed. 
    //       // MDX in docusaurus does not like that and reports unclosed jsx tag.
    //       // 'typedoc-plugin-missing-exports'
    //     ]
    //   }
    // ],
    // [
    //   '@docusaurus/plugin-content-docs',
    //   {
    //     id: 'api',
    //     path: 'api',
    //     routeBasePath: 'api',
    //     sidebarPath: require.resolve('./sidebars.js'),
    //   }
    // ]
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./contributorSidebar.js'),
          beforeDefaultRemarkPlugins: [remarkPluginFixLinks],
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
