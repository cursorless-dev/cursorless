/**
 * Standalone entry point for HatBox's embedded QuickJS engine.
 *
 * This file creates a fully self-contained cursorless engine that doesn't
 * depend on Talon at all. Instead of routing edits/selections through Talon
 * Python actions, it captures them as pending side effects and returns them
 * in the command response JSON for HatBox's Swift layer to apply via AX.
 *
 * Exposes two global functions for HatBox's C bridge:
 *   - hatboxReallocateHats(editorStateJSON) → hatsJSON
 *   - hatboxRunCommand(inputJSON) → (triggers async, result stored in global)
 *   - hatboxGetLastCommandResponse() → responseJSON (read after draining jobs)
 */
import "../polyfill";

import { CURSORLESS_COMMAND_ID, FakeCommandServerApi } from "@cursorless/common";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import { TalonJsIDE } from "../ide/TalonJsIDE";
import { TalonJsHatBoxHats } from "../ide/TalonJsHatBoxHats";
import type {
  Talon,
  TalonActions,
  TalonContext,
  TalonContextActions,
  TalonSettings,
} from "../types/talon.types";
import type {
  EditorEdit,
  EditorState,
  RangeOffsets,
  SelectionOffsets,
} from "../types/types";

// -- Pending side effects captured during command execution --

let pendingEdits: EditorEdit[] = [];
let pendingSelections: SelectionOffsets[][] = [];
let pendingFlashRanges: RangeOffsets[] = [];
let pendingHatRangesJson: string | null = null;
let currentEditorState: EditorState | null = null;
let clipboard = "";
let lastCommandResponseJson: string = "{}";

// -- Mock Talon that captures side effects --

const actions: TalonActions = {
  app: {
    notify(body: string, title: string): void {
      console.log(`app.notify: ${title}: ${body}`);
    },
  },
  clip: {
    set_text(text: string): void {
      clipboard = text;
    },
    text(): string {
      return clipboard;
    },
  },
  edit: {
    find(_text?: string): void {
      // No-op in HatBox
    },
  },
  user: {
    cursorless_everywhere_get_editor_state(): EditorState {
      if (currentEditorState == null) {
        throw new Error("Editor state not set.");
      }
      return currentEditorState;
    },
    cursorless_everywhere_set_selections(selections: SelectionOffsets[]): void {
      pendingSelections.push(selections);
    },
    cursorless_everywhere_edit_text(edit: EditorEdit): void {
      pendingEdits.push(edit);
    },
    cursorless_everywhere_flash_ranges(ranges: RangeOffsets[]): void {
      pendingFlashRanges.push(...ranges);
    },
    cursorless_everywhere_set_hat_ranges(hatsJson: string): void {
      pendingHatRangesJson = hatsJson;
    },
  },
};

const settings: TalonSettings = {
  get(_name, _defaultValue) {
    return null;
  },
};

class MockContext implements TalonContext {
  matches = "";
  tags: string[] = [];
  settings = {};
  lists = {};

  action_class(_name: "user", _actions: TalonContextActions): void {
    // No-op — HatBox doesn't use context actions (we call the engine directly)
  }
}

const mockTalon: Talon = {
  actions,
  settings,
  Context: MockContext as any,
};

// -- Engine initialization --

const ide = new TalonJsIDE(mockTalon, "production");
const hats = new TalonJsHatBoxHats(mockTalon);
const commandServerApi = new FakeCommandServerApi();

const enginePromise = createCursorlessEngine({
  ide,
  hats,
  commandServerApi,
});

// Resolve the engine synchronously (setTimeout shim runs callbacks immediately)
let commandApi: Awaited<ReturnType<typeof createCursorlessEngine>>["commandApi"];
let hatTokenMap: Awaited<ReturnType<typeof createCursorlessEngine>>["hatTokenMap"];

enginePromise.then((engine) => {
  commandApi = engine.commandApi;
  hatTokenMap = engine.hatTokenMap;
});

// -- Global API for HatBox's C bridge --

const global = globalThis as any;

/**
 * Reallocate hats for the given editor state.
 * Called by HatBox on every AX text/selection change.
 *
 * @param editorStateJSON - JSON string with {text, selections}
 * @returns JSON string with hat allocations [{offset, length, grapheme, styleName}]
 */
let lastHatRangesJson: string = "[]";
let lastPerfBreakdown: Record<string, number> = {};

/**
 * Trigger hat reallocation. The result is available via hatboxGetLastHatRanges()
 * after draining the QuickJS job queue.
 */
global.hatboxReallocateHats = function (editorStateJSON: string): string {
  const t0 = Date.now();
  const editorState: EditorState = JSON.parse(editorStateJSON);
  const t1 = Date.now();
  currentEditorState = editorState;
  pendingHatRangesJson = null;

  ide.updateTextEditors(editorState);
  const t2 = Date.now();

  // allocateHats is async — the result is captured in pendingHatRangesJson
  // when the promise resolves (after the job queue is drained by Swift).
  hatTokenMap.allocateHats().then(() => {
    const t3 = Date.now();
    lastHatRangesJson = pendingHatRangesJson ?? "[]";
    lastPerfBreakdown = {
      parseJSON: t1 - t0,
      updateEditors: t2 - t1,
      allocateHats: t3 - t2,
      total: t3 - t0,
    };
  });

  return "ok";
};

/**
 * Read the hat ranges from the last hatboxReallocateHats call.
 * Must be called AFTER draining the QuickJS job queue.
 */
global.hatboxGetLastHatRanges = function (_unused?: string): string {
  return lastHatRangesJson;
};

/**
 * Read the performance breakdown from the last hatboxReallocateHats call.
 * Returns JSON with {parseJSON, updateEditors, allocateHats, total} in ms.
 */
global.hatboxGetPerfBreakdown = function (_unused?: string): string {
  return JSON.stringify(lastPerfBreakdown);
};

/**
 * Run a cursorless command. The command executes asynchronously via promises;
 * the caller (Swift) must drain the QuickJS job queue after this call, then
 * read the result via hatboxGetLastCommandResponse().
 *
 * @param inputJSON - JSON string with {commandId, command, editorState}
 * @returns "ok" (actual response available after draining jobs)
 */
global.hatboxRunCommand = function (inputJSON: string): string {
  const { commandId, command, editorState } = JSON.parse(inputJSON);

  // Reset pending side effects
  pendingEdits = [];
  pendingSelections = [];
  pendingFlashRanges = [];
  pendingHatRangesJson = null;
  currentEditorState = editorState;
  lastCommandResponseJson = "{}";

  // Update the IDE with current editor state
  ide.updateTextEditors(editorState);

  // Allocate hats first, then run the command.
  // Both are async — chaining ensures hats are populated before command resolution.
  const hatsReady = hatTokenMap.allocateHats();

  if (commandId === CURSORLESS_COMMAND_ID) {
    hatsReady
      .then(() => commandApi.runCommandSafe(command))
      .then((result: unknown) => {
        lastCommandResponseJson = JSON.stringify({
          edits: pendingEdits,
          selections: pendingSelections,
          flashRanges: pendingFlashRanges,
          commandResponse: result,
          hatRanges: pendingHatRangesJson,
        });
      })
      .catch((err: unknown) => {
        lastCommandResponseJson = JSON.stringify({
          error: String(err),
        });
      });
  } else if (commandId === "hatbox.reallocateHats") {
    hatsReady.then(() => {
      lastCommandResponseJson = JSON.stringify({
        edits: [],
        selections: [],
        flashRanges: [],
        commandResponse: null,
        hatRanges: pendingHatRangesJson,
      });
    });
  } else {
    lastCommandResponseJson = JSON.stringify({
      error: `Unknown command ID: ${commandId}`,
    });
  }

  return "ok";
};

/**
 * Read the result of the last hatboxRunCommand call.
 * Must be called AFTER draining the QuickJS job queue.
 */
global.hatboxGetLastCommandResponse = function (_unused?: string): string {
  return lastCommandResponseJson;
};

console.log("HatBox embedded cursorless engine initialized");
