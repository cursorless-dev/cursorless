# Local cheatsheet

This app just bundles up the cheatsheet into a single file to be used when the user says `"cursorless cheatsheet"`. The file inlines all css and js so that it can be opened as a single file by the end user. During actual production use, the extension constructs the cheatsheet from the canonical reference definitions and the user's spoken-form lists in Talon's `state.json`, then injects it into the bundled page using a global variable.

Note that there is no development server for this app. It is just a bundle step. If you want a live development environment for the cheatsheet, you should use the cheatsheet page in [the `app-web` package](../app-web).

## Tasks

### bundle

Builds the cheatsheet into a single file for deployment.

```bash
pnpm bundle:prod
```

The output will be in `out/index.html`. Note that this file includes a bit of fake data so that it can be opened to check that it is functioning, but in production it will be replaced with the real data (see above).
