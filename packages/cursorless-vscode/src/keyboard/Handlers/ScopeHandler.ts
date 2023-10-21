import {
  ContainingScopeModifier,
  RelativeScopeModifier,
  ScopeType,
  SimpleScopeType,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { Handler } from "../Handler";

const SimpleScopeTypeArray = [
  "argumentOrParameter",
  "anonymousFunction",
  "attribute",
  "branch",
  "class",
  "className",
  "collectionItem",
  "collectionKey",
  "comment",
  "functionCall",
  "functionCallee",
  "functionName",
  "ifStatement",
  "instance",
  "list",
  "map",
  "name",
  "namedFunction",
  "regularExpression",
  "statement",
  "string",
  "type",
  "value",
  "condition",
  "section",
  "sectionLevelOne",
  "sectionLevelTwo",
  "sectionLevelThree",
  "sectionLevelFour",
  "sectionLevelFive",
  "sectionLevelSix",
  "selector",
  "switchStatementSubject",
  "unit",
  "xmlBothTags",
  "xmlElement",
  "xmlEndTag",
  "xmlStartTag",
  "notebookCell",
  // Latex scope types
  "part",
  "chapter",
  "subSection",
  "subSubSection",
  "namedParagraph",
  "subParagraph",
  "environment",
  // Text based scopes
  "character",
  "word",
  "token",
  "identifier",
  "line",
  "sentence",
  "paragraph",
  "document",
  "nonWhitespaceSequence",
  "boundedNonWhitespaceSequence",
  "url",
  // Talon
  "command",
] as const;

export async function targetScope(
  mode: Handler,
  keySequence: string
): Promise<void> {
  if (!SimpleScopeTypeArray.includes(keySequence)) {
    throw Error(`Unsupported scope: ${keySequence}`);
  }
  const scopeType: SimpleScopeTypeType = keySequence as SimpleScopeTypeType;

  const modifiedTargets = [];
  for ( let curTarget of mode.getTargets()) {

  if (curTarget === undefined) {
    return;
  }
  const scope: ContainingScopeModifier = {
    type: "containingScope",
    scopeType: {
      type: scopeType,
    },
  };
  curTarget = {
      type: curTarget.type,
      modifiers: [scope],
      mark: curTarget.mark,
    };
    modifiedTargets.push(curTarget);
  }
  mode.replaceAllTargets(modifiedTargets);
}
