import assert from "node:assert/strict";
import { chainCascades, ChainContinuityError } from "./chain";
import type { CascadeState, Frame } from "../model/frame-state";

function beforeFrame(): Frame {
  return {
    role: "before",
    lines: [],
    cursors: [],
    selections: [],
    decorations: [],
  };
}

function singleStepState(meta: CascadeState["meta"]): CascadeState {
  return { theme: "dark", tabSize: 2, meta, frames: [beforeFrame()] };
}

suite("command-visualizer/chain", () => {
  suite("chainCascades", () => {
    test("throws ChainContinuityError with step index 0 on empty input", () => {
      let caught: unknown;
      try {
        chainCascades([], "recorded/x.yml");
      } catch (err) {
        caught = err;
      }
      assert.ok(caught instanceof ChainContinuityError);
      assert.equal((caught as ChainContinuityError).stepIndex, 0);
    });

    test("single-step: applies fixtureLabel while preserving other meta", () => {
      const state = singleStepState({
        spokenForm: "chuck",
        action: "remove",
        fixture: "per-step.yml",
      });
      const result = chainCascades([state], "recorded/chuck.yml");
      assert.equal(result.meta?.fixture, "recorded/chuck.yml");
      assert.equal(result.meta?.spokenForm, "chuck");
      assert.equal(result.meta?.action, "remove");
    });

    test("single-step: sets fixtureLabel even when the state has no meta", () => {
      const state = singleStepState(undefined);
      const result = chainCascades([state], "recorded/only.yml");
      assert.equal(result.meta?.fixture, "recorded/only.yml");
    });
  });
});
