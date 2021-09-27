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
    sizeAdjustment: -7,
    verticalOffset: -0.175,
  },
  ex: {
    sizeAdjustment: 5,
  },
  fox: {
    sizeAdjustment: 5,
  },
  wing: {
    sizeAdjustment: 6.5,
    verticalOffset: 0.05,
  },
  hole: {
    sizeAdjustment: 10,
    verticalOffset: -1,
  },
  frame: {
    sizeAdjustment: -5,
  },
  curve: {
    sizeAdjustment: -7.5,
    verticalOffset: -1.1,
  },
  eye: {
    sizeAdjustment: -4.5,
    verticalOffset: -0.5,
  },
  play: {
    sizeAdjustment: -4,
    verticalOffset: -0.25,
  },
  bolt: {
    sizeAdjustment: 7.5,
  },
  star: {
    sizeAdjustment: 8.5,
  },
};
