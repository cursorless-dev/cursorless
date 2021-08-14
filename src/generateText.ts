import { pairDelimiterToText } from "./pairDelimiters";
import { TextGenerator } from "./typings/Types";

export default function (generator: TextGenerator, numTargets: number) {
  const result = [];

  switch (generator.type) {
    case "range":
      for (let i = 0; i < numTargets; ++i) {
        result[i] = (generator.start + i).toString();
      }
      return result;

    case "pair":
      if (numTargets % 2 !== 0) {
        throw new Error("Number of targets is not divisible by two");
      }
      const pairTexts = pairDelimiterToText[generator.pair];
      for (let i = 0; i < numTargets; ++i) {
        result[i] = pairTexts[i % 2];
      }
      return result;
  }
}
