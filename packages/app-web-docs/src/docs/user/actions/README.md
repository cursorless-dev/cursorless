# Actions

## Cursor movement

- [`"take <target>"`](./setSelection.mdx) - Set selection to `<target>`.
- [`"pre <target>"`](./setSelectionBefore.mdx) - Set empty selection before `<target>`.
- [`"post <target>"`](./setSelectionAfter.mdx) - Set empty selection after `<target>`.
- [`"append <target>"`](./addSelection.mdx) - Adds `<target>` to the current selection set.
- [`"append pre <target>"`](./addSelectionBefore.mdx) - Adds empty selection before `<target>` to the current selection set.
- [`"append post <target>"`](./addSelectionAfter.mdx) - Adds empty selection after `<target>` to the current selection set.
- [`"give <target>"`](./deselect.mdx) - Deselect `<target>`.

## Changing a target

- [`"chuck <target>"`](./remove.mdx) - Remove `<target>`.
- [`"change <target>"`](./clearAndSetSelection.mdx) - Change `<target>` by clearing it and leaving the cursor in its place.

## Clone

- [`"clone <target>"`](./insertCopyAfter.mdx) - Insert copy after `<target>`.
- [`"clone up <target>"`](./insertCopyBefore.mdx) - Insert copy before `<target>`.

## Cut, copy, and paste

- [`"carve <target>"`](./cutToClipboard.mdx) - Cut `<target>` to clipboard.
- [`"copy <target>"`](./copyToClipboard.mdx) - Copy `<target>` to clipboard.
- [`"paste <destination>"`](./pasteFromClipboard.mdx) - Paste from clipboard at `<destination>`.

## Swap

- [`"swap with <target>"`](./swapTargets.mdx) - Swap selection with `<target>`.
- [`"swap <target 1> with <target 2>"`](./swapTargets.mdx) - Swap `<target 1>` with `<target 2>`.

## Indent and outdent

- [`"indent <target>"`](./indentLine.mdx) - Indent line containing `<target>`.
- [`"dedent <target>"`](./outdentLine.mdx) - Outdent line containing `<target>`.

## Increment and decrement

- [`"increment <target>"`](./increment.mdx) - Increment number at `<target>`.
- [`"decrement <target>"`](./decrement.mdx) - Decrement number at `<target>`.

## Insert empty lines or scopes

- [`"drink <target>"`](./editNewLineBefore.mdx) - Edit new line before `<target>`.
- [`"drink <scope> <target>"`](./editNewLineBefore.mdx) - Edit new `<scope>` before `<target>`.
- [`"pour <target>"`](./editNewLineAfter.mdx) - Edit new line after `<target>`.
- [`"pour <scope> <target>"`](./editNewLineAfter.mdx) - Edit new `<scope>` after `<target>`.
- [`"drop <target>"`](./insertEmptyLineBefore.mdx) - Insert empty line/scope before `<target>`.
- [`"float <target>"`](./insertEmptyLineAfter.mdx) - Insert empty line/scope after `<target>`.
- [`"puff <target>"`](./insertEmptyLinesAround.mdx) - Insert empty lines/scopes around `<target>`.

## Homophones

- [`"phones <target>"`](./nextHomophone.mdx) - Cycle to next homophone for `<target>`.

## Rename

- [`"rename <target>"`](./rename.mdx) - Rename `<target>`.

## Scroll

- [`"crown <target>"`](./scrollToTop.mdx) - Scroll `<target>` to top of the viewport.
- [`"center <target>"`](./scrollToCenter.mdx) - Scroll `<target>` to center of the viewport.
- [`"bottom <target>"`](./scrollToBottom.mdx) - Scroll `<target>` to bottom of the viewport.

## Insert, use, and repeat

- [`"bring <target>"`](./replaceWithTarget.mdx) - Insert copy of `<target>` at selection.
- [`"bring <target> <destination>"`](./replaceWithTarget.mdx) - Copy `<target>` to `<destination>`.
- [`"call <target>"`](./callAsFunction.mdx) - Insert call to `<target>` on selection.
- [`"call <target 1> on <target 2>"`](./callAsFunction.mdx) - Insert call to `<target 1>` on `<target 2>`.

## Move and replace

- [`"move <target>"`](./moveToTarget.mdx) - Move `<target>` to selection.
- [`"move <target> <destination>"`](./moveToTarget.mdx) - Move `<target>` to `<destination>`.

## Reverse, shuffle, and sort

- [`"reverse <target>"`](./reverseTargets.mdx) - Reverse `<target>`s.
- [`"shuffle <target>"`](./randomizeTargets.mdx) - Randomize `<target>`s.
- [`"sort <target>"`](./sortTargets.mdx) - Sort `<target>`s.

## Wrap and rewrap

- [`"<pair> wrap <target>"`](./wrapWithPairedDelimiter.mdx) - Wrap `<target>` with `<pair>`.
- [`"<snippet> wrap <target>"`](./wrapWithPairedDelimiter.mdx) - Wrap `<target>` with `<snippet>`.
- [`"<pair> repack <target>"`](./rewrapWithPairedDelimiter.mdx) - Rewrap `<target>` with `<pair>`.

## Navigate and inspect

- [`"define <target>"`](./revealDefinition.mdx) - Reveal definition of `<target>`.
- [`"type deaf <target>"`](./revealTypeDefinition.mdx) - Reveal type definition of `<target>`.
- [`"reference <target>"`](./showReferences.mdx) - Show references for `<target>`.
- [`"hover <target>"`](./showHover.mdx) - Show hover for `<target>`.
- [`"quick fix <target>"`](./showQuickFix.mdx) - Show quick fix for `<target>`.
- [`"scout <target>"`](./findInDocument.mdx) - Find `<target>` in document.
- [`"scout all <target>"`](./findInWorkspace.mdx) - Find `<target>` in workspace.
- [`"follow <target>"`](./followLink.mdx) - Follow link at `<target>`.
- [`"follow split <target>"`](./followLinkAside.mdx) - Follow link at `<target>` aside (e.g. in a split view).
- [`"inspect <target>"`](./showDebugHover.mdx) - Show debug hover for `<target>`.

## Fold and unfold

- [`"fold <target>"`](./foldRegion.mdx) - Fold region at `<target>`.
- [`"unfold <target>"`](./unfoldRegion.mdx) - Unfold region at `<target>`.

## Extract

- [`"extract <target>"`](./extractVariable.mdx) - Extract variable from `<target>`.

## Join

- [`"join <target>"`](./joinLines.mdx) - Join lines at `<target>`.

## Break

- [`"break <target>"`](./breakLine.mdx) - Breaks the line before `<target>`.

## Visual feedback

- [`"flash <target>"`](./flashTargets.mdx) - Flash `<target>`.
- [`"highlight <target>"`](./highlight.mdx) - Highlight `<target>`.

## Snippets

- [`"snip make <target>"`](./generateSnippet.mdx) - Generate snippet from `<target>`.
- [`"snip <snippet> <destination>"`](./insertSnippet.mdx) - Insert snippet at `<destination>`.

## Git

- [`"git accept <target>"`](./gitAccept.mdx) - Accept Git change at `<target>`.
- [`"git revert <target>"`](./gitRevert.mdx) - Revert Git change at `<target>`.
- [`"git stage <target>"`](./gitStage.mdx) - Stage Git change at `<target>`.
- [`"git unstage <target>"`](./gitUnstage.mdx) - Unstage Git change at `<target>`.

## Editor commands

- [`"format <formatter> at <target>"`](./applyFormatter.mdx) - Reformat `<target>` as `<formatter>`.
- [`"comment <target>"`](./toggleLineComment.mdx) - Toggle line comment at `<target>`.
- [`"break point <target>"`](./toggleLineBreakpoint.mdx) - Toggle breakpoint on line containing `<target>`.
- [`"break point token <target>"`](./toggleLineBreakpoint.mdx) - Toggle inline breakpoint at `<target>`.

## Target context

- [`"from <target>"`](./setInstanceReference.mdx) - Set instance reference to `<target>`.
