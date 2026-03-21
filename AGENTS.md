# AGENTS.md

## Documentation Structure

- Main documentation is in `/packages/app-web-docs/src/docs/user/README.md`
- Spoken forms are defined in `/cursorless-talon/src/spoken_forms.json`
- Contributing documentation is in `/packages/app-web-docs/src/docs/contributing/`

## Project Organization

- Main extension code is in `/packages/app-vscode/`
- Engine code is in `/packages/lib-engine/`
- Tests are in `resources/fixtures/`
- Language-specific parsing is defined in the `resources/queries/*.scm` files

## Build and Test

- Always run lint when making changes:
  - `pnpm run lint`
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
- Always check test fixtures in `/resources/fixtures/` to understand behavior
- Implementation for many actions is in `/packages/lib-engine/src/actions/`
- After running Python scripts or tests, delete any `__pycache__` directories and `.pyc` files created under the repository root.

## Scope test format

When writing or updating `.scope` files please follow the guidelines in [scope-test-format.md](./packages/app-web-docs/src/docs/contributing/scope-test-format.md)

## Pull Request Guidelines

- Any feedback should be addressed in code or replied to
- Tests should be included for new functionality
- Documentation should be updated to reflect changes
- Make sure changes are consistent with the project architecture
