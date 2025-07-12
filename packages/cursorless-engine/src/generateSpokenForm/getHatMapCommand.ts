import type {
  CommandLatest,
  PartialPrimitiveTargetDescriptor,
} from "@cursorless/common";
import { splitKey } from "@cursorless/common";

/**
 * Constructs the command that would have been used as the second command when
 * recording a hat token map test. Eg if the fixture has `marksToCheck:
 * ["blue.a"]`, we'd return the command corresponding to `"take blue air"`.
 * @param marks The marks that the fixture was checking
 * @returns A command that would select the marks
 */
export function getHatMapCommand(marks: string[]): CommandLatest {
  const primitiveTargets = marks.map<PartialPrimitiveTargetDescriptor>(
    (mark) => {
      const { hatStyle, character } = splitKey(mark);

      return {
        type: "primitive",
        mark: { type: "decoratedSymbol", character, symbolColor: hatStyle },
      };
    },
  );

  return {
    action: {
      name: "setSelection",
      target:
        primitiveTargets.length === 1
          ? primitiveTargets[0]
          : {
              type: "list",
              elements: primitiveTargets,
            },
    },
    version: 8,
    usePrePhraseSnapshot: false,
  };
}
