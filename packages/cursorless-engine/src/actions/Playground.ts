import { FlashStyle, Range, TextDocument } from "@cursorless/common";
import * as path from "node:path";
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

    const results: string[] = ["# Cursorless playground"];

    for (const target of targets) {
      const {
        editor: { document },
        contentRange,
      } = target;
      const tree = this.treeSitter.getTree(document);
      results.push(parseTree(tree, document, contentRange));
    }

    ide().openUntitledTextDocument({
      language: "markdown",
      content: results.join("\n\n"),
    });

    return { thatTargets: targets };
  }
}

function parseTree(tree: Tree, document: TextDocument, range: Range): string {
  const results: string[] = [
    `## ${path.basename(document.uri.path)} ${range}\n`,
    `\`\`\`${document.languageId}`,
    document.getText(range),
    "```\n",
    "```js",
  ];
  const cursor = tree.walk();

  parseCursor(results, range, 0, cursor);

  results.push("```");

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

      if (cursor.gotoFirstChild()) {
        parseCursor(results, range, numIndents + 1, cursor);
        cursor.gotoParent();
      }
    }

    if (!cursor.gotoNextSibling()) {
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
