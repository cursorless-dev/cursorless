import { FakeIDE, NormalizedIDE } from "@cursorless/common";
import {
  createCursorlessEngine,
  type CommandApi,
} from "@cursorless/cursorless-engine";
import { Context } from "talon";
import { TalonJsIDE } from "./ide/TalonJsIDE";

async function activate(): Promise<void> {
  const talonJsIDE = new TalonJsIDE();

  const normalizedIde =
    talonJsIDE.runMode === "production"
      ? talonJsIDE
      : new NormalizedIDE(
          talonJsIDE,
          new FakeIDE(),
          talonJsIDE.runMode === "test",
        );

  const { commandApi } = await createCursorlessEngine({ ide: normalizedIde });

  registerCommands(talonJsIDE, commandApi);
}

function registerCommands(talonJsIDE: TalonJsIDE, commandApi: CommandApi) {
  const ctx = new Context();

  ctx.action_class("user", {
    cursorless_js_run_command(...args: unknown[]) {
      print("cursorless_js_run_command");
      print(args);
      talonJsIDE.updateTextEditor();
      return commandApi.runCommandSafe(...args);
    },
  });
}

print("activate talon.js");

void activate();
