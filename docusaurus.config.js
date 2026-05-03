import { themes as prismThemes } from 'prism-react-renderer';

const config = {
  title: 'MiniLMS Docs',
  tagline: 'Техническая документация платформы мини-курсов',
  favicon: 'img/favicon.ico',

  url: 'https://fshf7.github.io',
  baseUrl: '/minilms-docs/',

  organizationName: 'fshf7',
  projectName: 'minilms-docs',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'ru',
    locales: ['ru'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      },
    ],
    [
      'redocusaurus',
      {
        specs: [
          {
            spec: 'docs/api/openapi.yaml',
            route: '/api/',
          },
        ],
        theme: {
          primaryColor: '#2196F3',
        },
      },
    ],
  ],

  plugins: [
    'docusaurus-plugin-drawio',
  ],

  themeConfig: {
    navbar: {
      title: 'MiniLMS Docs',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Документация',
        },
        {
          href: 'https://github.com/fshf7/minilms-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `MiniLMS Documentation © ${new Date().getFullYear()}`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['yaml'],
    },
  },
};

export default config;