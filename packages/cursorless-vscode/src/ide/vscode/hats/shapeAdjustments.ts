import { HatShape } from "../hatStyles.types";

export interface HatAdjustments {
  sizeAdjustment?: number;
  verticalOffset?: number;
}

export type IndividualHatAdjustmentMap = Record<HatShape, HatAdjustments>;

export const DEFAULT_HAT_HEIGHT_EM = 0.36;
export const DEFAULT_VERTICAL_OFFSET_EM = 0.05;

export const defaultShapeAdjustments: IndividualHatAdjustmentMap = {
  default: {
    sizeAdjustment: -30,
  },
  ex: {
    sizeAdjustment: -12.5,
  },
  fox: {
    sizeAdjustment: -5,
  },
  wing: {
    sizeAdjustment: -2.5,
  },
  hole: {},
  frame: {
    sizeAdjustment: -20,
  },
  curve: {
    verticalOffset: -5,
  },
  eye: {},
  play: {},
  bolt: {},
  crosshairs: {},
};
