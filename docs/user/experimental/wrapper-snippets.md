# Wrapper snippets

![Wrapper snippet demo](images/tryWrapFine.gif)
![Link wrap](images/linkWrap.gif)

In addition to wrapping with paired delimiters (eg `"square wrap"`, `"round wrap"`, etc), we experimentally support wrapping with snippets. Cursorless ships with a few built-in snippets, but users can also use their own snippets.

## Enabling wrapper snippets

Add the following line to the end of your `settings.talon` (or any other `.talon` file that will be active when vscode is focused):

```
tag(): user.cursorless_experimental_snippets
```

## Using wrapper snippets

### Command syntax

The command syntax is as follows:

```
"<snippet_name> wrap <target>"
```

### Examples

- `"try wrap air"`: Wrap the statement containing the marked `a` in a try-catch statement
- `"try wrap air past bat"`: Wrap the sequence of statements from the marked `a` to the marked `b` in a try-catch statement

### Default scope types

Each snippet wrapper has a default scope type. When you refer to a target, by default it will expand to the given scope type. This way, for example, when you say `"try wrap air"`, it will refer to the statement containing `a` rather than just the token.

## Built-in wrapper snippets

| Default spoken form | Snippet                                       | Default target scope type |
| ------------------- | --------------------------------------------- | ------------------------- |
| `"if wrap"`         | If statement                                  | Statement                 |
| `"else wrap"`       | If-else statement; target goes in else branch | Statement                 |
| `"if else wrap"`    | If-else statement; target goes in if branch   | Statement                 |
| `"try wrap"`        | Try-catch statement                           | Statement                 |
| `"link wrap"`       | Markdown link                                 |                           |

## Customizing spoken forms

As usual, the spoken forms for these wrapper snippets can be [customized by csv](../customization.md). The csvs are in the file `cursorless-settings/experimental/wrapper_snippets.csv`.

## Adding your own snippets

To define your own wrapper snippets, proceed as follows:

### Define snippets in vscode

1. Set the `cursorless.experimental.snippetsDir` setting to a directory in which you'd like to create your snippets.
2. Add snippets to the directory in files ending in `.cursorless-snippets`. See the [documentation](snippet-format.md) for the cursorless snippet format.

### 2. Add snippet to spoken forms csv

For each snippet that you'd like to be able to use as a wrapper snippet, add a line to the `cursorless-settings/experimental/wrapper_snippets.csv` csv overrides file. The first column is the desired spoken form, and the second column is of the form `<name>.<variable>`, where `name` is the name of the snippet (ie the key in your snippet json file), and `variable` is one of the placeholder variables in your snippet where the target should go.

## Customizing built-in snippets

To customize a built-in snippet, just define a custom snippet (as above), but
use the same name as the cursorless core snippet you'd like to change, and give
definitions along with scopes where you'd like your override to be active. Here
is an example:

```json
{
  "tryCatchStatement": {
    "definitions": [
      {
        "scope": {
          "langIds": [
            "typescript",
            "typescriptreact",
            "javascript",
            "javascriptreact"
          ]
        },
        "body": ["try {", "\t$body", "} catch (err) {", "\t$exceptBody", "}"]
      }
    ]
  }
}
```

The above will change the definition of the try-catch statement in typescript.
