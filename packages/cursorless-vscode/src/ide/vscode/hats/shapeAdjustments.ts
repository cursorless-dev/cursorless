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
    sizeAdjustment: -10,
  },
  fox: {
    sizeAdjustment: -2.5,
  },
  wing: {
    sizeAdjustment: -2.5,
  },
  hole: {
    sizeAdjustment: -5,
  },
  frame: {
    sizeAdjustment: -15,
  },
  curve: {
    sizeAdjustment: -5,
    verticalOffset: -3,
  },
  eye: {
    sizeAdjustment: -5,
  },
  play: {},
  bolt: {
    sizeAdjustment: -5,
  },
  crosshairs: {},
};
