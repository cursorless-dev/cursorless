import {
  ScopeSupportInfo,
  ScopeSupportLevels
} from "@cursorless/common";
import Sinon = require("sinon");
import { assert } from "chai";

export function assertCalledWithScopeInfo(
  fake: Sinon.SinonSpy<[scopeInfos: ScopeSupportLevels], void>,
  expectedScopeInfo: ScopeSupportInfo
) {
  Sinon.assert.called(fake);
  const actualScopeInfo = fake.lastCall.args[0].find(
    (scopeInfo) => scopeInfo.scopeType.type === expectedScopeInfo.scopeType.type
  );
  assert.isDefined(actualScopeInfo);
  assert.deepEqual(actualScopeInfo, expectedScopeInfo);
  fake.resetHistory();
}
