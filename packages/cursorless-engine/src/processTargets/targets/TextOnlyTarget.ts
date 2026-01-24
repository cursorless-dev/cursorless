import type {
  EnforceUndefined,
  GeneralizedRange,
  InsertionMode,
  Range,
} from "@cursorless/common";
import type { EditWithRangeUpdater } from "../../typings/Types";
import type { Destination, Target } from "../../typings/target.types";
import type { CommonTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";

interface TextOnlyTargetParameters extends CommonTargetParameters {
  text: string;
}

export class TextOnlyTarget extends BaseTarget<TextOnlyTargetParameters> {
  type = "TextOnlyTarget";
  insertionDelimiter: string;
  isTextOnly = true;

  private readonly text: string;

  constructor(parameters: TextOnlyTargetParameters) {
    super(parameters);
    this.text = parameters.text;
    this.insertionDelimiter = parameters.text.includes("\n") ? "\n\n" : ", ";
  }

  override get contentText(): string {
    return this.text;
  }

  getLeadingDelimiterTarget(): Target | undefined {
    return undefined;
  }

  getTrailingDelimiterTarget(): Target | undefined {
    return undefined;
  }

  override getRemovalRange(): Range {
    throw new Error(
      "Text-only targets are read-only and cannot be used with destructive actions",
    );
  }

  override constructRemovalEdit(): EditWithRangeUpdater {
    throw new Error(
      "Text-only targets are read-only and cannot be used with destructive actions",
    );
  }

  override getRemovalHighlightRange(): GeneralizedRange {
    throw new Error(
      "Text-only targets are read-only and cannot be used with destructive actions",
    );
  }

  override toDestination(insertionMode: InsertionMode): Destination {
    // FIXME: Semantically, this is a bit wrong, since text-only targets don't
    // really refer to the original target anymore. However, there are two
    // reasons we do this:
    //
    // 1. It makes "bring reference air to bat" work despite inference, which
    //    seems harmless
    // 2. It works around an oddness in our "bring" implementation where we
    //    convert sources to destinations for purposes of consistency when doing
    //    highlights and source marks. That could probably be reworked, but
    //    leaving that out of scope for now.
    return this.thatTarget.toDestination(insertionMode);
  }

  protected getCloneParameters(): EnforceUndefined<TextOnlyTargetParameters> {
    return {
      ...this.state,
      text: this.text,
    };
  }
}
