import { HatColor, HatShape, VscodeHatStyleName } from "../hatStyles.types";

export function getStyleName(
  color: HatColor,
  shape: HatShape,
): VscodeHatStyleName {
  if (shape === "default") {
    return color;
  }

  return `${color}-${shape}`;
}
