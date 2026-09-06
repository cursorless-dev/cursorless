# Adding a new package

Replace `foo` with your new package name in the instructions below.

1. `cd packages`
2. `mkdir foo && cd foo`
3. `pnpm init`
4. `code package.json` and update the `description` field. If your package is
   not a top-level application package, add a `"private": true,` line to your
   `package.json`.
5. `pnpm install`
6. `pnpm -w fix:meta`

Internal source-only packages should generally just expose `typecheck`, and if
needed `test`.

If your package is a top-level application package, you will usually also want
`dev` and `build`, and possibly helper `bundle:*` scripts if it produces
internal artifacts for another package.

For any packages that you need to depend on, you can run

```bash
pnpm add some-package
```

from the `packages/foo` directory. Note that `some-package` could be a local package, eg `@cursorless/lib-common`. In that case, you need to re-run `pnpm -w fix:meta` after adding the dependency, so that the Typescript references can be updated.
