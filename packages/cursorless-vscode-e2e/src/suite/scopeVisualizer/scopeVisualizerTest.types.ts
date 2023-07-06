import { RangePlainObject } from "@cursorless/common";
import { Vscode } from "@cursorless/vscode-common";
import * as sinon from "sinon";
import * as vscode from "vscode";

export interface MockDecorationType {
  dispose(): void;
  id: number;
}

export type SetDecorationsParameters = [
  editor: vscode.TextEditor,
  decorationType: MockDecorationType,
  ranges: readonly vscode.Range[],
];

export interface Fakes {
  setDecorations: sinon.SinonSpy<
    SetDecorationsParameters,
    ReturnType<Vscode["editor"]["setDecorations"]>
  >;
  createTextEditorDecorationType: sinon.SinonSpy<
    Parameters<Vscode["window"]["createTextEditorDecorationType"]>,
    MockDecorationType
  >;
  dispose: sinon.SinonSpy<[number], void>;
}

export interface ExpectedArgs {
  decorationRenderOptions: DecorationRenderOptionsPlainObject[];
  decorationRanges: DecorationRangesPlainObject[];
  disposedDecorationIds: number[];
}

export interface DecorationRangesPlainObject {
  decorationId: number;
  ranges: RangePlainObject[];
}

export interface DecorationRenderOptionsPlainObject {
  backgroundColor: string | undefined;
  borderColor: string | undefined;
  borderStyle: string | undefined;
  borderRadius: string | undefined;
  isWholeLine: boolean;
  id: number;
}
