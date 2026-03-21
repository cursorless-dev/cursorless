# Change log

## 2026

- 2026-03-12: Added `userColor3` and `userColor4` as additional user-configurable hat colors. They are disabled by default until you enable and name them. ([#3206](https://github.com/cursorless-dev/cursorless/pull/3206))
- 2026-03-11: Moved scope tests out of VSCode so they can run as regular unit tests with faster local and CI feedback. ([#3210](https://github.com/cursorless-dev/cursorless/pull/3210))
- 2026-03-11: Git actions can now stage and unstage entire files, not just partial selections. ([#3209](https://github.com/cursorless-dev/cursorless/pull/3209))
- 2026-03-01: Greatly expanded scope fixtures and supported scope facets across many languages, including C, C++, C#, Dart, Go, Java, Kotlin, PHP, Rust, Scala, and TypeScript. This work added missing coverage for type aliases, interface methods, enum arguments and argument lists, lambda returns, resources, and more. ([#3198](https://github.com/cursorless-dev/cursorless/pull/3198))
- 2026-02-28: Added missing scope facets for Clojure and Dart, continuing the 2026 scope-coverage expansion. ([#3197](https://github.com/cursorless-dev/cursorless/pull/3197); [#3196](https://github.com/cursorless-dev/cursorless/pull/3196))
- 2026-02-27: Added missing scope facets for PHP. ([#3195](https://github.com/cursorless-dev/cursorless/pull/3195))
- 2026-02-25: Updated `increment` and `decrement` to handle numbers with underscores more reliably while preserving separators. ([#3194](https://github.com/cursorless-dev/cursorless/pull/3194))
- 2026-02-21: Added more scope fixtures for switch cases and other scope patterns across many languages. ([#3184](https://github.com/cursorless-dev/cursorless/pull/3184))
- 2026-02-20: Added missing scope facets for Ruby. ([#3182](https://github.com/cursorless-dev/cursorless/pull/3182))
- 2026-02-14: Added missing scope facets for R. ([#3167](https://github.com/cursorless-dev/cursorless/pull/3167))
- 2026-02-10: Added additional lambda argument scope fixtures across many languages. ([#3166](https://github.com/cursorless-dev/cursorless/pull/3166))
- 2026-02-09: Expanded scope fixtures and supported scope facets across many languages, including additional coverage for generics, type aliases, imports, throws, package scopes, and function-call-related scopes. ([#3164](https://github.com/cursorless-dev/cursorless/pull/3164))
- 2026-02-07: Added more scope fixtures for initialized vs uninitialized variables, constants, and destructuring assignments across many languages. ([#3162](https://github.com/cursorless-dev/cursorless/pull/3162))
- 2026-02-05: Updated scope fixtures for consistency across languages. ([#3157](https://github.com/cursorless-dev/cursorless/pull/3157))
- 2026-02-05: Added a blended range view to the docs scope visualizer to make overlapping scope highlights easier to understand. ([#3158](https://github.com/cursorless-dev/cursorless/pull/3158))
- 2026-02-04: Added broad missing scope coverage for Kotlin, including many new recorded scope fixtures. ([#3154](https://github.com/cursorless-dev/cursorless/pull/3154))
- 2026-02-01: Removed deprecated Cursorless snippets. Cursorless now fully relies on the Talon community for snippet definitions. ([#3151](https://github.com/cursorless-dev/cursorless/pull/3151))
- 2026-01-31: Added broad missing scope coverage for Scala, including many new recorded scope fixtures. ([#3149](https://github.com/cursorless-dev/cursorless/pull/3149))
- 2026-01-06: Added broad missing scope coverage for Go, with a large set of new recorded scope fixtures. ([#3134](https://github.com/cursorless-dev/cursorless/pull/3134))

## 2025

- 2025-11-04: Added the new `fullLine` scope that includes leading and trailing whitespace in the content range. Example: `"change full line"`. ([#3095](https://github.com/cursorless-dev/cursorless/pull/3095))
- 2025-08-30: Added support for `.talon-list` files. ([#3080](https://github.com/cursorless-dev/cursorless/pull/3080))
- 2025-08-29: Added support for `.properties` files. ([#3077](https://github.com/cursorless-dev/cursorless/pull/3077))
- 2025-07-09: Added docs support for visualizing scope tests on the [languages page](https://www.cursorless.org/docs/user/languages). ([#3016](https://github.com/cursorless-dev/cursorless/pull/3016))
- 2025-06-02: Migrated Clojure implementations from legacy support to Tree-sitter queries. ([#2951](https://github.com/cursorless-dev/cursorless/pull/2951))
- 2025-06-02: Migrated LaTeX implementations from legacy support to Tree-sitter queries. ([#2952](https://github.com/cursorless-dev/cursorless/pull/2952))
- 2025-06-01: Migrated Scala implementations from legacy support to Tree-sitter queries. ([#2948](https://github.com/cursorless-dev/cursorless/pull/2948))
- 2025-06-01: Migrated Ruby implementations from legacy support to Tree-sitter queries. ([#2949](https://github.com/cursorless-dev/cursorless/pull/2949))
- 2025-05-06: Added the `"arg list"` scope for the full list of arguments in a declared function. ([#2907](https://github.com/cursorless-dev/cursorless/pull/2907))
- 2025-04-11: Added a languages sidebar to the docs so you can see the supported scope facets for each language. ([#2859](https://github.com/cursorless-dev/cursorless/pull/2859))
- 2025-01-13: Migrated collection items to the next-generation scope framework, adding support for relative navigation, ordinals, multiple selection, and `every` on items. ([#2683](https://github.com/cursorless-dev/cursorless/pull/2683))

## 2024

- 2024-08-12: Updated `drop`, `float`, and `puff` so they behave like `drink` and `pour` for non-line targets, including inserting spaces or delimiters as needed. ([#2646](https://github.com/cursorless-dev/cursorless/pull/2646))
- 2024-08-11: Updated `head` and `tail` so that inside a surrounding pair they expand only to the pair interior instead of the whole line. Use `"head line"` or `"tail line"` for the old behavior. ([#2652](https://github.com/cursorless-dev/cursorless/pull/2652))
- 2024-08-11: Updated `join token` so `"join two tokens air"` removes the whitespace between the tokens instead of joining their lines. ([#2651](https://github.com/cursorless-dev/cursorless/pull/2651))
- 2024-06-14: Added `user.cursorless_create_destination` to the public API. See the [Talon-side API docs](https://www.cursorless.org/docs/user/customization#public-talon-actions) for details. ([#2402](https://github.com/cursorless-dev/cursorless/pull/2402))
- 2024-05-25: Added the public `user.cursorless_reformat` action to the Cursorless API. Example: `user.cursorless_reformat(cursorless_target, "ALL_CAPS")`. ([#2358](https://github.com/cursorless-dev/cursorless/pull/2358))
- 2024-04-21: Added support for using community snippets for wrapping and Cursorless insertion instead of snippets defined in Cursorless. ([#1998](https://github.com/cursorless-dev/cursorless/pull/1998))
- 2024-03-25: Added the `every` / spread ordinal and relative modifier, which turns ordinal and relative range modifiers into multiple target selections instead of a contiguous range. ([#2254](https://github.com/cursorless-dev/cursorless/pull/2254))
- 2024-03-20: Added support for the Lua programming language. ([#1962](https://github.com/cursorless-dev/cursorless/pull/1962))
- 2024-03-19: Added fallback to text-based Talon actions when the editor is not focused, so commands like `"take token"` and `"bring air"` work in places like terminals and search bars. ([#2235](https://github.com/cursorless-dev/cursorless/pull/2235))
- 2024-02-21: Added the `increment` and `decrement` actions for changing numbers. Examples: `"increment this"` changes `1` to `2`, and `"decrement this"` changes `2` to `1`. ([#2236](https://github.com/cursorless-dev/cursorless/pull/2236))

## 2023

- 2023-12-18: Added the `grand` modifier, which selects the containing grandparent scope. Example: `"take grand statement air"`. ([#2130](https://github.com/cursorless-dev/cursorless/pull/2130))
- 2023-12-07: Added the `break` action, which breaks a line in two. Example: `"break air"`. ([#2103](https://github.com/cursorless-dev/cursorless/pull/2103))
- 2023-12-06: Added the `join` action, which joins multiple lines together. Examples: `"join air"` and `"join three lines air"`. ([#1901](https://github.com/cursorless-dev/cursorless/pull/1901))
- 2023-12-05: Added the `visible` modifier, which returns all visible ranges, including multiple ranges when folded regions split the visible area. ([#2094](https://github.com/cursorless-dev/cursorless/pull/2094))
- 2023-11-24: Added support for running VS Code commands from the experimental modal keyboard interface. ([#2026](https://github.com/cursorless-dev/cursorless/pull/2026))
- 2023-11-07: Added `destination: CursorlessDestination` and `scope_type: Optional[Union[str, list[str]]]` arguments to the public Talon API action `user.cursorless_insert_snippet`. ([#1879](https://github.com/cursorless-dev/cursorless/pull/1879))
- 2023-10-24: Updated the default Cursorless hat shapes to improve visibility and color recognition. ([#1868](https://github.com/cursorless-dev/cursorless/pull/1868))
- 2023-09-28: Added an optional second target to the `call` action to specify the argument. Example: `"call air on bat"`. ([#1900](https://github.com/cursorless-dev/cursorless/pull/1900))
- 2023-09-10: Added the `cursorless_insert` action to the public Talon API for defining custom grammars for Cursorless text insertion. ([#1875](https://github.com/cursorless-dev/cursorless/pull/1875))
