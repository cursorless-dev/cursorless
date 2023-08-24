import type { VscodeApi } from "@cursorless/vscode-common";
import { getCursorlessApi } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import type { DecorationRenderOptions, WorkspaceConfiguration } from "vscode";
import { COLOR_CONFIG } from "./colorConfig";
import type {
  Fakes,
  MockDecorationType,
  SetDecorationsParameters,
} from "./scopeVisualizerTest.types";

export async function injectFakes(): Promise<Fakes> {
  const { vscodeApi } = (await getCursorlessApi()).testHelpers!;

  const dispose = sinon.fake<[number], void>();

  let decorationIndex = 0;
  const createTextEditorDecorationType = sinon.fake<
    Parameters<VscodeApi["window"]["createTextEditorDecorationType"]>,
    MockDecorationType
  >((_options: DecorationRenderOptions) => {
    const id = decorationIndex++;
    return {
      dispose() {
        dispose(id);
      },
      id,
    };
  });

  const setDecorations = sinon.fake<
    SetDecorationsParameters,
    ReturnType<VscodeApi["editor"]["setDecorations"]>
  >();

  const getConfigurationValue = sinon.fake.returns(COLOR_CONFIG);

  sinon.replace(
    vscodeApi.window,
    "createTextEditorDecorationType",
    createTextEditorDecorationType as any,
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
