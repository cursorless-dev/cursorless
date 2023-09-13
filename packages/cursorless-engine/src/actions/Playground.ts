import { FlashStyle, Range } from "@cursorless/common";
import { Tree, TreeCursor } from "web-tree-sitter";
import type { TreeSitter } from "..";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { flashTargets } from "../util/targetUtils";
import { ActionReturnValue } from "./actions.types";

export default class Playground {
  constructor(private treeSitter: TreeSitter) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(ide(), targets, FlashStyle.referenced);

    const results: string[] = [];

    console.log("start");

    for (const target of targets) {
      const tree = this.treeSitter.getTree(target.editor.document);
      results.push(parseTree(tree, target.contentRange));
    }

    console.log("done");
    console.log(results.join("\n"));

    // ide().openUntitledTextDocument({ content: results.join("\n") });

    return { thatTargets: targets };
  }
}

// function parseTree(tree: Tree, range: Range): string {
//   const results: string[] = [];

//   const cursor = tree.walk();

//   let goParents = 0;
//   let numIndents = 0;

//   while (true) {
//     if (useNode(cursor, range)) {
//       results.push(
//         `${getIndentation(numIndents)}${getFieldName(cursor)}${
//           cursor.nodeType
//         } ${getRangeText(cursor)}`,
//       );
//     }

//     if (cursor.gotoFirstChild()) {
//       goParents++;
//       numIndents++;
//     } else if (!cursor.gotoNextSibling()) {
//       if (goParents === 0) {
//         break;
//       }

//       while (goParents > 0) {
//         cursor.gotoParent();
//         goParents--;
//         numIndents--;

//         if (cursor.gotoNextSibling()) {
//           break;
//         }
//       }
//     }
//   }

//   return results.join("\n");
// }

function parseTree(tree: Tree, range: Range): string {
  const results: string[] = [];
  const cursor = tree.walk();

  parseCursor(results, range, 0, cursor);

  return results.join("\n");
}

function parseCursor(
  results: string[],
  range: Range,
  numIndents: number,
  cursor: TreeCursor,
): void {
  while (true) {
    if (useNode(cursor, range)) {
      results.push(
        `${getIndentation(numIndents)}${getFieldName(cursor)}${
          cursor.nodeType
        } ${getRangeText(cursor)}`,
      );

      const node = cursor.currentNode();

      if (cursor.gotoFirstChild()) {
        parseCursor(results, range, numIndents + 1, cursor);
        cursor.reset(node);
      }
    }

    console.log(cursor.nodeType);

    if (!cursor.gotoNextSibling()) {
      console.log("no sibling");
      return;
    }
  }
}

function useNode(cursor: TreeCursor, range: Range) {
  if (!cursor.nodeIsNamed) {
    return false;
  }
  const nodeRange = new Range(
    cursor.startPosition.row,
    cursor.startPosition.column,
    cursor.endPosition.row,
    cursor.endPosition.column,
  );
  return range.intersection(nodeRange) != null;
}

function getIndentation(length: number): string {
  return "  ".repeat(length);
}

function getRangeText(cursor: TreeCursor): string {
  return `[${cursor.startPosition.row}, ${cursor.startPosition.column}] - [${cursor.endPosition.row}, ${cursor.endPosition.column}]`;
}

function getFieldName(cursor: TreeCursor): string {
  const field = cursor.currentFieldName();
  return field != null ? `${field}: ` : "";
}
