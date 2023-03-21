# Local cheatsheet

This app just bundles up the cheatsheet into a single file to be used when the user says `"cursorless cheatsheet"`. The file inlines all css and js so that it can be opened as a single file by the end user. During actual production use, Talon will send the user's custom spoken forms to the Cursorless engine, which will [inject them](../cursorless-engine/src/core/Cheatsheet.ts) into the cheatsheet using a global variable.

Note that there is no development server for this app. It is just a build step. If you want a live development environment for the cheatsheet, you should use the cheatsheet page in [the `cursorless-org` package (our webpage defined in Next.js)](../cursorless-org).

## Tasks

### build

Builds the cheatsheet into a single file for deployment.

```
pnpm run build
```

The output will be in `dist/index.html`. Note that this file includes a bit of fake data so that it can be opened to check that it is functioning, but in production it will be replaced with the real data (see above).
