import type { InsertSnippetArg } from "@cursorless/common";
import { RangeExpansionBehavior } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";
import { getPreferredSnippet } from "../core/getPreferredSnippet";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import type { ModifierStage } from "../processTargets/PipelineStages.types";
import { ModifyIfUntypedExplicitStage } from "../processTargets/modifiers/ConditionalModifierStages";
import { ide } from "../singletons/ide.singleton";
import { transformSnippetVariables } from "../snippets/transformSnippetVariables";
import { SnippetParser } from "../snippets/vendor/vscodeSnippet/snippetParser";
import type { Destination } from "../typings/target.types";
import { ensureSingleEditor } from "../util/targetUtils";
import type { Actions } from "./Actions";
import type { ActionReturnValue } from "./actions.types";
import InsertSnippetLegacy from "./snippetsLegacy/InsertSnippetLegacy";

export default class InsertSnippet {
  private snippetParser = new SnippetParser();

  constructor(
    private rangeUpdater: RangeUpdater,
    private snippets: Snippets,
    private actions: Actions,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  getFinalStages(
    destinations: Destination[],
    snippetDescription: InsertSnippetArg,
  ): ModifierStage[] {
    if (snippetDescription.type === "named") {
      return this.legacy().getFinalStages(snippetDescription);
    }

    const editor = ensureSingleEditor(destinations);
    const snippet = getPreferredSnippet(
      snippetDescription,
      editor.document.languageId,
    );
    const defaultScopeTypes = snippet.scopeTypes ?? [];
    return defaultScopeTypes.length === 0
      ? []
      : [
          new ModifyIfUntypedExplicitStage(this.modifierStageFactory, {
            type: "fallback",
            modifiers: defaultScopeTypes.map((scopeType) => ({
              type: "containingScope",
              scopeType,
            })),
          }),
        ];
  }

  async run(
    destinations: Destination[],
    snippetDescription: InsertSnippetArg,
  ): Promise<ActionReturnValue> {
    if (snippetDescription.type === "named") {
      return this.legacy().run(destinations, snippetDescription);
    }

    const editor = ide().getEditableTextEditor(
      ensureSingleEditor(destinations),
    );
    const snippet = getPreferredSnippet(
      snippetDescription,
      editor.document.languageId,
    );

    const parsedSnippet = this.snippetParser.parse(snippet.body);

    const substitutions =
      snippet.substitutions ?? snippetDescription.substitutions;

    transformSnippetVariables(parsedSnippet, null, substitutions);

    const snippetString = parsedSnippet.toTextmateString();

    await this.actions.editNew.run(destinations);

    const { editorSelections: updatedThatSelections } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor,
        callback: () => editor.insertSnippet(snippetString),
        preserveCursorSelections: true,
        selections: {
          editorSelections: {
            selections: editor.selections,
            behavior: RangeExpansionBehavior.openOpen,
          },
        },
      });

    return {
      thatSelections: updatedThatSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }

  // DEPRECATED @ 2025-02-01
  private legacy() {
    return new InsertSnippetLegacy(
      this.rangeUpdater,
      this.snippets,
      this.actions,
      this.modifierStageFactory,
    );
  }
}
