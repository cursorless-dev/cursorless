# cursorless.org docs site

This is the source code for the [cursorless.org/docs](https://cursorless.org/docs) portion of the Cursorless website. Note that it is built independently from the rest of the site (which uses Next.js, and can be found in the [`cursorless-org`](../cursorless-org) directory).

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
pnpm install
```

### Local Development

```
pnpm start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
pnpm build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deploy

After building this site, we copy the output to the `docs` subdir of the staging directory for our website, which is then deployed by Netlify. See the [deploy script](../../scripts/build-and-assemble-website.sh) for more details.
