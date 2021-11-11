import {
  Action,
  ActionPreferences,
  ActionReturnValue,
  Graph,
  TypedSelection,
} from "../typings/Types";
import { ensureSingleTarget } from "../util/targetUtils";
import { CodeAction, commands, window } from "vscode";

type CodeActionApplyType = "ifSingle" | "never" | "first";

interface CodeActionArg {
  kind?: string;
  preferred?: boolean;
  apply?: CodeActionApplyType;

  /**
   * Use this flag to indicate that you only want to see a list of the possible
   * options, not to execute anything
   */
  onlyDisplayInfo?: boolean;
}

export default class ExecuteCodeAction implements Action {
  getTargetPreferences: () => ActionPreferences[] = () => [
    { insideOutsideType: "inside" },
  ];

  constructor(private graph: Graph) {
    this.run = this.run.bind(this);
  }

  async run(
    [targets]: [TypedSelection[]],
    options: CodeActionArg
  ): Promise<ActionReturnValue> {
    const target = ensureSingleTarget(targets);
    const { kind, preferred, onlyDisplayInfo, apply } = options;

    await this.graph.actions.setSelection.run([targets]);

    if (onlyDisplayInfo) {
      const availableCodeActions = await commands.executeCommand<CodeAction[]>(
        "vscode.executeCodeActionProvider",
        target.selection.editor.document.uri,
        target.selection.selection,
        kind
      );

      availableCodeActions!.forEach((availableCodeAction) => {
        const { title, kind, isPreferred } = availableCodeAction;

        console.log(
          `${JSON.stringify(
            { title, kind: kind?.value, isPreferred },
            null,
            4
          )}`
        );
      });

      window.showInformationMessage(
        "Run command 'Developer: Toggle Developer Tools' to see available code actions"
      );
    } else {
      await commands.executeCommand("editor.action.codeAction", {
        kind,
        preferred,
        apply,
      });
    }

    return {};
  }
}
