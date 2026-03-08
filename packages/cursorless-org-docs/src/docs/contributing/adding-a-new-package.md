# Adding a new package

Replace `foo` with your new package name in the instructions below.

1. `cd packages`
2. `mkdir foo && cd foo`
3. `pnpm init`
4. `code package.json` and update the `description` field. If your package is
   not a library (ie it's an entrypoint), add a `"private": true,` line to your
   `package.json`.
5. `pnpm install`
6. `pnpm -w fix:meta`

If your package is not a library, you get a bit less scaffolding for free, so
you may want to steal some of the scripts, as well as possibly the `main`,
`types`, and `exports` fields, from one of our library's `package.json`s. The
`@cursorless/common` package is a decent one to steal from.

For any packages that you need to depend on, you can run

```bash
pnpm add some-package
```

from the `packages/foo` directory. Note that `some-package` could be a local package, eg `@cursorless/common`. In that case, you need to re-run `pnpm -w fix:meta` after adding the dependency, so that the Typescript references can be updated.
