import type { Range } from "../../types/Range";
import type { Selection } from "../../types/Selection";
import type { TextEditor } from "../../types/TextEditor";
import type { Disposable } from "./ide.types";

/**
 * Represents a typed event.
 *
 * A function that represents an event to which you subscribe by calling it with
 * a listener function as argument.
 *
 * @example
 * item.onDidChange(function(event) { console.log("Event happened: " + event); });
 */
export interface Event<T> {
  /**
   * A function that represents an event to which you subscribe by calling it with
   * a listener function as argument.
   *
   * @param listener The listener function will be called when the event happens.
   * @param thisArgs The `this`-argument which will be used when calling the event listener.
   * @param disposables An array to which a {@link Disposable} will be added.
   * @return A disposable which unsubscribes the event listener.
   */
  (
    listener: (e: T) => any,
    thisArgs?: any,
    disposables?: Disposable[],
  ): Disposable;
}

/**
 * Represents sources that can cause {@link window.onDidChangeTextEditorSelection selection change events}.
 */
export enum TextEditorSelectionChangeKind {
  /**
   * Selection changed due to typing in the editor.
   */
  keyboard = 1,
  /**
   * Selection change due to clicking in the editor.
   */
  mouse = 2,
  /**
   * Selection changed because a command ran.
   */
  command = 3,
}

/**
 * Represents an event describing the change in a {@link TextEditor.selections text editor's selections}.
 */
export interface TextEditorSelectionChangeEvent {
  /**
   * The {@link TextEditor text editor} for which the selections have changed.
   */
  readonly textEditor: TextEditor;
  /**
   * The new value for the {@link TextEditor.selections text editor's selections}.
   */
  readonly selections: readonly Selection[];
  /**
   * The {@link TextEditorSelectionChangeKind change kind} which has triggered this
   * event. Can be `undefined`.
   */
  readonly kind?: TextEditorSelectionChangeKind;
}

/**
 * Represents an event describing the change in a {@link TextEditor.visibleRanges text editor's visible ranges}.
 */
export interface TextEditorVisibleRangesChangeEvent {
  /**
   * The {@link TextEditor text editor} for which the visible ranges have changed.
   */
  readonly textEditor: TextEditor;
  /**
   * The new value for the {@link TextEditor.visibleRanges text editor's visible ranges}.
   */
  readonly visibleRanges: readonly Range[];
}
