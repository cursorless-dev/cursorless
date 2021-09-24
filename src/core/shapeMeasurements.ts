import { HatShape } from "./constants";

export interface HatAdjustments {
  sizeAdjustment?: number;
  verticalOffset?: number;
}

export type IndividualHatAdjustmentMap = Record<HatShape, HatAdjustments>;

export const DEFAULT_HAT_HEIGHT_EM = 0.29;
export const DEFAULT_VERTICAL_OFFSET_EM = 0.032;

export const defaultShapeMeasurements: IndividualHatAdjustmentMap = {
  default: {
    sizeAdjustment: -14,
    verticalOffset: -0.35,
  },
  ex: {
    sizeAdjustment: 10,
  },
  fox: {
    sizeAdjustment: 10,
  },
  wing: {
    sizeAdjustment: 18,
    verticalOffset: -0.1,
  },
  hole: {
    sizeAdjustment: 45,
    verticalOffset: -2.5,
  },
  frame: {
    sizeAdjustment: -15,
    verticalOffset: -0.5,
  },
  curve: {
    sizeAdjustment: -27,
    verticalOffset: -2,
  },
  eye: {
    sizeAdjustment: -3,
    verticalOffset: -1,
  },
  play: {
    sizeAdjustment: -2,
  },
  bolt: {},
  star: {
    sizeAdjustment: 42,
    verticalOffset: -2,
  },
};
