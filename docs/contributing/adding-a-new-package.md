# Adding a new package

Replace `foo` with your new package name in the instructions below.

1. `cd packages`
2. `mkdir foo && cd foo`
3. `pnpm init`
4. `code package.json` and update the `description` field
5. `cd ../..`
6. `pnpm install`
7. `pnpm meta-updater`

For any packages that you need to depend on, you can run

```bash
pnpm -F @cursorless/foo add -D some-package
```

Note that `some-package` could be a local package, eg `@cursorless/common`. In that case, you need to re-run `pnpm meta-updater` after adding the dependency, so that the Typescript references can be updated.
