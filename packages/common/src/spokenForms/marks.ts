const hatColors: Record<string, string> = {
  blue: "blue",
  green: "green",
  red: "red",
  pink: "pink",
  yellow: "yellow",
  userColor1: "navy",
  userColor2: "apricot",
};

const hatShapes: Record<string, string> = {
  ex: "ex",
  fox: "fox",
  wing: "wing",
  hole: "hole",
  frame: "frame",
  curve: "curve",
  eye: "eye",
  play: "play",
  crosshairs: "cross",
  bolt: "bolt",
};

const marks: Record<string, string | null> = {
  cursor: "this",
  that: "that",
  source: "source",
  nothing: "nothing",

  explicit: null,
};

export const lineDirections = {
  modulo100: "row",
  relativeUp: "up",
  relativeDown: "down",
};

export function hatColorToSpokenForm(color: string): string {
  const result = hatColors[color];
  if (result == null) {
    throw Error(`Unknown hat color '${color}'`);
  }
  return result;
}

export function hatShapeToSpokenForm(shape: string): string {
  const result = hatShapes[shape];
  if (result == null) {
    throw Error(`Unknown hat shape '${shape}'`);
  }
  return result;
}

export function markTypeToSpokenForm(mark: string): string {
  const result = marks[mark];
  if (result == null) {
    throw Error(`Unknown mark '${mark}'`);
  }
  return result;
}
