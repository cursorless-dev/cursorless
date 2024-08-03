import type { Range } from "@cursorless/common";
import type { MinimumTargetParameters } from "./BaseTarget";
import { BaseTarget } from "./BaseTarget";
import { LineTarget } from "./LineTarget";
import { expandToFullLine } from "../../util/rangeUtils";
import type { InteriorTarget, ParagraphTarget } from ".";

interface BoundedParagraphTargetParameters extends MinimumTargetParameters {
  readonly paragraphTarget: ParagraphTarget;
  readonly containingInterior: InteriorTarget;
}

export class BoundedParagraphTarget extends BaseTarget<BoundedParagraphTargetParameters> {
  readonly type = "BoundedParagraphTarget";
  readonly insertionDelimiter = "\n\n";
  readonly isLine = true;
  private containingInterior: InteriorTarget;
  private paragraphTarget: ParagraphTarget;
  private startLineGap: number;
  private endLineGap: number;

  constructor(parameters: BoundedParagraphTargetParameters) {
    super({
      ...parameters,
      contentRange: getIntersectionStrict(
        parameters.paragraphTarget.contentRange,
        parameters.containingInterior.contentRange,
      ),
    });

    this.containingInterior = parameters.containingInterior;
    this.paragraphTarget = parameters.paragraphTarget;
    this.startLineGap =
      this.contentRange.start.line -
      this.containingInterior.fullInteriorRange.start.line;
    this.endLineGap =
      this.containingInterior.fullInteriorRange.end.line -
      this.contentRange.end.line;
  }

  getLeadingDelimiterTarget() {
    return this.startLineGap > 1
      ? this.paragraphTarget.getLeadingDelimiterTarget()
      : undefined;
  }

  getTrailingDelimiterTarget() {
    return this.endLineGap > 1
      ? this.paragraphTarget.getTrailingDelimiterTarget()
      : undefined;
  }

  getRemovalRange(): Range {
    // FIXME: In the future we could get rid of this function if {@link
    // getDelimitedSequenceRemovalRange} made a continuous range from the target
    // past its delimiter target and then used the removal range of that.
    const delimiterTarget =
      this.getTrailingDelimiterTarget() ?? this.getLeadingDelimiterTarget();

    const removalContentRange =
      delimiterTarget != null
        ? this.contentRange.union(delimiterTarget.contentRange)
        : this.contentRange;

    if (this.startLineGap <= 0 || this.endLineGap <= 0) {
      return removalContentRange;
    }

    // If there is a delimiter, it will be a line target, so we join it with
    // ourself to create a line target containing ourself and the delimiter
    // line. We then allow the line target removal range code to cleanup any
    // extra leading or trailing newline
    //
    // If there is no delimiter, we just use the line content range,
    // converting it to a line target so that it cleans up leading or trailing
    // newline as necessary
    return new LineTarget({
      contentRange: removalContentRange,
      editor: this.editor,
      isReversed: this.isReversed,
    }).getRemovalRange();
  }

  private get fullLineContentRange() {
    return expandToFullLine(this.editor, this.contentRange);
  }

  getRemovalHighlightRange() {
    if (this.startLineGap < 1 || this.endLineGap < 1) {
      return this.getRemovalRange();
    }

    const delimiterTarget =
      this.getTrailingDelimiterTarget() ?? this.getLeadingDelimiterTarget();

    return delimiterTarget != null
      ? this.fullLineContentRange.union(delimiterTarget.contentRange)
      : this.fullLineContentRange;
  }

  maybeCreateRichRangeTarget(
    isReversed: boolean,
    endTarget: BoundedParagraphTarget,
  ): BoundedParagraphTarget {
    return new BoundedParagraphTarget({
      ...this.getCloneParameters(),
      isReversed,
      containingInterior: this.containingInterior.maybeCreateRichRangeTarget(
        isReversed,
        endTarget.containingInterior,
      ),
      paragraphTarget: this.paragraphTarget.maybeCreateRichRangeTarget(
        isReversed,
        endTarget.paragraphTarget,
      ),
    });
  }

  protected getCloneParameters() {
    return {
      ...this.state,
      paragraphTarget: this.paragraphTarget,
      containingInterior: this.containingInterior,
    };
  }
}

function getIntersectionStrict(range1: Range, range2: Range): Range {
  const intersection = range1.intersection(range2);

  if (intersection == null || intersection.isEmpty) {
    throw new Error("Ranges do not intersect");
  }

  return intersection;
}
