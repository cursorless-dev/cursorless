import type { Range, SimpleScopeTypeType } from "@cursorless/common";
import type { QueryMatch } from "../../../../languages/TreeSitterQuery/QueryCapture";
import { findCaptureByName } from "../TreeSitterScopeHandler/captureUtils";

export function getCaptureRanges(
  queryMatches: QueryMatch[],
  captureName: SimpleScopeTypeType,
): Range[] {
  return queryMatches
    .map((match) => findCaptureByName(match, captureName)?.range)
    .filter((capture): capture is Range => capture != null);
}
