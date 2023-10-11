import { ScopeType, ScopeTypeInfo } from "@cursorless/common";
import Sinon = require("sinon");
import { assert } from "chai";
import { sleepWithBackoff } from "../../endToEndTestSetup";
import { isEqual } from "lodash";

export async function assertCalledWithScopeInfo<T extends ScopeTypeInfo>(
  fake: Sinon.SinonSpy<[scopeInfos: T[]], void>,
  expectedScopeInfo: T,
) {
  await sleepWithBackoff(25);
  Sinon.assert.called(fake);
  const actualScopeInfo = fake.lastCall.args[0].find((scopeInfo) =>
    isEqual(scopeInfo.scopeType, expectedScopeInfo.scopeType),
  );
  assert.isDefined(actualScopeInfo);
  assert.deepEqual(actualScopeInfo, expectedScopeInfo);
  fake.resetHistory();
}

export async function assertCalledWithoutScopeInfo<T extends ScopeTypeInfo>(
  fake: Sinon.SinonSpy<[scopeInfos: T[]], void>,
  scopeType: ScopeType,
) {
  await sleepWithBackoff(25);
  Sinon.assert.called(fake);
  const actualScopeInfo = fake.lastCall.args[0].find((scopeInfo) =>
    isEqual(scopeInfo.scopeType, scopeType),
  );
  assert.isUndefined(actualScopeInfo);
  fake.resetHistory();
}
