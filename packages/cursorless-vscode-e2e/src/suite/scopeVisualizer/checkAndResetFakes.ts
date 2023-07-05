import { assert } from "chai";
import * as sinon from "sinon";
import {
  decorationRenderOptionsToPlainObject,
  setDecorationsArgsToPlainObject,
} from "./toPlainObject";
import { Fakes, ExpectedArgs } from "./scopeVisualizerTest.types";

export function checkAndResetFakes(
  { createTextEditorDecorationType, setDecorations, dispose }: Fakes,
  expected: ExpectedArgs,
) {
  const actual = {
    decorationRenderOptions: getAndResetFake(
      createTextEditorDecorationType,
      decorationRenderOptionsToPlainObject,
    ),
    decorationRanges: getAndResetFake(
      setDecorations,
      setDecorationsArgsToPlainObject,
    ),
    disposedDecorationIds: getAndResetFake(dispose, (id) => id),
  };
  assert.deepStrictEqual(actual, expected, JSON.stringify(actual));
}

function getAndResetFake<ArgList extends any[], Return, Expected>(
  spy: sinon.SinonSpy<ArgList, Return>,
  transform: (...arg: ArgList) => Expected,
) {
  const actual = spy.args.map((args) => transform(...args));
  spy.resetHistory();
  return actual;
}
