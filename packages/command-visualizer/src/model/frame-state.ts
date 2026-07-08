// Multi-frame state schema. A FRAME is exactly one `.cl-editor` surface
// (EditorState minus the doc-level theme/tab). A cascade wraps an ordered list
// of frames and adds the decoration OVERLAY layer.

import type { Theme } from "../data/colors";
import type { Line } from "./columns";
import type { Position, Range, GeneralizedRange } from "@cursorless/lib-common";
import type { OverlayStyleName } from "../data/decorations";

export type FrameRole = "before" | "during" | "after";

export type OverlayRole =
  | "flash"
  | "highlight"
  | "that"
  | "source"
  | `scope:${string}`;

// GeneralizedRange (character | line) comes from @cursorless/lib-common.
// A line range's `end` field is the last line, INCLUSIVE — same semantics the
// local type carried before this adopted lib-common's shape.

export interface Decoration {
  style: OverlayStyleName;
  range: GeneralizedRange;
  role: OverlayRole;
}

export interface Frame {
  role: FrameRole;
  lines: Line[];
  cursors: Position[];
  selections: Range[];
  decorations: Decoration[];
  /** Spoken form of the command this frame is the BEFORE of (command strip). */
  command?: string;
  /** Clipboard contents relevant to this frame (VisualizerMetadata port). */
  clipboard?: string;
  /** Seamless-loop reset frame: re-shows the sequence initial state. */
  reset?: boolean;
  /** Pre-gif bumper frame: shows the initial state before step 0 begins. */
  pre?: boolean;
  /** Explicit duration override (ms). Defaults resolve by role in timeline.ts. */
  durMs?: number;
}

export interface CascadeMeta {
  spokenForm?: string;
  action?: string;
  fixture?: string;
}

export interface CascadeState {
  theme: Theme;
  tabSize: number;
  meta?: CascadeMeta;
  frames: Frame[];
}
