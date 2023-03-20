import fs from 'fs-extra';
import path from 'path';
import * as yaml from 'yaml';
import { getHighlighter } from 'shiki';

import { renderToHtml, HatType, SelectionType, Token } from './renderToHtml.js';
import { buildSpokenForm } from './buildSpokenForm.js';
import { loadFixture } from './loadFixture.js';

const cursorlessRoot = path.resolve('../../../src');

const fixturesDir = path.join(
  cursorlessRoot,
  'test',
  'suite',
  'fixtures',
  'recorded'
);

const highlighter = await getHighlighter({ theme: 'css-variables' });

function insertHat(
  line: Extract<Token, { type: 'token' | 'hat' }>[],
  hatType: HatType,
  markCharacter: string,
  wordStart: number
) {
  let rawIndex = 0;
  for (let t = 0; t < line.length; t += 1) {
    const token = line[t];
    if (token.content.length + rawIndex < wordStart) {
      rawIndex += token.content.length;
      continue;
    }
    for (let i = 0; i < token.content.length; i += 1) {
      rawIndex += 1;
      if (token.content[i] === markCharacter) {
        line.splice(
          t,
          1,
          { ...token, content: token.content.substring(0, i) },
          {
            type: 'hat',
            hatType,
            content: token.content.substring(i, i + 1),
          },
          { ...token, content: token.content.substring(i + 1) }
        );
        return;
      }
    }
    throw new Error(`Mark not found`);
  }
}

interface SelectionAnchor {
  line: number;
  character: number;
}

function applySelection(
  lines: Token[][],
  type: SelectionType,
  selections: CursorlessFixtureSelection[],
  lineOptions: any
) {
  if (!selections || !selections.length) return;
  selections.forEach((selection) => {
    const { anchor: start, active: end } = selection;
    if (selection.name) {
      type += ` ${selection.name}`;
    }
    if (selection.type === 'line') {
      for (let i = start.line + 1; i <= end.line + 1; i += 1)
        lineOptions.push({
          line: i,
          classes: type.split(' '),
        });
      return;
    }
    for (let l = end.line; l <= start.line; l += 1) {
      if (l !== end.line && l !== start.line) {
        lines[l] = [
          {
            type: 'selection',
            selection: lines[l],
            selectionType: type,
          },
        ];
        continue;
      }
      let anchorCharacter = end.character;
      let activeCharacter = start.character;
      if (end.line !== start.line) {
        if (l === end.line) {
          activeCharacter = Infinity;
        } else {
          anchorCharacter = 0;
        }
      }
      const line = lines[l];
      let rawIndex = 0;
      let accumulator: Token[] = [];
      const indexStack = [0];
      const selectionsStack = [line];
      while (indexStack.length > 0) {
        const currentIndex = indexStack[indexStack.length - 1];
        const currentSelection = selectionsStack[selectionsStack.length - 1];
        const token = currentSelection[currentIndex];
        if (!token) {
          indexStack.pop();
          selectionsStack.pop();
          accumulator = [];
          continue;
        }
        if (token.type === 'selection') {
          indexStack[indexStack.length - 1] += 1;
          indexStack.push(0);
          selectionsStack.push(token.selection);
          continue;
        }
        const contentLength = token.content.length;
        rawIndex += contentLength;
        if (rawIndex < anchorCharacter) {
          continue;
        }
        const startIndex = contentLength - (rawIndex - anchorCharacter);
        if (!accumulator.length && startIndex >= 0) {
          currentSelection.splice(
            currentIndex,
            1,
            {
              ...token,
              content: token.content.substring(0, startIndex),
            },
            {
              type: 'selection',
              selectionType: type,
              selection: accumulator,
            }
          );
          accumulator.push({
            ...token,
            content: token.content.substring(
              contentLength - (rawIndex - anchorCharacter)
            ),
          });
          indexStack[indexStack.length - 1] += 1;
        } else if (rawIndex > activeCharacter) {
          if (!accumulator.length) {
            currentSelection.splice(
              currentIndex,
              1,
              {
                ...token,
                content: token.content.substring(0, startIndex),
              },
              {
                type: 'selection',
                selectionType: type,
                selection: [
                  {
                    ...token,
                    content: token.content.substring(
                      contentLength - (rawIndex - anchorCharacter)
                    ),
                  },
                ],
              }
            );
          } else {
            accumulator.push({
              ...token,
              content: token.content.substring(
                0,
                contentLength - (rawIndex - activeCharacter)
              ),
            });
            currentSelection[currentIndex] = {
              ...token,
              content: token.content.substring(
                contentLength - (rawIndex - activeCharacter)
              ),
            };
          }
          break;
        } else {
          currentSelection.splice(currentIndex, 1);
          accumulator.push(token);
          indexStack[indexStack.length - 1] += 1;
        }
      }
    }
  });
}
interface CursorlessFixtureSelection {
  type: 'line' | 'selection';
  name?: string;
  anchor: SelectionAnchor;
  active: SelectionAnchor;
}

Promise.all([
  loadFixture('actions', 'bringArgMadeAfterLook'),
  loadFixture('decorations', 'chuckBlockAirUntilBatt'),
  loadFixture('decorations', 'cutFine'),
  loadFixture('decorations', 'chuckLineFine'),
  loadFixture('actions', 'bringAirAndBatAndCapToAfterItemEach'),
]).then((allItems) => {
  allItems.forEach((item) => {
    if (item)
      console.log(`
.wrapper
  .before
    ${item.before.replace(/\n/gi, '\n    ')}
  .during
    ${(item.during || item.before).replace(/\n/gi, '\n    ')}
    .command ${item.command}
  .after
    ${item.after.replace(/\n/gi, '\n    ')}
`);
  });
});
