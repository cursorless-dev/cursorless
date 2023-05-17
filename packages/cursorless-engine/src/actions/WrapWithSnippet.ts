import { FlashStyle, ScopeType } from "@cursorless/common";
import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { callFunctionAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ModifyIfUntypedStage } from "../processTargets/modifiers/ConditionalModifierStages";
import { ide } from "../singletons/ide.singleton";
import {
  findMatchingSnippetDefinitionStrict,
  transformSnippetVariables,
} from "../snippets/snippet";
import { SnippetParser } from "../snippets/vendor/vscodeSnippet/snippetParser";
import { Target } from "../typings/target.types";
import { ensureSingleEditor, flashTargets } from "../util/targetUtils";
import { Action, ActionReturnValue } from "./actions.types";

interface NamedSnippetArg {
  type: "named";
  name: string;
  variableName: string;
}
interface CustomSnippetArg {
  type: "custom";
  body: string;
  variableName?: string;
  scopeType?: ScopeType;
}
type WrapWithSnippetArg = NamedSnippetArg | CustomSnippetArg;

export default class WrapWithSnippet implements Action {
  private snippetParser = new SnippetParser();

  constructor(
    private rangeUpdater: RangeUpdater,
    private snippets: Snippets,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  getFinalStages(snippet: WrapWithSnippetArg) {
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
    snippetDescription: WrapWithSnippetArg,
  ): ScopeType | undefined {
    if (snippetDescription.type === "named") {
      const { name, variableName } = snippetDescription;

      const snippet = this.snippets.getSnippetStrict(name);

      const variables = snippet.variables ?? {};
      const scopeTypeType = variables[variableName]?.wrapperScopeType;
      return scopeTypeType == null
        ? undefined
        : {
            type: scopeTypeType,
          };
    } else {
      return snippetDescription.scopeType;
    }
  }

  private getBody(
    snippetDescription: WrapWithSnippetArg,
    targets: Target[],
  ): string {
    if (snippetDescription.type === "named") {
      const { name } = snippetDescription;

      const snippet = this.snippets.getSnippetStrict(name);

      const definition = findMatchingSnippetDefinitionStrict(
        targets,
        snippet.definitions,
      );

      return definition.body.join("\n");
    } else {
      return snippetDescription.body;
    }
  }

  async run(
    [targets]: [Target[]],
    snippetDescription: WrapWithSnippetArg,
  ): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));

    const body = this.getBody(snippetDescription, targets);

    const parsedSnippet = this.snippetParser.parse(body);

    transformSnippetVariables(parsedSnippet, snippetDescription.variableName);

    const snippetString = parsedSnippet.toTextmateString();

    await flashTargets(ide(), targets, FlashStyle.pendingModification0);

    const targetSelections = targets.map((target) => target.contentSelection);

    // NB: We used the command "editor.action.insertSnippet" instead of calling editor.insertSnippet
    // because the latter doesn't support special variables like CLIPBOARD
    const [updatedTargetSelections] = await callFunctionAndUpdateSelections(
      this.rangeUpdater,
      () => editor.insertSnippet(snippetString, targetSelections),
      editor.document,
      [targetSelections],
    );

    return {
      thatSelections: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}
