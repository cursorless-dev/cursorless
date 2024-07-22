import type {
  FakeCommandServerApi,
  HatTokenMap,
  IDE,
  NormalizedIDE,
  StoredTargetKey,
  TargetPlainObject,
  TextEditor,
} from "@cursorless/common";
import {
  plainObjectToTarget,
  type StoredTargetMap,
} from "@cursorless/cursorless-engine";
import type { TalonJsIDE } from "./ide/TalonJsIDE";
import type { TalonJsTestHelpers } from "./types/types";

interface Args {
  talonJsIDE: TalonJsIDE;
  normalizedIde: NormalizedIDE;
  injectIde: (ide: IDE) => void;
  hatTokenMap: HatTokenMap;
  commandServerApi: FakeCommandServerApi;
  storedTargets: StoredTargetMap;
}

export function constructTestHelpers({
  talonJsIDE,
  normalizedIde,
  injectIde,
  hatTokenMap,
  commandServerApi,
  storedTargets,
}: Args): TalonJsTestHelpers {
  return {
    talonJsIDE,
    ide: normalizedIde,
    commandServerApi,
    hatTokenMap,
    storedTargets,
    injectIde,

    setStoredTarget(
      editor: TextEditor,
      key: StoredTargetKey,
      targets: TargetPlainObject[] | undefined,
    ): void {
      storedTargets.set(
        key,
        targets?.map((target) => plainObjectToTarget(editor, target)),
      );
    },
  };
}
