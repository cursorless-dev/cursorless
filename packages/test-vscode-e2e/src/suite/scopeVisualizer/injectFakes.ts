import { fake, replace } from "sinon";
import type { DecorationRenderOptions, WorkspaceConfiguration } from "vscode";
import { getTestHelpers } from "@cursorless/lib-vscode-common";
import type { VscodeApi } from "@cursorless/lib-vscode-common";
import { COLOR_CONFIG } from "./colorConfig";
import type {
  Fakes,
  MockDecorationType,
  SetDecorationsParameters,
} from "./scopeVisualizerTest.types";

export async function injectFakes(): Promise<Fakes> {
  const { vscodeApi } = await getTestHelpers();

  const dispose = fake<[number], void>();

  let decorationIndex = 0;
  const createTextEditorDecorationType = fake<
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

  const setDecorations = fake<
    SetDecorationsParameters,
    ReturnType<VscodeApi["editor"]["setDecorations"]>
  >();

  const getConfigurationValue = fake.returns(COLOR_CONFIG);

  replace(
    vscodeApi.window,
    "createTextEditorDecorationType",
    createTextEditorDecorationType as any,
  );
  replace(vscodeApi.editor, "setDecorations", setDecorations as any);
  replace(
    vscodeApi.workspace,
    "getConfiguration",
    fake.returns({
      get: getConfigurationValue,
    } as unknown as WorkspaceConfiguration),
  );

  return { setDecorations, createTextEditorDecorationType, dispose };
}
