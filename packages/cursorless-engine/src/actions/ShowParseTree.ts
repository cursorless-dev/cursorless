import { FlashStyle, Range, TextDocument } from "@cursorless/common";
import * as path from "node:path";
import type { Tree, TreeCursor } from "web-tree-sitter";
import type { TreeSitter } from "../typings/TreeSitter";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import { flashTargets } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class ShowParseTree {
  constructor(private treeSitter: TreeSitter) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    await flashTargets(ide(), targets, FlashStyle.referenced);

    const results: string[] = ["# Cursorless parse tree"];

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
  const resultPlayground: string[] = [];
  const resultQuery: string[] = [];

  parseCursor(resultPlayground, resultQuery, contentRange, tree.walk(), 0);

  return [
    `## ${path.basename(document.uri.path)} [${contentRange}]\n`,
    `\`\`\`${document.languageId}`,
    document.getText(contentRange),
    "```",
    "",
    "```scm",
    ...resultQuery,
    "```",
    "",
    "```js",
    ...resultPlayground,
    "```",
    "",
  ].join("\n");
}

function parseCursor(
  resultPlayground: string[],
  resultQuery: string[],
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
      const indentation = "  ".repeat(numIndents);
      const fieldName = getFieldName(cursor);
      const prefix = indentation + fieldName;

      // Named node
      if (cursor.nodeIsNamed) {
        resultPlayground.push(`${prefix}${cursor.nodeType} [${nodeRange}]`);
        resultQuery.push(`${prefix}(${cursor.nodeType}`);

        // Named node with children
        if (cursor.gotoFirstChild()) {
          parseCursor(
            resultPlayground,
            resultQuery,
            contentRange,
            cursor,
            numIndents + 1,
          );
          cursor.gotoParent();
          resultQuery.push(`${indentation})`);
        }
        // Named node without children
        else {
          resultQuery[resultQuery.length - 1] += ")";
        }
      }
      // Anonymous node
      else {
        const type = `"${cursor.nodeType}"`;
        resultPlayground.push(`${prefix}${type} [${nodeRange}]`);
        resultQuery.push(`${prefix}${type}`);
      }
    }

    if (!cursor.gotoNextSibling()) {
      return;
    }
  }
}

function getFieldName(cursor: TreeCursor): string {
  const field = cursor.currentFieldName();
  return field != null ? `${field}: ` : "";
}
