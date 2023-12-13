import { VscodeApi, getCursorlessApi } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import { DecorationRenderOptions } from "vscode";
import { COLOR_CONFIG } from "./colorConfig";
import {
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

  const defaultGetConfiguration = vscodeApi.workspace.getConfiguration;

  sinon.replace(
    vscodeApi.window,
    "createTextEditorDecorationType",
    createTextEditorDecorationType as any,
  );
  sinon.replace(vscodeApi.editor, "setDecorations", setDecorations as any);
  sinon.replace(
    vscodeApi.workspace,
    "getConfiguration",
    sinon.fake((configuration) => {
      if (configuration === "cursorless.scopeVisualizer.colors") {
        return COLOR_CONFIG as any;
      }

      return defaultGetConfiguration(configuration);
    }),
  );

  return { setDecorations, createTextEditorDecorationType, dispose };
}
