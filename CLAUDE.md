# Claude Helpers for Cursorless

This file contains helpful hints for Claude when working with the Cursorless codebase.

## Documentation Structure

- Main documentation is in `/packages/cursorless-org-docs/src/docs/user/README.md`
- Spoken forms are defined in `/cursorless-talon/src/spoken_forms.json`
- Contributing documentation is in `/packages/cursorless-org-docs/src/docs/contributing/`

## Project Organization

- Main extension code is in `/packages/cursorless-vscode/`
- Engine code is in `/packages/cursorless-engine/`
- Tests are in `data/fixtures/recorded/`
- Language-specific parsing is defined in the `queries/*.scm` files

## Build and Test

- Always run lint and typecheck when making changes:
  - `pnpm run lint`
  - `pnpm run typecheck`
- Tests can be run with:
  - `pnpm test`

## Documentation Conventions

When documenting actions or modifiers:
- Include a brief description of what the item does
- Include the format/syntax
- Include at least one example
- For versatile actions like `drink`, `pour`, `drop`, `float`, and `puff`, explain their behavior with different scope types
- Always document special behaviors with different scope types

## Implementation Notes

- Many actions (`drop`, `float`, `puff`) work with both line and non-line targets
- Always check test fixtures in `/data/fixtures/recorded/` to understand behavior
- Implementation for many actions is in `/packages/cursorless-engine/src/actions/`

## Pull Request Guidelines

- Any feedback should be addressed in code or replied to
- Tests should be included for new functionality
- Documentation should be updated to reflect changes
- Make sure changes are consistent with the project architecture