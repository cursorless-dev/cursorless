import { ScopeType, ScopeTypeInfo } from "@cursorless/common";
import * as sinon from "sinon";
import { assert } from "chai";
import { sleepWithBackoff } from "../../endToEndTestSetup";
import { isEqual } from "lodash";

async function sleepAndCheck<T>(
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
  check: () => void,
) {
  await sleepWithBackoff(25);
  sinon.assert.called(fake);

  check();

  fake.resetHistory();
}

export function assertCalled<T extends ScopeTypeInfo>(
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
  expectedScopeInfos: T[],
  expectedNotToHaveScopeTypes: ScopeType[],
) {
  return sleepAndCheck(fake, () => {
    assertCalledWith(expectedScopeInfos, fake);
    assertCalledWithout(expectedNotToHaveScopeTypes, fake);
  });
}

export function assertCalledWithScopeInfo<T extends ScopeTypeInfo>(
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
  ...expectedScopeInfos: T[]
) {
  return sleepAndCheck(fake, () => assertCalledWith(expectedScopeInfos, fake));
}

export async function assertCalledWithoutScopeType<T extends ScopeTypeInfo>(
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
  ...scopeTypes: ScopeType[]
) {
  return sleepAndCheck(fake, () => assertCalledWithout(scopeTypes, fake));
}

function assertCalledWith<T extends ScopeTypeInfo>(
  expectedScopeInfos: T[],
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
) {
  for (const expectedScopeInfo of expectedScopeInfos) {
    const actualScopeInfo = fake.lastCall.args[0].find((scopeInfo) =>
      isEqual(scopeInfo.scopeType, expectedScopeInfo.scopeType),
    );
    assert.isDefined(actualScopeInfo);
    assert.deepEqual(actualScopeInfo, expectedScopeInfo);
  }
}

function assertCalledWithout<T extends ScopeTypeInfo>(
  scopeTypes: ScopeType[],
  fake: sinon.SinonSpy<[scopeInfos: T[]], void>,
) {
  for (const scopeType of scopeTypes) {
    assert.isUndefined(
      fake.lastCall.args[0].find((scopeInfo) =>
        isEqual(scopeInfo.scopeType, scopeType),
      ),
    );
  }
}
