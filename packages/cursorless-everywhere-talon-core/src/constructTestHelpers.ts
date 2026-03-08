import type {
  Command,
  CommandResponse,
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
  type CommandApi,
  type StoredTargetMap,
} from "@cursorless/cursorless-engine";
import type { TalonJsIDE } from "./ide/TalonJsIDE";
import type { TalonJsTestHelpers } from "./types/types";

interface Args {
  talonJsIDE: TalonJsIDE;
  normalizedIde: NormalizedIDE;
  injectIde: (ide: IDE) => void;
  commandApi: CommandApi;
  hatTokenMap: HatTokenMap;
  commandServerApi: FakeCommandServerApi;
  storedTargets: StoredTargetMap;
}

export function constructTestHelpers({
  talonJsIDE,
  normalizedIde,
  injectIde,
  commandApi,
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

    runCommand(command: Command): Promise<CommandResponse | unknown> {
      return commandApi.runCommand(command);
    },

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
