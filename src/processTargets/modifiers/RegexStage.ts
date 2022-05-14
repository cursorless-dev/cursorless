import { Position, Range } from "vscode";
import { ContainingScopeModifier } from "../../typings/target.types";
import { ProcessedTargetsContext, TypedSelection } from "../../typings/Types";
import { ModifierStage } from "../PipelineStages.types";
import { getTokenContext } from "./TokenStage";

class RegexStage implements ModifierStage {
  constructor(private regex: RegExp, private name?: string) {}

  run(
    context: ProcessedTargetsContext,
    stage: ContainingScopeModifier,
    selection: TypedSelection
  ): TypedSelection {
    const getMatch = (position: Position) => {
      const line = selection.editor.document.lineAt(position);
      const result = [...line.text.matchAll(this.regex)]
        .map(
          (match) =>
            new Range(
              position.line,
              match.index!,
              position.line,
              match.index! + match[0].length
            )
        )
        .find((range) => range.contains(position));
      if (result == null) {
        if (this.name) {
          throw new Error(`Couldn't find containing ${this.name}`);
        } else {
          throw new Error(
            `Cannot find sequence defined by regex: ${this.regex}`
          );
        }
      }
      return result;
    };

    const start = getMatch(selection.contentRange.start).start;
    const end = getMatch(selection.contentRange.end).end;
    const contentRange = new Range(start, end);

    return {
      ...selection,
      contentRange,
      ...getTokenContext(selection.editor, contentRange),
    };
  }
}

export class NonWhitespaceSequenceStage extends RegexStage {
  constructor() {
    super(/\S+/g, "Non whitespace sequence");
  }
}

// taken from https://regexr.com/3e6m0
const URL_REGEX =
  /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;

export class UrlStage extends RegexStage {
  constructor() {
    super(URL_REGEX, "URL");
  }
}
