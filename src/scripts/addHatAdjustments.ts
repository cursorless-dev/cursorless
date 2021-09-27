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
const newAdjustments: Partial<IndividualHatAdjustmentMap> = {
  default: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  ex: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  fox: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  wing: {
    sizeAdjustment: -5,
    verticalOffset: -2,
  },
  hole: {
    sizeAdjustment: -25,
    verticalOffset: 0,
  },
  frame: {
    sizeAdjustment: 10,
    verticalOffset: 4.5,
  },
  curve: {
    sizeAdjustment: 12,
    verticalOffset: 1.9,
  },
  eye: {
    sizeAdjustment: -5,
    verticalOffset: 0,
  },
  play: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  bolt: {
    sizeAdjustment: -15,
    verticalOffset: 0,
  },
  star: {
    sizeAdjustment: -25,
    verticalOffset: 2,
  },
};

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

function postProcessValue(value: number) {
  value = Math.round(value * 10000) / 10000;
  return value === 0 ? undefined : value;
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
