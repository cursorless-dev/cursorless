# Unicode

Cursorless has first-class support for Unicode. By default, when constructing hats, Cursorless will ignore capitalization and any accents or diacritics over letters. For example, each of the following four tokens could each be selected by saying `"take air"` if there were a gray hat over their first letter (note the accents on the first letter for some of them):

- africa
- áfrica
- Africa
- África

For Unicode symbols that are not letters, and that are not speakable by default, for example emoji, Chinese characters, etc, we have a special "character" called `"special"` that can be used. So for example, if there were a blue hat over a '😄' character, you could say `"take blue special"` to select it. As always, the spoken form `"special"` can be [customized](customization.md).

## Advanced customization

The above setup will allow you to refer to any Unicode token, and is sufficient for most users. However, if you have overridden your `<user.any_alphanumeric_key>` capture to contain characters other than lowercase letters and the default symbols, you can tell Cursorless to be less aggressive with its normalization, so that it can allocate hats more efficiently. Note that this is not necessary in order to refer to these tokens; it just makes hat allocation slightly more efficient.

### Preserving case

If you have a separate alphabet for uppercase letters as part of `<user.any_alphanumeric_key>`, you can enable the _Cursorless › Token Hat Splitting Mode: **Preserve Case**_ setting, and Cursorless will distinguish between lower and uppercase letters.

### Preserving special letters

If you have terms in `<user.any_alphanumeric_key>` for letters with accents, such as `é`, or other letters, such as `ø` or `ꝏ`, you can use the following setting:

#### _Cursorless › Token Hat Splitting Mode: **Letters To Preserve**_

Add any accented letters to this list that you have a spoken form for in `<user.any_alphanumeric_key>`. Cursorless will then preserve their accents during normalization. Note that Cursorless will still do case normalisation for these letters if you have [case preservation](#preserving-case) on. So, for example, if the list contains `ä`, and you'd like to refer to the token `Ällo` with a hat over the first letter (`Ä`), you can use your spoken form for `ä`.

### _Cursorless › Token Hat Splitting Mode: **Symbols To Preserve**_

Any Unicode symbols in this list will not undergo any normalisation, even case normalisation. Use this list for symbols for which you have spoken forms in `<user.any_alphanumeric_key>` that shouldn't be normalised at all, even by case. For example, if you have spoken forms for `Σ` and `σ`, and would like Cursorless not to treat them the same, you can add them to this list.
