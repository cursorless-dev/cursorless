import { HatShape } from "../hatStyles.types";

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

  bridge: { sizeAdjustment: 0, verticalOffset: -1 },
  church: { sizeAdjustment: 0, verticalOffset: -1 },
  fang: { sizeAdjustment: 0, verticalOffset: -1 },
  fez: { sizeAdjustment: 0, verticalOffset: -1 },
  gem: { sizeAdjustment: 0, verticalOffset: -1 },
  horn: { sizeAdjustment: 0, verticalOffset: -1 },
  knight: { sizeAdjustment: 0, verticalOffset: -1 },
  leaf: { sizeAdjustment: 0, verticalOffset: -1 },
  meeple: { sizeAdjustment: 0, verticalOffset: -1 },
  moon: { sizeAdjustment: 0, verticalOffset: -1 },
  mosque: { sizeAdjustment: 0, verticalOffset: -1 },
  pail: { sizeAdjustment: 0, verticalOffset: -1 },
  rook: { sizeAdjustment: 0, verticalOffset: -1 },
  shroom: { sizeAdjustment: 0, verticalOffset: -1 },
  singer: { sizeAdjustment: 0, verticalOffset: -1 },
  stair: { sizeAdjustment: 0, verticalOffset: -1 },
  stupa: { sizeAdjustment: 0, verticalOffset: -1 },
  wave: { sizeAdjustment: 0, verticalOffset: -1 },
  star: { sizeAdjustment: 0, verticalOffset: -1 },
  gate: { sizeAdjustment: 0, verticalOffset: -1 },
  wrench: { sizeAdjustment: 0, verticalOffset: -1 },
};
