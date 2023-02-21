/**
 * This script can be used to add hat tweaks to the currently shipping ones
 */
import { sum } from "lodash";
import {
  defaultShapeAdjustments,
  HatAdjustments,
  IndividualHatAdjustmentMap,
} from "../../ide/vscode/hats/shapeAdjustments";
import { HAT_SHAPES } from "../../ide/vscode/hatStyles.types";
import { postProcessValue } from "./lib";

/**
 * Fill this object with any tweaks you've made to your settings.json
 */
const newAdjustments: Partial<IndividualHatAdjustmentMap> = {};

const adjustments: Partial<IndividualHatAdjustmentMap>[] = [
  newAdjustments,
  defaultShapeAdjustments,
];

function processProperty(
  hatAdjustmentsList: HatAdjustments[],
  propertyName: keyof HatAdjustments,
) {
  const value = sum(
    hatAdjustmentsList.map((adjustment) => adjustment[propertyName] ?? 0),
  );

  return postProcessValue(value);
}

function main() {
  const finalMap = Object.fromEntries(
    HAT_SHAPES.map((shape) => {
      const adjustmentsList = adjustments.map(
        (adjustment) => adjustment[shape] ?? {},
      );

      return [
        shape,
        {
          sizeAdjustment: processProperty(adjustmentsList, "sizeAdjustment"),
          verticalOffset: processProperty(adjustmentsList, "verticalOffset"),
        },
      ];
    }),
  ) as IndividualHatAdjustmentMap;

  console.log(JSON.stringify(finalMap, null, 2));
}

main();
