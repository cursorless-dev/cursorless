/**
 * This script can be used to add hat tweaks to the currently shipping ones
 */
import { sum } from "lodash";
import { HAT_SHAPES } from "../../core/constants";
import {
  defaultShapeMeasurements,
  HatAdjustments,
  IndividualHatAdjustmentMap,
} from "../../core/shapeMeasurements";
import { postProcessValue } from "./lib";

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
  let value = average(
    hatAdjustmentsList.map((adjustment) => adjustment[propertyName] ?? 0)
  );

  return {
    value: postProcessValue(value),
    adjustments: hatAdjustmentsList.map((adjustment) =>
      postProcessValue((adjustment[propertyName] ?? 0) - value)
    ),
  };
}

function main() {
  const fullMap = Object.fromEntries(
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
  );

  const finalMap = Object.fromEntries(
    HAT_SHAPES.map((shape) => {
      return [
        shape,
        {
          sizeAdjustment: fullMap[shape].sizeAdjustment.value,
          verticalOffset: fullMap[shape].verticalOffset.value,
        },
      ];
    })
  ) as IndividualHatAdjustmentMap;
  console.log("average: ");
  console.log(JSON.stringify(finalMap, null, 2));

  adjustments.forEach((_, index) => {
    const map = Object.fromEntries(
      HAT_SHAPES.map((shape) => {
        return [
          shape,
          {
            sizeAdjustment: fullMap[shape].sizeAdjustment.adjustments[index],
            verticalOffset: fullMap[shape].verticalOffset.adjustments[index],
          },
        ];
      })
    ) as IndividualHatAdjustmentMap;
    console.log(`${index}: `);
    console.log(JSON.stringify(map, null, 2));
  });
}

main();

function average(numbers: number[]) {
  return sum(numbers) / numbers.length;
}
