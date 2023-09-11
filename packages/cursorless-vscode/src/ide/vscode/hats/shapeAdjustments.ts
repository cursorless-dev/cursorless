import { HatShape } from "../hatStyles.types";

export interface HatAdjustments {
  sizeAdjustment?: number;
  verticalOffset?: number;
}

export type IndividualHatAdjustmentMap = Record<HatShape, HatAdjustments>;

export const DEFAULT_HAT_HEIGHT_EM = 0.38;
export const DEFAULT_VERTICAL_OFFSET_EM = 0.032;

export const defaultShapeAdjustments: IndividualHatAdjustmentMap = {
  default: {
    sizeAdjustment: -15,
    verticalOffset: 0,
  },
  ex: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  fox: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  wing: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  hole: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  frame: {
    sizeAdjustment: -12.5,
    verticalOffset: 0,
  },
  curve: {
    sizeAdjustment: 0,
    verticalOffset: -5,
  },
  eye: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  play: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  bolt: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
  crosshairs: {
    sizeAdjustment: 0,
    verticalOffset: 0,
  },
};
