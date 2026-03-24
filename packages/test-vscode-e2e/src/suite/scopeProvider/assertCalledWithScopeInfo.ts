import { type ScopeType, type ScopeTypeInfo } from "@cursorless/lib-common";
import { isEqual } from "lodash-es";
import * as assert from "node:assert/strict";
import type { SinonSpy } from "sinon";
import { waitFor } from "../waitFor";

export async function assertCalledWithScopeInfo<T extends ScopeTypeInfo>(
  fake: SinonSpy<[scopeInfos: T[]], void>,
  ...expectedScopeInfos: T[]
) {
  const scopeInfos = await waitForScopeInfos(fake, (scopeInfos) =>
    expectedScopeInfos.every((expectedScopeInfo) => {
      const actualScopeInfo = scopeInfos.find((scopeInfo) =>
        isEqual(scopeInfo.scopeType, expectedScopeInfo.scopeType),
      );

      return (
        actualScopeInfo != null && isEqual(actualScopeInfo, expectedScopeInfo)
      );
    }),
  );

  for (const expectedScopeInfo of expectedScopeInfos) {
    const actualScopeInfo = scopeInfos.find((scopeInfo) =>
      isEqual(scopeInfo.scopeType, expectedScopeInfo.scopeType),
    );
    assert.ok(actualScopeInfo != null);
    assert.deepEqual(actualScopeInfo, expectedScopeInfo);
  }

  fake.resetHistory();
}

export async function assertCalledWithoutScopeInfo<T extends ScopeTypeInfo>(
  fake: SinonSpy<[scopeInfos: T[]], void>,
  ...scopeTypes: ScopeType[]
) {
  const scopeInfos = await waitForScopeInfos(fake, (scopeInfos) =>
    scopeTypes.every(
      (scopeType) =>
        scopeInfos.find((scopeInfo) =>
          isEqual(scopeInfo.scopeType, scopeType),
        ) == null,
    ),
  );

  for (const scopeType of scopeTypes) {
    assert.equal(
      scopeInfos.find((scopeInfo) => isEqual(scopeInfo.scopeType, scopeType)),
      undefined,
    );
  }

  fake.resetHistory();
}

async function waitForScopeInfos<T extends ScopeTypeInfo>(
  fake: SinonSpy<[scopeInfos: T[]], void>,
  predicate: (scopeInfos: T[]) => boolean,
): Promise<T[]> {
  const success = await waitFor(
    () => fake.called && predicate(fake.lastCall.args[0]),
  );
  if (success) {
    return fake.lastCall.args[0];
  }
  assert.fail("Timed out waiting for expected scope info");
}
