import {
    ContainingSurroundingPairModifier,
  SurroundingPairName,
} from "@cursorless/common";
import { Handler } from "../Handler";

export async function targetPairedDelimiter(
  mode: Handler,
  keySequence: string
): Promise<void> {
  const scopeType: SurroundingPairName = keySequence as SurroundingPairName;

  const scope: ContainingSurroundingPairModifier = {
    type: "containingScope",
    scopeType: {
      type: "surroundingPair",
    delimiter: scopeType,
    requireStrongContainment: false,
  },
};
  mode.addModifier(scope);
}
