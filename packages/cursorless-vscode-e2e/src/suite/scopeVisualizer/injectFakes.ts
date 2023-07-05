import { Vscode } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import {
  DecorationRenderOptions,
  TextEditorDecorationType,
  WorkspaceConfiguration,
} from "vscode";
import { SetDecorationsParameters } from "./scopeVisualizerTest.types";
import { COLOR_CONFIG } from "./colorConfig";

export function injectFakes(vscodeApi: Vscode) {
  let decorationIndex = 0;
  const setDecorations = sinon.fake<
    SetDecorationsParameters,
    ReturnType<Vscode["editor"]["setDecorations"]>
  >();
  const getConfigurationValue = sinon.fake.returns(COLOR_CONFIG);
  const dispose = sinon.fake<[number], void>();
  const createTextEditorDecorationType = sinon.fake<
    Parameters<Vscode["window"]["createTextEditorDecorationType"]>,
    ReturnType<Vscode["window"]["createTextEditorDecorationType"]>
  >((_options: DecorationRenderOptions) => {
    const id = decorationIndex++;
    return {
      dispose() {
        dispose(id);
      },
      id,
    } as unknown as TextEditorDecorationType;
  });

  sinon.replace(
    vscodeApi.window,
    "createTextEditorDecorationType",
    createTextEditorDecorationType,
  );
  sinon.replace(vscodeApi.editor, "setDecorations", setDecorations as any);
  sinon.replace(
    vscodeApi.workspace,
    "getConfiguration",
    sinon.fake.returns({
      get: getConfigurationValue,
    } as unknown as WorkspaceConfiguration),
  );
  return { setDecorations, createTextEditorDecorationType, dispose };
}
