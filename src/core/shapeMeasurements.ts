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
    verticalOffset: 2.1,
  },
  hole: {
    sizeAdjustment: 45,
    verticalOffset: -2,
  },
  frame: {
    sizeAdjustment: -20,
    verticalOffset: -4.5,
  },
  curve: {
    sizeAdjustment: -27,
    verticalOffset: -4.1,
  },
  eye: {
    sizeAdjustment: -4,
    verticalOffset: -1,
  },
  play: {
    sizeAdjustment: -8,
    verticalOffset: -0.5,
  },
  bolt: {
    sizeAdjustment: 30,
  },
  star: {
    sizeAdjustment: 42,
    verticalOffset: -2,
  },
};
