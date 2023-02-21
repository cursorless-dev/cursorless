/**
 * This script can be used to add hat tweaks to the currently shipping ones
 */
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

function processProperty(
  originalAdjustment: HatAdjustments,
  newAdjustment: HatAdjustments,
  propertyName: keyof HatAdjustments,
) {
  const originalValue = originalAdjustment[propertyName] ?? 0;
  const newAdjustmentValue = newAdjustment[propertyName] ?? 0;
  const newValue = originalValue + newAdjustmentValue;
  const value = (originalValue + newValue) / 2;

  return {
    value: postProcessValue(value),
    originalAdjustment: postProcessValue(originalValue - value),
    newAdjustment: postProcessValue(newValue - value),
  };
}

function main() {
  const fullMap = Object.fromEntries(
    HAT_SHAPES.map((shape) => {
      const originalAdjustment = defaultShapeAdjustments[shape] ?? {};
      const newAdjustment = newAdjustments[shape] ?? {};

      return [
        shape,
        {
          sizeAdjustment: processProperty(
            originalAdjustment,
            newAdjustment,
            "sizeAdjustment",
          ),
          verticalOffset: processProperty(
            originalAdjustment,
            newAdjustment,
            "verticalOffset",
          ),
        },
      ];
    }),
  );

  (["value", "originalAdjustment", "newAdjustment"] as const).forEach((key) => {
    const map = Object.fromEntries(
      HAT_SHAPES.map((shape) => {
        return [
          shape,
          {
            sizeAdjustment: fullMap[shape].sizeAdjustment[key],
            verticalOffset: fullMap[shape].verticalOffset[key],
          },
        ];
      }),
    ) as IndividualHatAdjustmentMap;
    console.log(`${key}: `);
    console.log(JSON.stringify(map, null, 2));
  });
}

main();
