# Package Scripts

This page describes the script architecture used in the Cursorless monorepo.

## Overview

The repository uses four main script concepts:

- `typecheck`: Validate TypeScript for a package or the whole workspace
- `bundle`: Produce an internal runtime artifact for another package to consume
- `build`: Produce a top-level distributable artifact
- `dev`: Run the primary development workflow for a top-level package

The main distinction is between internal packages and top-level application packages.

## Internal packages

Internal packages are not published independently. They are consumed only from
within this repository.

There are two important kinds of internal packages:

- Source-only shared code packages, such as `lib-common` or `lib-engine`
- Internal asset packages, such as `cheatsheet-local` or
  `lib-vscode-tutorial-webview`

### Source-only shared code packages

These packages should expose `typecheck`, but they should not expose public
`build`, `compile`, or `clean` scripts.

These packages export source directly from `src`, and they should not rely on an
`out` directory as part of their package contract.

### Internal asset packages

Some internal packages still need to generate runtime artifacts, but these
artifacts are implementation details of another package.

These packages expose `bundle` scripts instead of `build` scripts. For example:

- `bundle`
- `bundle:dev`
- `bundle:watch`

These scripts are intended to be called by another package, not to define the
main top-level workflow for the repository.

## Top-level application packages

Top-level application packages expose the primary workflows that developers
actually use directly.

These packages generally expose:

- `typecheck`
- `dev`
- `build`

Examples include:

- `@cursorless/app-vscode`
- `@cursorless/app-neovim`
- `@cursorless/app-web`
- `@cursorless/app-web-docs`
- `@cursorless/app-talon`

## Script meanings

### `typecheck`

`typecheck` validates TypeScript for the package. At the repository root, it
walks the project reference graph without emitting compiled output.

Use this when you want to validate the codebase without implying that a
distributable artifact should be produced.

### `bundle`

`bundle` means "produce an internal runtime artifact". It is used for packages
that generate files consumed by another package, but which are not themselves
top-level deliverables.

Examples:

- the local cheatsheet single-file bundle
- the VS Code tutorial webview bundle
- test harness runner bundles

### `build`

`build` means "produce the final artifact for a top-level application package".

`build` scripts should be self-contained. If a top-level package depends on
internal bundle-producing packages, its `build` script should invoke their
`bundle` scripts itself.

For example:

- `app-vscode build` is responsible for building the assets it embeds
- `app-neovim build` is responsible for building the support artifacts it
  packages

### `dev`

`dev` is the main development entrypoint for a top-level application package.

For web applications this is usually a long-running development server, such as
Vite or Docusaurus.

For extension-style packages, `dev` currently means "prepare a development
build" rather than a fully self-updating hot-deploy pipeline. If more advanced
hot-deploy behavior is needed, it should still hang off the top-level `dev`
entrypoint rather than reintroducing older script names like `build:dev`.

## Repository-level rules

At the repository root:

- use `pnpm typecheck` to validate the TypeScript graph
- use `pnpm build` to build top-level distributable packages
- do not use root-level `compile` or generic `watch:*` scripts

For internal source-only packages, `typecheck` should not create an `out`
directory.

The goal is to keep the public vocabulary small and make each script name mean
one thing consistently across the repository.

## Naming guidelines

Use `bundle` when:

- the package is internal
- the output is consumed by another package
- the script is mostly an implementation detail

Use `build` when:

- the package is a top-level application or distributable
- the script produces the main artifact developers care about

Use `dev` when:

- the script is the primary entrypoint for local development of a top-level
  package

Use `typecheck` when:

- the goal is validating TypeScript rather than producing a runtime artifact
