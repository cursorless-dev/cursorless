import { assert } from "chai";
import * as sinon from "sinon";
import {
  createDecorationTypeCallToPlainObject,
  setDecorationsCallToPlainObject,
} from "./spyCallsToPlainObject";
import { Fakes, ExpectedArgs } from "./scopeVisualizerTest.types";

export function checkAndResetFakes(fakes: Fakes, expected: ExpectedArgs) {
  const actual = getSpyCallsAndResetFakes(fakes);
  assert.deepStrictEqual(actual, expected, JSON.stringify(actual));
}

function getSpyCallsAndResetFakes({
  createTextEditorDecorationType,
  setDecorations,
  dispose,
}: Fakes) {
  return {
    decorationRenderOptions: getAndResetFake(
      createTextEditorDecorationType,
      createDecorationTypeCallToPlainObject,
    ),
    decorationRanges: getAndResetFake(
      setDecorations,
      setDecorationsCallToPlainObject,
    ),
    disposedDecorationIds: getAndResetFake(dispose, ({ args: [id] }) => id),
  };
}

function getAndResetFake<ArgList extends any[], Return, Expected>(
  spy: sinon.SinonSpy<ArgList, Return>,
  transform: (call: sinon.SinonSpyCall<ArgList, Return>) => Expected,
) {
  const actual = spy.getCalls().map(transform);
  spy.resetHistory();
  return actual;
}
