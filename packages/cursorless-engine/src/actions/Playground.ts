import { FlashStyle, Range, TextDocument } from "@cursorless/common";
import * as path from "node:path";
import type { Tree, TreeCursor } from "web-tree-sitter";
import type { TreeSitter } from "..";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import { flashTargets } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class Playground {
  constructor(private treeSitter: TreeSitter) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(ide(), targets, FlashStyle.referenced);

    const results: string[] = ["# Cursorless playground"];

    for (const target of targets) {
      const { editor, contentRange } = target;
      const tree = this.treeSitter.getTree(editor.document);
      results.push(parseTree(editor.document, tree, contentRange));
    }

    ide().openUntitledTextDocument({
      language: "markdown",
      content: results.join("\n\n"),
    });

    return { thatTargets: targets };
  }
}

function parseTree(
  document: TextDocument,
  tree: Tree,
  contentRange: Range,
): string {
  const results: string[] = [
    `## ${path.basename(document.uri.path)} [${contentRange}]\n`,
    `\`\`\`${document.languageId}`,
    document.getText(contentRange),
    "```\n",
    "```js",
  ];

  parseCursor(results, contentRange, tree.walk(), 0);

  results.push("```");

  return results.join("\n");
}

function parseCursor(
  results: string[],
  contentRange: Range,
  cursor: TreeCursor,
  numIndents: number,
): void {
  while (true) {
    const nodeRange = new Range(
      cursor.startPosition.row,
      cursor.startPosition.column,
      cursor.endPosition.row,
      cursor.endPosition.column,
    );

    if (contentRange.intersection(nodeRange) != null) {
      results.push(
        `${getIndentation(numIndents)}${getFieldName(cursor)}${getType(
          cursor,
        )} [${nodeRange}]`,
      );

      if (cursor.gotoFirstChild()) {
        parseCursor(results, contentRange, cursor, numIndents + 1);
        cursor.gotoParent();
      }
    }

    if (!cursor.gotoNextSibling()) {
      return;
    }
  }
}

function getIndentation(length: number): string {
  return "  ".repeat(length);
}

function getFieldName(cursor: TreeCursor): string {
  const field = cursor.currentFieldName();
  return field != null ? `${field}: ` : "";
}

function getType(cursor: TreeCursor): string {
  return cursor.nodeIsNamed ? cursor.nodeType : `"${cursor.nodeType}"`;
}
