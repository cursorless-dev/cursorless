#!/usr/bin/env bash

cat /Users/pokey/src/cursorless-vscode/src/actions/index.ts \
    | sed \
      -e 's/call = /callAsFunction = /g' \
      -e 's/clear = /clearAndSetSelection = /g' \
      -e 's/copy = /copyToClipboard = /g' \
      -e 's/cut = /cutToClipboard = /g' \
      -e 's/editNewLineBelow = /editNewLineAfter = /g' \
      -e 's/editNewLineAbove = /editNewLineBefore = /g' \
      -e 's/findInFiles = /findInWorkspace = /g' \
      -e 's/fold = /foldRegion = /g' \
      -e 's/indentLines = /indentLine = /g' \
      -e 's/copyLinesDown = /insertCopyAfter = /g' \
      -e 's/copyLinesUp = /insertCopyBefore = /g' \
      -e 's/insertEmptyLineBelow = /insertEmptyLineAfter = /g' \
      -e 's/insertEmptyLineAbove = /insertEmptyLineBefore = /g' \
      -e 's/move = /moveToTarget = /g' \
      -e 's/outdentLines = /outdentLine = /g' \
      -e 's/paste = /pasteFromClipboard = /g' \
      -e 's/delete = /remove = /g' \
      -e 's/bring = /replaceWithTarget = /g' \
      -e 's/reverse = /reverseTargets = /g' \
      -e 's/sort = /sortTargets = /g' \
      -e 's/swap = /swapTargets = /g' \
      -e 's/setBreakpoint = /toggleLineBreakpoint = /g' \
      -e 's/commentLines = /toggleLineComment = /g' \
      -e 's/unfold = /unfoldRegion = /g' \
      -e 's/wrap = /wrapWithPairedDelimiter = /g'
