import type {
  Range,
  ReferenceModifier,
  ReferencePathMode,
  ReferenceSnippetDescriptor,
} from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";
import type { Target, TextualType } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type {
  ModifierStage,
  ModifierStateOptions,
} from "../PipelineStages.types";
import { TextOnlyTarget } from "../targets/TextOnlyTarget";
import { containingLineIfUntypedModifier } from "./commonContainingScopeIfUntypedModifiers";

const textualTypeMapping: Record<TextualType, ReferenceFormattingMode> = {
  character: "lineAndColumn",
  word: "lineAndColumn",
  token: "lineAndColumn",
  line: "line",
  document: "file",
};

const defaultReferenceSnippets: ReferenceSnippetDescriptor[] = [
  {
    body: "$relative",
  },
];

export class ReferenceStage implements ModifierStage {
  private containingLineIfUntypedStage: ModifierStage;
  private nameStage: ModifierStage;

  constructor(
    modifierHandlerFactory: ModifierStageFactory,
    private modifier: ReferenceModifier,
  ) {
    this.containingLineIfUntypedStage = modifierHandlerFactory.create(
      containingLineIfUntypedModifier,
    );
    this.nameStage = modifierHandlerFactory.create({
      type: "containingScope",
      scopeType: { type: "name" },
    });
  }

  run(target: Target, _options: ModifierStateOptions): Target[] {
    // First, expand to containing line if untyped
    target = this.containingLineIfUntypedStage.run(target, _options)[0];

    // Then, get the appropriate snippet
    const snippets = this.modifier.snippets ?? defaultReferenceSnippets;
    const isSingleLineMode =
      target.contentRange.isSingleLine &&
      textualTypeMapping[target.textualType] === "lineAndColumn";
    const snippetDescriptor =
      snippets.find((descriptor) =>
        matchesLineMode(descriptor.lineMode, isSingleLineMode),
      ) ?? snippets[0];

    const document = target.editor.document;

    let name: string | null = null;
    if (target.textualType === "document") {
      name = document.filename;
    } else {
      try {
        name = this.nameStage.run(target, _options)[0].contentText;
      } catch (e) {}
    }

    const fragment = getFragment(
      target.contentRange,
      textualTypeMapping[target.textualType],
    );

    const getReferencePath = (referencePathMode: ReferencePathMode) => {
      const path = ide().getReferencePath?.(document, referencePathMode);
      if (path == null) {
        return null;
      }
      return `${path}${fragment}`;
    };

    const remoteWithBranch = getReferencePath("gitRemoteWithBranch");
    const remoteCanonical = getReferencePath("gitRemoteCanonical");
    // Use canonical for specific ranges, non-canonical for whole document
    const remote =
      target.textualType === "document" ? remoteWithBranch : remoteCanonical;

    const variables: Record<string, string | null> = {
      content: target.contentText,
      languageId: document.languageId,
      absolute: getReferencePath("absolute"),
      relative: getReferencePath("relative"),
      remote,
      remoteWithBranch,
      remoteCanonical,
      name,
    };

    const text = subsituteSnippet(snippetDescriptor.body, variables);

    return [
      new TextOnlyTarget({
        editor: target.editor,
        isReversed: target.isReversed,
        contentRange: target.contentRange,
        text,
        thatTarget: target,
      }),
    ];
  }
}

function matchesLineMode(
  lineMode: ReferenceSnippetDescriptor["lineMode"],
  isSingleLineMode: boolean,
): boolean {
  if (lineMode == null) {
    return true;
  }
  return lineMode === "singleLine" ? isSingleLineMode : !isSingleLineMode;
}

function subsituteSnippet(
  body: string,
  variables: Record<string, string | null>,
) {
  return body
    .replaceAll(/\$(\w+)/g, (_, varName) => {
      const value = variables[varName];
      if (value === undefined) {
        throw new Error(`Unknown snippet variable: ${varName}`);
      }
      if (value === null) {
        throw new Error(`Snippet variable not available: ${varName}`);
      }
      return value;
    })
    .replaceAll(/\$\$/g, "$");
}

type ReferenceFormattingMode = "file" | "line" | "lineAndColumn";

function getFragment(range: Range, mode: ReferenceFormattingMode): string {
  switch (mode) {
    case "file":
      return "";
    case "line":
      return range.isSingleLine
        ? `#L${range.start.line + 1}`
        : `#L${range.start.line + 1}-L${range.end.line + 1}`;
    case "lineAndColumn":
      return range.isEmpty
        ? `#L${range.start.line + 1}C${range.start.character + 1}`
        : `#L${range.start.line + 1}C${range.start.character + 1}-L${range.end.line + 1}C${range.end.character + 1}`;
  }
}
