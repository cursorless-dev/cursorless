import type { NamedWrapWithSnippetArg, ScopeType } from "@cursorless/common";
import { FlashStyle } from "@cursorless/common";
import type { Snippets } from "../../core/Snippets";
import type { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../../core/updateSelections/updateSelections";
import type { ModifierStageFactory } from "../../processTargets/ModifierStageFactory";
import { ModifyIfUntypedStage } from "../../processTargets/modifiers/ConditionalModifierStages";
import { ide } from "../../singletons/ide.singleton";
import { SnippetParser } from "../../snippets/vendor/vscodeSnippet/snippetParser";
import type { Target } from "../../typings/target.types";
import { ensureSingleEditor, flashTargets } from "../../util/targetUtils";
import type { ActionReturnValue } from "../actions.types";
import {
  findMatchingSnippetDefinitionStrict,
  transformSnippetVariables,
} from "../snippetsLegacy/snippet";
import { showLegacySnippetsNotification } from "./legacySnippetsNotification";

export default class WrapWithSnippetLegacy {
  private snippetParser = new SnippetParser();

  constructor(
    private rangeUpdater: RangeUpdater,
    private snippets: Snippets,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  getFinalStages(snippet: NamedWrapWithSnippetArg) {
    const defaultScopeType = this.getScopeType(snippet);

    if (defaultScopeType == null) {
      return [];
    }

    return [
      new ModifyIfUntypedStage(this.modifierStageFactory, {
        type: "modifyIfUntyped",
        modifier: {
          type: "containingScope",
          scopeType: defaultScopeType,
        },
      }),
    ];
  }

  private getScopeType(
    snippetDescription: NamedWrapWithSnippetArg,
  ): ScopeType | undefined {
    const { name, variableName } = snippetDescription;

    const snippet = this.snippets.getSnippetStrict(name);

    const variables = snippet.variables ?? {};
    const scopeTypeType = variables[variableName]?.wrapperScopeType;
    return scopeTypeType == null
      ? undefined
      : {
          type: scopeTypeType,
        };
  }

  private getBody(
    snippetDescription: NamedWrapWithSnippetArg,
    targets: Target[],
  ): string {
    const { name } = snippetDescription;

    const snippet = this.snippets.getSnippetStrict(name);

    const definition = findMatchingSnippetDefinitionStrict(
      this.modifierStageFactory,
      targets,
      snippet.definitions,
    );

    return definition.body.join("\n");
  }

  async run(
    targets: Target[],
    snippetDescription: NamedWrapWithSnippetArg,
  ): Promise<ActionReturnValue> {
    showLegacySnippetsNotification();

    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));

    const body = this.getBody(snippetDescription, targets);

    const parsedSnippet = this.snippetParser.parse(body);

    transformSnippetVariables(parsedSnippet, snippetDescription.variableName);

    const snippetString = parsedSnippet.toTextmateString();

    await flashTargets(ide(), targets, FlashStyle.pendingModification0);

    const targetSelections = targets.map((target) => target.contentSelection);

    const callback = () =>
      editor.insertSnippet(snippetString, targetSelections);

    const { targetSelections: updatedTargetSelections } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor,
        callback,
        preserveCursorSelections: true,
        selections: {
          targetSelections,
        },
      });

    return {
      thatSelections: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}
