import * as sinon from "sinon";

export function standardSuiteSetup(suite: Mocha.Suite) {
  suite.timeout("100s");
  suite.retries(5);

  teardown(() => {
    sinon.restore();
  });
}
