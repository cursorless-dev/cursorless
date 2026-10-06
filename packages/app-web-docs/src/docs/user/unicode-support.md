---
sidebar_group: Advanced
sidebar_position: 2
---

# Unicode support

Cursorless has first-class support for Unicode. With the default Talon alphabet, Cursorless ignores capitalization and accents or diacritics when constructing hats. For example, each of the following four tokens could be selected by saying `"take air"` if there were a gray hat over its first letter:

- africa
- áfrica
- Africa
- África

Characters that do not have a known spoken form, even after normalization, can be referred to using `"special"`. For example, if there were a blue hat over a `😄` character, you could say `"take blue special"` to select it. This also works for letters that cannot be normalized to a known character, such as Chinese characters. As always, the spoken form `"special"` can be [customized](customization.md).

## Advanced customization

With an up-to-date Cursorless Talon installation, Cursorless automatically preserves additional characters provided by the Talon lists used in your `<user.any_alphanumeric_key>` capture. Add your spoken forms there; no editor setting is needed. This lets Cursorless allocate hats separately for these characters instead of grouping them with normalized letters or `"special"`.

The old `cursorless.tokenHatSplittingMode` settings (`preserveCase`, `lettersToPreserve`, and `symbolsToPreserve`) are deprecated and can be removed from your editor settings.

### Preserving case

If your `<user.any_alphanumeric_key>` capture provides separate spoken forms for uppercase letters, Cursorless preserves those letters automatically. For example, if `"upper air"` produces `A`, a gray hat on the `A` in `Africa` can be addressed with `"take upper air"`, while a gray hat on lowercase `a` uses `"take air"`.

### Preserving special letters

If your capture provides terms for accented letters, such as `é`, or other letters, such as `ø` or `ꝏ`, Cursorless preserves them automatically.

For example, if `"a umlaut"` produces `ä` and you have no separate form for `Ä`, a gray hat over the first letter of either `ällo` or `Ällo` can be addressed with `"take a umlaut"`. If you also provide a spoken form for `Ä`, Cursorless treats it separately. Providing only `Ä` does not preserve lowercase `ä`; lowercase `ä` still normalizes to `a`.

### Preserving symbols

Symbols provided by your capture are also preserved automatically. For example, if `"sigma"` produces `σ` and `"upper sigma"` produces `Σ`, a blue hat on those characters can be addressed with `"take blue sigma"` and `"take blue upper sigma"`, respectively.

## Normalization order

Cursorless first normalizes each character to Unicode NFC so that equivalent representations, such as an accented letter written as one codepoint or with a combining mark, are treated the same. It then:

1. Preserves the character if it is a default character or is provided by Talon.
2. Otherwise, converts it to lowercase and uses that form if it is known.
3. Otherwise, strips accents and diacritics and uses the resulting form if it is known.
4. Otherwise, assigns it to `"special"`.

If custom characters cannot be loaded from Talon, Cursorless uses the default alphabet, digits, and symbols.
