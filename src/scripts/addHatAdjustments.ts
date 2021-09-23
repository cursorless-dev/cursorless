/**
 * This script can be used to add hat tweaks to the currently shipping ones
 */
import { sum } from "lodash";
import { HAT_SHAPES } from "../core/constants";
import {
  defaultShapeMeasurements,
  HatAdjustments,
  IndividualHatAdjustmentMap,
} from "../core/shapeMeasurements";

/**
 * Fill this object with any tweaks you've made to your settings.json
 */
const newAdjustments: Partial<IndividualHatAdjustmentMap> = {};

const adjustments: Partial<IndividualHatAdjustmentMap>[] = [
  newAdjustments,
  defaultShapeMeasurements,
];

function processProperty(
  hatAdjustmentsList: HatAdjustments[],
  propertyName: keyof HatAdjustments
) {
  let value = sum(
    hatAdjustmentsList.map((adjustment) => adjustment[propertyName] ?? 0)
  );
  value = Math.round(value * 10000) / 10000;
  return value === 0 ? undefined : value;
}

function main() {
  const finalMap = Object.fromEntries(
    HAT_SHAPES.map((shape) => {
      const adjustmentsList = adjustments.map(
        (adjustment) => adjustment[shape] ?? {}
      );

      return [
        shape,
        {
          sizeAdjustment: processProperty(adjustmentsList, "sizeAdjustment"),
          verticalOffset: processProperty(adjustmentsList, "verticalOffset"),
        },
      ];
    })
  ) as IndividualHatAdjustmentMap;

  console.log(JSON.stringify(finalMap, null, 2));
}

main();
