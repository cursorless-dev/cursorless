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
    disabledByDefault: true,
  },
  userColor2: {
    name: "User color 2",
    defaultSpokenForm: "apricot",
    disabledByDefault: true,
  },
  userColor3: {
    name: "User color 3",
    defaultSpokenForm: "user color three",
    disabledByDefault: true,
  },
  userColor4: {
    name: "User color 4",
    defaultSpokenForm: "user color four",
    disabledByDefault: true,
  },
} as const satisfies Record<string, HatStyleReference>;

export const hatShapeReferences = {
  ex: {
    name: "Ex",
    defaultSpokenForm: "ex",
    disabledByDefault: true,
  },
  fox: {
    name: "Fox",
    defaultSpokenForm: "fox",
    disabledByDefault: true,
  },
  wing: {
    name: "Wing",
    defaultSpokenForm: "wing",
    disabledByDefault: true,
  },
  hole: {
    name: "Hole",
    defaultSpokenForm: "hole",
    disabledByDefault: true,
  },
  frame: {
    name: "Frame",
    defaultSpokenForm: "frame",
    disabledByDefault: true,
  },
  curve: {
    name: "Curve",
    defaultSpokenForm: "curve",
    disabledByDefault: true,
  },
  eye: {
    name: "Eye",
    defaultSpokenForm: "eye",
    disabledByDefault: true,
  },
  play: {
    name: "Play",
    defaultSpokenForm: "play",
    disabledByDefault: true,
  },
  crosshairs: {
    name: "Crosshairs",
    defaultSpokenForm: "cross",
    disabledByDefault: true,
  },
  bolt: {
    name: "Bolt",
    defaultSpokenForm: "bolt",
    disabledByDefault: true,
  },
} as const satisfies Record<string, HatStyleReference>;
