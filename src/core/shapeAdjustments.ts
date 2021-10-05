import { HatShape } from "./constants";

export interface HatAdjustments {
  sizeAdjustment?: number;
  verticalOffset?: number;
}

export type IndividualHatAdjustmentMap = Record<HatShape, HatAdjustments>;

export const DEFAULT_HAT_HEIGHT_EM = 0.29;
export const DEFAULT_VERTICAL_OFFSET_EM = 0.032;

export const defaultShapeAdjustments: IndividualHatAdjustmentMap = {
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
    sizeAdjustment: 15.5,
    verticalOffset: 1.1,
  },
  hole: {
    sizeAdjustment: 32.5,
    verticalOffset: -2,
  },
  frame: {
    sizeAdjustment: -15,
    verticalOffset: -2.25,
  },
  curve: {
    sizeAdjustment: -21,
    verticalOffset: -3.15,
  },
  eye: {
    sizeAdjustment: -6.5,
    verticalOffset: -1,
  },
  play: {
    sizeAdjustment: -8,
    verticalOffset: -0.5,
  },
  bolt: {
    sizeAdjustment: 22.5,
  },
  crosshairs: {
    sizeAdjustment: 29.5,
    verticalOffset: -1,
  },
};
