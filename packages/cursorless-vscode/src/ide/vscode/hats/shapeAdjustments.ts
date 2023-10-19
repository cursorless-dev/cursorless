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
    sizeAdjustment: -15,
  },
  fox: {
    sizeAdjustment: -10,
  },
  wing: {
    sizeAdjustment: -2.5,
  },
  hole: {
    sizeAdjustment: -5.5,
  },
  frame: {
    sizeAdjustment: -20,
  },
  curve: {
    sizeAdjustment: -6,
    verticalOffset: -3,
  },
  eye: {
    sizeAdjustment: -4.5,
  },
  play: {},
  bolt: {
    sizeAdjustment: -5.5,
  },
  crosshairs: {},
};
