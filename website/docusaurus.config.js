// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const path = require('path');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Cursorless',
  tagline: 'Never use the cursor again',
  url: 'https://github.com/pokey/cursorless-vscode',
  baseUrl: '/',
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
