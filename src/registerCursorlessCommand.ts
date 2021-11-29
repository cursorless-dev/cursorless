import * as vscode from "vscode";
import inferFullTargets from "./core/inferFullTargets";
import processTargets from "./processTargets";
import { Graph, PartialTarget, ProcessedTargetsContext } from "./typings/Types";
import { ThatMark } from "./core/ThatMark";
import { TestCaseRecorder } from "./testUtil/TestCaseRecorder";
import { canonicalizeAndValidateCommand } from "./util/canonicalizeAndValidateCommand";
import { doTargetsUsePrePhraseSnapshot } from "./util/doTargetsUsePrePhraseSnapshot";
import { SyntaxNode } from "web-tree-sitter";

// TODO: Do this using the graph once we migrate its dependencies onto the graph
export function registerCursorlessCommand(
  graph: Graph,
  thatMark: ThatMark,
  sourceMark: ThatMark,
  getNodeAtLocation: SyntaxNode,
  testCaseRecorder: TestCaseRecorder
) {
  return vscode.commands.registerCommand(
    "cursorless.command",
    async (
      spokenForm: string,
      inputActionName: string,
      inputPartialTargets: PartialTarget[],
      ...inputExtraArgs: unknown[]
    ) => {
      try {
        const { actionName, partialTargets, extraArgs } =
          canonicalizeAndValidateCommand(
            inputActionName,
            inputPartialTargets,
            inputExtraArgs
          );

        const usePrePhraseSnapshot =
          doTargetsUsePrePhraseSnapshot(partialTargets);
        const readableHatMap = await graph.hatTokenMap.getReadableMap(
          usePrePhraseSnapshot
        );

        console.debug(`spokenForm: ${spokenForm}`);
        console.debug(`action: ${actionName}`);
        console.debug(`partialTargets:`);
        console.debug(JSON.stringify(partialTargets, null, 3));
        console.debug(`extraArgs:`);
        console.debug(JSON.stringify(extraArgs, null, 3));

        const action = graph.actions[actionName];

        if (action == null) {
          throw new Error(`Unknown action ${actionName}`);
        }

        const targets = inferFullTargets(
          partialTargets,
          action.getTargetPreferences(...extraArgs)
        );

        const processedTargetsContext: ProcessedTargetsContext = {
          currentSelections:
            vscode.window.activeTextEditor?.selections.map((selection) => ({
              selection,
              editor: vscode.window.activeTextEditor!,
            })) ?? [],
          currentEditor: vscode.window.activeTextEditor,
          hatTokenMap: readableHatMap,
          thatMark: thatMark.exists() ? thatMark.get() : [],
          sourceMark: sourceMark.exists() ? sourceMark.get() : [],
          getNodeAtLocation,
        };

        const selections = processTargets(processedTargetsContext, targets);

        if (testCaseRecorder.active) {
          const command = { actionName, partialTargets, extraArgs };
          const context = {
            targets,
            thatMark,
            sourceMark,
            hatTokenMap: readableHatMap,
            spokenForm,
          };
          await testCaseRecorder.preCommandHook(command, context);
        }

        const {
          returnValue,
          thatMark: newThatMark,
          sourceMark: newSourceMark,
        } = await action.run(selections, ...extraArgs);

        thatMark.set(newThatMark);
        sourceMark.set(newSourceMark);

        if (testCaseRecorder.active) {
          await testCaseRecorder.postCommandHook(returnValue);
        }

        return returnValue;

        // writeFileSync(
        //   "/Users/pokey/src/cursorless-vscode/inferFullTargetsTests.jsonl",
        //   JSON.stringify({
        //     input: { context, partialTargets, preferredPositions },
        //     expectedOutput: targets,
        //   }) + "\n",
        //   { flag: "a" }
        // );
        // writeFileSync(
        //   "/Users/pokey/src/cursorless-vscode/processTargetsTests.jsonl",
        //   JSON.stringify({
        //     input: {
        //       context: processedTargetsContext,
        //       targets,
        //     },
        //     expectedOutput: selections,
        //   }) + "\n",
        //   { flag: "a" }
        // );
        // const processedTargets = processTargets(hatTokenMap!, targets);
      } catch (e) {
        testCaseRecorder.commandErrorHook();
        const err = e as Error;
        vscode.window.showErrorMessage(err.message);
        console.debug(err.message);
        console.debug(err.stack);
        throw err;
      }
    }
  );
}
