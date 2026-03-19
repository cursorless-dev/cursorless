import type { IDE } from "@cursorless/lib-common";
import { Selection } from "@cursorless/lib-common";
import type { Target } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import type { SimpleAction, ActionReturnValue } from "./actions.types";

abstract class SetSelectionBase implements SimpleAction {
  constructor(
    private ide: IDE,
    private selectionMode: "set" | "add",
    private rangeMode: "content" | "before" | "after",
  ) {
    this.run = this.run.bind(this);
  }

  async run(targets: Target[]): Promise<ActionReturnValue> {
    const editor = ensureSingleEditor(targets);
    const targetSelections = this.getSelections(targets);

    const selections =
      this.selectionMode === "add"
        ? editor.selections.concat(targetSelections)
        : targetSelections;

    const highlightWord =
      this.selectionMode === "set" &&
      selections.length === 1 &&
      selections[0].isEmpty;

    await this.ide
      .getEditableTextEditor(editor)
      .setSelections(selections, { focusEditor: true, highlightWord });

    return {
      thatTargets: targets,
    };
  }

  private getSelections(targets: Target[]): Selection[] {
    switch (this.rangeMode) {
      case "content":
        return targets.map((target) => target.contentSelection);
      case "before":
        return targets.map(
          (target) =>
            new Selection(target.contentRange.start, target.contentRange.start),
        );
      case "after":
        return targets.map(
          (target) =>
            new Selection(target.contentRange.end, target.contentRange.end),
        );
    }
  }
}

export class SetSelection extends SetSelectionBase {
  constructor(ide: IDE) {
    super(ide, "set", "content");
  }
}

export class SetSelectionBefore extends SetSelectionBase {
  constructor(ide: IDE) {
    super(ide, "set", "before");
  }
}

export class SetSelectionAfter extends SetSelectionBase {
  constructor(ide: IDE) {
    super(ide, "set", "after");
  }
}

export class AddSelection extends SetSelectionBase {
  constructor(ide: IDE) {
    super(ide, "add", "content");
  }
}

export class AddSelectionBefore extends SetSelectionBase {
  constructor(ide: IDE) {
    super(ide, "add", "before");
  }
}

export class AddSelectionAfter extends SetSelectionBase {
  constructor(ide: IDE) {
    super(ide, "add", "after");
  }
}
