import { Range } from "vscode";
import { Target } from "../../typings/target.types";

export interface CommandTarget {
  target: Target;
  index: number;
  command: string;
}

export interface EditTarget {
  target: Target;
  index: number;
}

export interface State {
  targets: Target[];
  thatRanges: Range[];
  cursorRanges: (Range | undefined)[];
}
