import {
  HatColor,
  HatShape,
  HatStyleName,
} from "../libs/common/ide/types/hatStyles.types";

export function getStyleName(color: HatColor, shape: HatShape): HatStyleName {
  if (shape === "default") {
    return color;
  }

  return `${color}-${shape}`;
}
