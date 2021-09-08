import { range } from "lodash";
import { pairDelimiterToText } from "./pairDelimiters";
import { TextGenerator } from "./typings/Types";

export default function (generator: TextGenerator, numTargets: number) {
  switch (generator.type) {
    case "range":
      const { start } = generator;

      return range(start, start + numTargets).map((num) => num.toString());

    case "pair":
      if (numTargets % 2 !== 0) {
        throw new Error("Number of targets is not divisible by two");
      }

      const pairTexts = pairDelimiterToText[generator.pair];

      return range(numTargets / 2).flatMap(() => pairTexts);
  }
}
