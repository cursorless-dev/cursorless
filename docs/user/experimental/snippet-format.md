# Cursorless snippet format

Cursorless has experimental support for snippets. Currently these snippets are just used for wrapping targets.

The best place to start is to look at the [core cursorless snippets](../../../cursorless-snippets). Additionally, there is autocomplete with documentation as you're writing a snippet.

Note that for `body`, we support [the full textmate syntax supported by VSCode](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax), but we prefer to use variable names (eg `$foo`) instead of placeholders (eg `$1`) so that it is easy to use snippets for wrapping.
