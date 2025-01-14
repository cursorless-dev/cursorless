import type { ScopeType, ScopeTypeInfo } from "@cursorless/common";
import * as sinon from "sinon";
import { assert } from "chai";
import { sleepWithBackoff } from "../../endToEndTestSetup";
import { isEqual } from "lodash-es";

export async function assertCalledWithScopeInfo<T extends ScopeTypeInfo>(
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
  ...expectedScopeInfos: T[]
) {
  await sleepWithBackoff(100);
  sinon.assert.called(fake);

  for (const expectedScopeInfo of expectedScopeInfos) {
    const actualScopeInfo = fake.lastCall.args[0].find((scopeInfo) =>
      isEqual(scopeInfo.scopeType, expectedScopeInfo.scopeType),
    );
    assert.isDefined(actualScopeInfo);
    assert.deepEqual(actualScopeInfo, expectedScopeInfo);
  }

  fake.resetHistory();
}

export async function assertCalledWithoutScopeInfo<T extends ScopeTypeInfo>(
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
  ...scopeTypes: ScopeType[]
) {
  await sleepWithBackoff(100);
  sinon.assert.called(fake);

  for (const scopeType of scopeTypes) {
    assert.isUndefined(
      fake.lastCall.args[0].find((scopeInfo) =>
        isEqual(scopeInfo.scopeType, scopeType),
      ),
    );
  }

  fake.resetHistory();
}
