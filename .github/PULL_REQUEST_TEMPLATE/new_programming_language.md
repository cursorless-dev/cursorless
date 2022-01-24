## What

Adds support for the `<language>` programming language

## Checklist

- [ ] Recorded tests for the new language
- [ ] Used `"clear"` instead of` "take"` for selection tests to make recorded tests easier to read
- [ ] Added tests that use `"chuck"` to test removal behaviour
  - [ ] `"chuck arg"` with single argument in list
  - [ ] `"chuck arg"` with multiple arguments in list
  - [ ] `"chuck item"` with single argument in list
  - [ ] `"chuck item"` with multiple arguments in list
- [ ] Added a test for `"clear round"` inside a string, eg `"hello (there)"`
- [ ] Supported` "type"` both for type annotations (eg `foo: string`) and declarations (eg `interface Foo {}`) (and added tests for this behaviour 😊)
- [ ] Supported` "item"` both for map pairs and list entries (with tests of course)
