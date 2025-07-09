# Scope test format

We have a custom format we use to test that our scopes are correct. The format is automatically generated, so you shouldn't need to edit it yourself. See [Step 6 of the adding a new scope guide](./adding-a-new-scope.md#6-update-the-tests) for more information.

## Example

Example of `.scope` file for the javascript statement scope.

```
const value = 0;
---
[Content] =
[Removal] =
[Domain] = 0:0-0:16
  >----------------<
0| const value = 0;

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

The below example indicates that the content range, removal range, and domain range was the same. Line 0, column 0, to line 0, column 16.

```
[Content] =
[Removal] =
[Domain] = 0:0-2:1
```

These ranges could also be different and in that case each show up as a separate range.

```
[Removal] =
[Content] = 0:0-0:6

[Domain] = 0:0-2:1
```

Each range is also visualized:

Single line range

```
  >------------<
0| if (true) {}
```

Multi line range

```
  >-----------
0| if (true) {
1|
2| }
   -<
```

On the left hand side we first have the line numbers, a pipe separator, and finally the source code. The range is visualized by starting after `>` and ending before `<`. Note that `>` and `<` is excluded from the range. That means a range of length one is `>-<` and an empty range is `><`.

## Style guidelines

For ease of readability we want all scope test to follow the recommended style guidelines.

### Naming convention and values

- For classes, functions and variables we use the classic: `foo`, `bar`, `baz`, `bongo`. Language specific formatting still applies. eg `Foo` for a class in Java, `IFoo` for an interface in C# etc.
- For arguments and parameters we usually use: `aaa`, `bbb`, `ccc` and so on.
- For data type we usually use `int` or `number`.
- For value we usually use `0`, `1`, `2` and so on.

Examples:

```
class Foo {}
int foo = 0;
foo(aaa, bbb);
```

### Keep it compact

Don't add more lines than the example actually needs. For example if the test is about the class name, the facet `name.class`: there is no point having a lot of code in the class body or having it span multiple lines. Keep the code single line and with an empty body if possible.

```
        >---<
0| class Foo {}
```

There are two exceptions to this rule:

1. Sometimes we actually need a body, but that doesn't mean that we need it to be multiple lines. The facet `interior.class` can look like this:

```
             >-<
0| class Foo { }
```

2. If you're doing a `iteration.document` test we want to include a leading and trailing new line. eg:

```
  >
0|
1| int foo;
2|
   <
```
