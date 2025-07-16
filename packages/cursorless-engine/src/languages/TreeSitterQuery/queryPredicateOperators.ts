import { Position, Range, adjustPosition } from "@cursorless/common";
import type { Point } from "web-tree-sitter";
import { z } from "zod";
import { isEven } from "./isEven";
import { makeRangeFromPositions } from "./makeRangeFromPositions";
import { q } from "./operatorArgumentSchemaTypes";
import type { MutableQueryCapture } from "./QueryCapture";
import { QueryPredicateOperator } from "./QueryPredicateOperator";

/**
 * A predicate operator that returns true if the node is at an even index within
 * its parents field. For example, `(#even? @foo value)` will accept the match
 * if the `@foo` capture is at an even index among its parents value children.
 */
class Even extends QueryPredicateOperator<Even> {
  name = "even?" as const;
  schema = z.tuple([q.node, q.string]);
  run({ node }: MutableQueryCapture, fieldName: string) {
    return isEven(node, fieldName);
  }
}

/**
 * A predicate operator that returns true if the node is at an odd index within
 * its parents field. For example, `(#odd? @foo value)` will accept the match
 * if the `@foo` capture is at an odd index among its parents value children.
 */
class Odd extends QueryPredicateOperator<Odd> {
  name = "odd?" as const;
  schema = z.tuple([q.node, q.string]);
  run({ node }: MutableQueryCapture, fieldName: string) {
    return !isEven(node, fieldName);
  }
}

/**
 * A predicate operator that returns true if the node matches the given text.
 * For example, `(#text? @foo bar)` will accept the match if the `@foo`
 * captures text is `bar`. It is acceptable to pass in multiple texts, e.g.
 * `(#text? @foo bar baz)`.
 */
class Text extends QueryPredicateOperator<Text> {
  name = "text?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  run({ document, range }: MutableQueryCapture, ...texts: string[]) {
    return texts.includes(document.getText(range));
  }
}

/**
 * A predicate operator that returns true if the node is of the given type.
 * For example, `(#type? @foo string)` will accept the match if the `@foo`
 * capture is a `string` node. It is acceptable to pass in multiple types, e.g.
 * `(#type? @foo string comment)`.
 */
class Type extends QueryPredicateOperator<Type> {
  name = "type?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  run({ node }: MutableQueryCapture, ...types: string[]) {
    return types.includes(node.type);
  }
}

/**
 * A predicate operator that returns true if the node is NOT of the given type.
 * For example, `(#not-type? @foo string)` will reject the match if the `@foo`
 * capture is a `string` node. It is acceptable to pass in multiple types, e.g.
 * `(#not-type? @foo string comment)`.
 */
class NotType extends QueryPredicateOperator<NotType> {
  name = "not-type?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  run({ node }: MutableQueryCapture, ...types: string[]) {
    return !types.includes(node.type);
  }
}

/**
 * A predicate operator that returns true if the node's parent is not of the
 * given type. For example, `(#not-parent-type? @foo string)` will reject the
 * match if the `@foo` capture is a child of a `string` node. It is acceptable
 * to pass in multiple types, e.g. `(#not-parent-type? @foo string comment)`.
 */
class NotParentType extends QueryPredicateOperator<NotParentType> {
  name = "not-parent-type?" as const;
  schema = z.tuple([q.node, q.string]).rest(q.string);
  run({ node }: MutableQueryCapture, ...types: string[]) {
    return node.parent == null || !types.includes(node.parent.type);
  }
}

/**
 * A predicate operator that returns true if the node is the nth child of its
 * parent.  For example, `(#is-nth-child? @foo 0)` will reject the match if the
 * `@foo` capture is not the first child of its parent.
 */
class IsNthChild extends QueryPredicateOperator<IsNthChild> {
  name = "is-nth-child?" as const;
  schema = z.tuple([q.node, q.integer]);
  run({ node }: MutableQueryCapture, n: number) {
    return node.parent?.children.findIndex((n) => n.id === node.id) === n;
  }
}

/**
 * A predicate operator that returns true if the node has more than 1 child of
 * type {@link type} (inclusive).  For example, `(#has-multiple-children-of-type?
 * @foo bar)` will accept the match if the `@foo` capture has 2 or more children
 * of type `bar`.
 */
class HasMultipleChildrenOfType extends QueryPredicateOperator<HasMultipleChildrenOfType> {
  name = "has-multiple-children-of-type?" as const;
  schema = z.tuple([q.node, q.string]);

  run({ node }: MutableQueryCapture, type: string) {
    const count = node.children.filter((n) => n.type === type).length;
    return count > 1;
  }
}

class ChildRange extends QueryPredicateOperator<ChildRange> {
  name = "child-range!" as const;
  schema = z.union([
    z.tuple([q.node, q.integer]),
    z.tuple([q.node, q.integer, q.integer]),
    z.tuple([q.node, q.integer, q.integer, q.boolean]),
    z.tuple([q.node, q.integer, q.integer, q.boolean, q.boolean]),
  ]);

  run(
    nodeInfo: MutableQueryCapture,
    startIndex: number,
    endIndex?: number,
    excludeStart?: boolean,
    excludeEnd?: boolean,
  ) {
    const {
      node: { children },
    } = nodeInfo;

    startIndex = startIndex < 0 ? children.length + startIndex : startIndex;
    endIndex = endIndex == null ? -1 : endIndex;
    endIndex = endIndex < 0 ? children.length + endIndex : endIndex;

    const start = children[startIndex];
    const end = children[endIndex];

    nodeInfo.range = makeRangeFromPositions(
      excludeStart ? start.endPosition : start.startPosition,
      excludeEnd ? end.startPosition : end.endPosition,
    );

    return true;
  }
}

class CharacterRange extends QueryPredicateOperator<CharacterRange> {
  name = "character-range!" as const;
  schema = z.union([
    z.tuple([q.node, q.integer]),
    z.tuple([q.node, q.integer, q.integer]),
  ]);

  run(nodeInfo: MutableQueryCapture, startOffset: number, endOffset?: number) {
    nodeInfo.range = new Range(
      nodeInfo.range.start.translate(undefined, startOffset),
      nodeInfo.range.end.translate(undefined, endOffset ?? 0),
    );

    return true;
  }
}

/**
 * A predicate operator that modifies the range of the match to shrink to regex
 * match.  For example, `(#shrink-to-match! @foo "\\S+")` will modify the range
 * of the `@foo` capture to exclude whitespace.
 *
 * If convenient, you can use a special capture group called `keep` to indicate
 * the part of the match that should be kept.  For example,
 *
 * ```
 * (#shrink-to-match! @foo "^\s+(?<keep>.*)$")
 * ```
 *
 * will modify the range of the `@foo` capture to skip any leading whitespace.
 */
class ShrinkToMatch extends QueryPredicateOperator<ShrinkToMatch> {
  name = "shrink-to-match!" as const;
  schema = z.tuple([q.node, q.string]);

  run(nodeInfo: MutableQueryCapture, pattern: string) {
    const { document, range } = nodeInfo;
    const text = document.getText(range);
    const match = text.match(new RegExp(pattern, "ds"));

    if (match?.index == null) {
      throw Error(`No match for pattern '${pattern}'`);
    }

    const [startOffset, endOffset] =
      match.indices?.groups?.keep ?? match.indices![0];

    const baseOffset = document.offsetAt(range.start);

    nodeInfo.range = new Range(
      document.positionAt(baseOffset + startOffset),
      document.positionAt(baseOffset + endOffset),
    );

    return true;
  }
}

/**
 * A predicate operator that modifies the range of the match to grow to named trailing siblings.
 *
 * An optional `notText` argument can be provided to break at siblings that match the given text.
 *
 * ```
 * (#grow-to-named-siblings! @foo "at")
 * ```
 */
class GrowToNamedSiblings extends QueryPredicateOperator<GrowToNamedSiblings> {
  name = "grow-to-named-siblings!" as const;
  schema = z.union([z.tuple([q.node]), z.tuple([q.node, q.string])]);

  run(nodeInfo: MutableQueryCapture, notText?: string) {
    const { node, range } = nodeInfo;

    if (node.parent == null) {
      throw Error("Node has no parent");
    }

    const { children } = node.parent;
    const nodeIndex = children.findIndex((n) => n.id === node.id);
    let endPosition: Point | undefined;

    if (nodeIndex === -1) {
      throw Error("Node not found in parent");
    }

    for (let i = nodeIndex + 1; i < children.length; ++i) {
      const child = children[i];
      if (!child.isNamed) {
        break;
      }

      if (notText != null && notText === child.text) {
        break;
      }

      endPosition = child.endPosition;
    }

    if (endPosition != null) {
      nodeInfo.range = new Range(
        range.start,
        new Position(endPosition.row, endPosition.column),
      );
    }

    return true;
  }
}
/**
 * A predicate operator that modifies the range of the match to grow to leading siblings of the same type.
 *
 * The `leadingSeparator` argument specificies the separator each node except the first sibling will be separated by.
 *
 * ```
 * (#call-chain! @foo ".")
 * ```
 */
class CallChain extends QueryPredicateOperator<CallChain> {
  name = "call-chain!" as const;
  schema = z.union([z.tuple([q.node]), z.tuple([q.node, q.string])]);

  run(nodeInfo: MutableQueryCapture, leadingSeparator: string) {
    const { node, range } = nodeInfo;

    if (node.parent == null) {
      throw Error("Node has no parent");
    }

    const { children } = node.parent;
    const nodeIndex = children.findIndex((n) => n.id === node.id);

    if (nodeIndex === -1) {
      throw Error("Node not found in parent");
    }

    let start = children[nodeIndex];
    let end = start;

    for (let i = nodeIndex; i > -1; --i) {
      const child = children[i];

      if (child.type !== node.type) {
        break;
      }

      start = child;

      if (!child.text.startsWith(leadingSeparator)) {
        break;
      }
    }

    if (start.id !== end.id) {
      nodeInfo.range = makeRangeFromPositions(
        start.startPosition,
        end.endPosition,
      );
    }

    return true;
  }
}

/**
 * A predicate operator that modifies the range of the match by trimming trailing whitespace,
 * similar to the javascript trimEnd function.
 */
class TrimEnd extends QueryPredicateOperator<TrimEnd> {
  name = "trim-end!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    const { document, range } = nodeInfo;
    const text = document.getText(range);
    const whitespaceLength = text.length - text.trimEnd().length;
    if (whitespaceLength > 0) {
      nodeInfo.range = new Range(
        range.start,
        adjustPosition(document, range.end, -whitespaceLength),
      );
    }
    return true;
  }
}

/**
 * A predicate operator that sets the range to the full document.
 */
class DocumentRange extends QueryPredicateOperator<DocumentRange> {
  name = "document-range!" as const;
  schema = z.tuple([q.node]).rest(q.node);

  run(...nodeInfos: MutableQueryCapture[]) {
    for (const nodeInfo of nodeInfos) {
      nodeInfo.range = nodeInfo.document.range;
    }

    return true;
  }
}

/**
 * Indicates that it is ok for multiple captures to have the same domain but
 * different targets.  For example, if we have the query `(#allow-multiple!
 * @foo)`, then if we define the query so that `@foo` appears multiple times
 * with the same domain but different targets, then the given domain will end up
 * with multiple targets. The canonical example is `tags` in HTML / jsx.
 *
 * This operator is allowed to be applied to a capture that doesn't actually
 * appear; ie we can make it so that we allow multiple if the capture appears in
 * the pattern.
 */
class AllowMultiple extends QueryPredicateOperator<AllowMultiple> {
  name = "allow-multiple!" as const;
  schema = z.tuple([q.node]).rest(q.node);

  protected allowMissingNode(): boolean {
    return true;
  }

  run(...nodeInfos: MutableQueryCapture[]) {
    for (const nodeInfo of nodeInfos) {
      nodeInfo.allowMultiple = true;
    }

    return true;
  }
}

/**
 * A predicate operator that logs a node, for debugging.
 */
class Log extends QueryPredicateOperator<Log> {
  name = "log!" as const;
  schema = z.tuple([q.node]);

  run(nodeInfo: MutableQueryCapture) {
    console.log(`#log!: ${nodeInfo.name}@${nodeInfo.range}`);
    return true;
  }
}

/**
 * A predicate operator that sets the insertion delimiter of the match. For
 * example, `(#insertion-delimiter! @foo ", ")` will set the insertion delimiter
 * of the `@foo` capture to `", "`.
 */
class InsertionDelimiter extends QueryPredicateOperator<InsertionDelimiter> {
  name = "insertion-delimiter!" as const;
  schema = z.tuple([q.node, q.string]);

  run(nodeInfo: MutableQueryCapture, insertionDelimiter: string) {
    nodeInfo.insertionDelimiter = insertionDelimiter;

    return true;
  }
}

/**
 * A predicate operator that sets the insertion delimiter of {@link nodeInfo} to
 * either {@link insertionDelimiterConsequence} or
 * {@link insertionDelimiterAlternative} depending on whether
 * {@link conditionNodeInfo} is single or multiline, respectively. For example,
 *
 * ```scm
 * (#single-or-multi-line-delimiter! @foo @bar ", " ",\n")
 * ```
 *
 * will set the insertion delimiter of the `@foo` capture to `", "` if the
 * `@bar` capture is a single line and `",\n"` otherwise.
 */
class SingleOrMultilineDelimiter extends QueryPredicateOperator<SingleOrMultilineDelimiter> {
  name = "single-or-multi-line-delimiter!" as const;
  schema = z.tuple([q.node, q.node, q.string, q.string]);

  run(
    nodeInfo: MutableQueryCapture,
    conditionNodeInfo: MutableQueryCapture,
    insertionDelimiterConsequence: string,
    insertionDelimiterAlternative: string,
  ) {
    nodeInfo.insertionDelimiter = conditionNodeInfo.range.isSingleLine
      ? insertionDelimiterConsequence
      : insertionDelimiterAlternative;

    return true;
  }
}

/**
 * A predicate operator that sets the insertion delimiter of {@link nodeInfo}
 * depending on the content of {@link conditionNodeInfo}. It sets the insertion
 * delimiter to {@link insertionDelimiterEmpty} if {@link conditionNodeInfo} is empty,
 * {@link insertionDelimiterSingleLine} if it is a single line, and
 * {@link insertionDelimiterMultiline} if it is multiline. For example,
 *
 * ```scm
 * (#empty-single-multi-delimiter! @argumentList @_dummy "" ", " ",\n")
 * ```
 */
class EmptySingleMultiDelimiter extends QueryPredicateOperator<EmptySingleMultiDelimiter> {
  name = "empty-single-multi-delimiter!" as const;
  schema = z.tuple([q.node, q.node, q.string, q.string, q.string]);

  run(
    nodeInfo: MutableQueryCapture,
    conditionNodeInfo: MutableQueryCapture,
    insertionDelimiterEmpty: string,
    insertionDelimiterSingleLine: string,
    insertionDelimiterMultiline: string,
  ) {
    const isEmpty = !conditionNodeInfo.node.children.some(
      (child) => child.isNamed,
    );

    nodeInfo.insertionDelimiter = isEmpty
      ? insertionDelimiterEmpty
      : conditionNodeInfo.range.isSingleLine
        ? insertionDelimiterSingleLine
        : insertionDelimiterMultiline;

    return true;
  }
}

export const queryPredicateOperators = [
  new Log(),
  new Even(),
  new Odd(),
  new Text(),
  new Type(),
  new NotType(),
  new TrimEnd(),
  new DocumentRange(),
  new NotParentType(),
  new IsNthChild(),
  new ChildRange(),
  new CharacterRange(),
  new ShrinkToMatch(),
  new GrowToNamedSiblings(),
  new CallChain(),
  new AllowMultiple(),
  new InsertionDelimiter(),
  new SingleOrMultilineDelimiter(),
  new EmptySingleMultiDelimiter(),
  new HasMultipleChildrenOfType(),
];
