import {
    ContainingScopeModifier,
    SimpleScopeTypeType,
} from "@cursorless/common";
import { Handler } from "../Handler";

export const SimpleScopeTypeArray = [
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
    if (!SimpleScopeTypeArray.includes(keySequence as any)) {
        throw Error(`Unsupported scope: ${keySequence}`);
    }
    const scopeType: SimpleScopeTypeType = keySequence as SimpleScopeTypeType;
    const scope: ContainingScopeModifier = {
        type: "containingScope",
        scopeType: {
            type: scopeType,
        },
    };
    mode.addModifier(scope);
}
