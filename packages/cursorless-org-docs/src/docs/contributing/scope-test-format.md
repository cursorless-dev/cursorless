# Scope test format

We have a custom format we use to test that our scopes are correct. The format is automatically generated, so you shouldn't need to edit it yourself. See [Step 6 of the adding a new scope guide](./adding-a-new-scope.md#6-update-the-tests) for more information.

## Example

Example of `.scope` file for the javascript if statement scope.

```
if (true) {

}
---

[Content] =
[Removal] =
[Domain] = 0:0-2:1
  >-----------
0| if (true) {
1|
2| }
   -<

[Insertion delimiter] = "\n"
```

## Understanding the format

General layout of a `.scope` file is:

```
Source code
---
Scopes
```

## Source code

The code that you want to generate scopes for. We try to keep this as short and simple as possible while still containing the syntax you want to test.

## Scopes

One or more scopes found in the source code. Each scope is a collection of ranges as well as an insertion delimiter.

A description of the different ranges and how they are used is available in our [glossary](../user/glossary.md).

### Scope ranges

The below example indicates that the content range, removal range, and domain range was the same. Line 0, column 0, to line 2, column 1. These ranges could also be different and in that case each show up as a separate range.

```
[Content] =
[Removal] =
[Domain] = 0:0-2:1
```

Each range is also visualized:

```
  >-----------
0| if (true) {
1|
2| }
   -<
```

On the left hand side we first have the line numbers, a pipe separator, and finally the source code. The range is visualized by starting after `>` and ending before `<`. Note that `>` and `<` is excluded from the range. That means a range of length one is `>-<` and an empty range is `><`.
