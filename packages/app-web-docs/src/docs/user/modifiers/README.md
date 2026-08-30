# Modifiers

## Scope containment

- [`"<scope>"`](./containingScope.mdx) - Containing instance of `<scope>`.
- [`"every <scope>"`](./everyScope.mdx) - Every instance of `<scope>`.
- [`"grand <scope>"`](./ancestor.mdx) - Parent of the containing instance of `<scope>`.

## Ordinal scope

- [`"<ordinal> <scope>"`](./ordinalScope.mdx) - `<ordinal>` instance of `<scope>` in iteration scope.
- [`"<ordinal> last <scope>"`](./ordinalScope.mdx) - `<ordinal>`-to-last instance of `<scope>` in iteration scope.
- [`"first <number> <scope>s"`](./ordinalScope.mdx) - First `<number>` instances of `<scope>` in iteration scope, as contiguous range.
- [`"every first <number> <scope>s"`](./ordinalScope.mdx) - First `<number>` instances of `<scope>` in iteration scope, as individual targets.
- [`"last <number> <scope>s"`](./ordinalScope.mdx) - Last `<number>` instances of `<scope>` in iteration scope, as contiguous range.
- [`"every last <number> <scope>s"`](./ordinalScope.mdx) - Last `<number>` instances of `<scope>` in iteration scope, as individual targets.

## Relative scope

- [`"previous <scope>"`](./relativeScope.mdx) - Previous instance of `<scope>`.
- [`"<ordinal> previous <scope>"`](./relativeScope.mdx) - `<ordinal>` instance of `<scope>` before target.
- [`"next <scope>"`](./relativeScope.mdx) - Next instance of `<scope>`.
- [`"<ordinal> next <scope>"`](./relativeScope.mdx) - `<ordinal>` instance of `<scope>` after target.
- [`"<scope> backward"`](./relativeScope.mdx) - Single instance of `<scope>` including target, going backwards.
- [`"<scope> forward"`](./relativeScope.mdx) - Single instance of `<scope>` including target, going forwards.
- [`"<number> <scope>s backward"`](./relativeScope.mdx) - `<number>` instances of `<scope>` including target, going backwards, as contiguous range.
- [`"every <number> <scope>s backward"`](./relativeScope.mdx) - `<number>` instances of `<scope>` including target, going backwards, as individual targets.
- [`"<number> <scope>s"`](./relativeScope.mdx) - `<number>` instances of `<scope>` including target, going forwards, as contiguous range.
- [`"every <number> <scope>s"`](./relativeScope.mdx) - `<number>` instances of `<scope>` including target, going forwards, as individual targets.
- [`"previous <number> <scope>s"`](./relativeScope.mdx) - Previous `<number>` instances of `<scope>`, as contiguous range.
- [`"every previous <number> <scope>s"`](./relativeScope.mdx) - Previous `<number>` instances of `<scope>`, as individual targets.
- [`"next <number> <scope>s"`](./relativeScope.mdx) - Next `<number>` instances of `<scope>`, as contiguous range.
- [`"every next <number> <scope>s"`](./relativeScope.mdx) - Next `<number>` instances of `<scope>`, as individual targets.

## Interiors / delimiters

- [`"inside"`](./interiorOnly.mdx) - Interior only.
- [`"bounds"`](./excludeInterior.mdx) - Bounding paired delimiters.
- [`"leading"`](./leading.mdx) - Leading delimiter range.
- [`"trailing"`](./trailing.mdx) - Trailing delimiter range.

## Range extension

- [`"head"`](./extendThroughStartOf.mdx) - Extend through start of line/pair.
- [`"head <modifier>"`](./extendThroughStartOf.mdx) - Extend through start of `<modifier>`.
- [`"tail"`](./extendThroughEndOf.mdx) - Extend through end of line/pair.
- [`"tail <modifier>"`](./extendThroughEndOf.mdx) - Extend through end of `<modifier>`.

## Positions

- [`"start of"`](./startOf.mdx) - Empty position at start of target.
- [`"end of"`](./endOf.mdx) - Empty position at end of target.

## Filters

- [`"visible"`](./visible.mdx) - Visible in viewport.
- [`"content"`](./keepContentFilter.mdx) - Keep content filter.
- [`"empty"`](./keepEmptyFilter.mdx) - Keep empty filter.

## Inference

- [`"just"`](./toRawSelection.mdx) - No inference.
- [`"its"`](./inferPreviousMark.mdx) - Infer previous mark.
