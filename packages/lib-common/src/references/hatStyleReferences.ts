import type { SpokenFormReference } from "./ReferenceEntry";

type HatStyleReference = SpokenFormReference & {
  name: string;
  defaultSpokenForm: string;
};

export const hatColorReferences = {
  blue: {
    name: "Blue",
    defaultSpokenForm: "blue",
  },
  green: {
    name: "Green",
    defaultSpokenForm: "green",
  },
  red: {
    name: "Red",
    defaultSpokenForm: "red",
  },
  pink: {
    name: "Pink",
    defaultSpokenForm: "pink",
  },
  yellow: {
    name: "Yellow",
    defaultSpokenForm: "yellow",
  },
  userColor1: {
    name: "User color 1",
    defaultSpokenForm: "navy",
    visibility: "disabledByDefault",
  },
  userColor2: {
    name: "User color 2",
    defaultSpokenForm: "apricot",
    visibility: "disabledByDefault",
  },
  userColor3: {
    name: "User color 3",
    defaultSpokenForm: "user color three",
    visibility: "disabledByDefault",
  },
  userColor4: {
    name: "User color 4",
    defaultSpokenForm: "user color four",
    visibility: "disabledByDefault",
  },
} as const satisfies Record<string, HatStyleReference>;

export const hatShapeReferences = {
  ex: {
    name: "Ex",
    defaultSpokenForm: "ex",
    visibility: "disabledByDefault",
  },
  fox: {
    name: "Fox",
    defaultSpokenForm: "fox",
    visibility: "disabledByDefault",
  },
  wing: {
    name: "Wing",
    defaultSpokenForm: "wing",
    visibility: "disabledByDefault",
  },
  hole: {
    name: "Hole",
    defaultSpokenForm: "hole",
    visibility: "disabledByDefault",
  },
  frame: {
    name: "Frame",
    defaultSpokenForm: "frame",
    visibility: "disabledByDefault",
  },
  curve: {
    name: "Curve",
    defaultSpokenForm: "curve",
    visibility: "disabledByDefault",
  },
  eye: {
    name: "Eye",
    defaultSpokenForm: "eye",
    visibility: "disabledByDefault",
  },
  play: {
    name: "Play",
    defaultSpokenForm: "play",
    visibility: "disabledByDefault",
  },
  crosshairs: {
    name: "Crosshairs",
    defaultSpokenForm: "cross",
    visibility: "disabledByDefault",
  },
  bolt: {
    name: "Bolt",
    defaultSpokenForm: "bolt",
    visibility: "disabledByDefault",
  },
} as const satisfies Record<string, HatStyleReference>;
