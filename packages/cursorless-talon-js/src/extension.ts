import { FakeIDE, NormalizedIDE } from "@cursorless/common";
// import {
//   createCursorlessEngine,
//   type CommandApi,
// } from "@cursorless/cursorless-engine";
import { TalonJsIDE } from "./ide/TalonJsIDE";

async function activate(): Promise<void> {
  const talonJsIDE = new TalonJsIDE();

  const normalizedIde2 =
    talonJsIDE.runMode === "production"
      ? talonJsIDE
      : new NormalizedIDE(
          talonJsIDE,
          new FakeIDE(),
          talonJsIDE.runMode === "test",
          "",
        );

  //   const { commandApi } = await createCursorlessEngine({ ide: normalizedIde });

  //   registerCommands(talonJsIDE, commandApi);
}

// function registerCommands(talonJsIDE: TalonJsIDE, commandApi: CommandApi) {
//   const ctx = new Context();

//   ctx.matches = "not tag: user.cursorless";

//   ctx.action_class("user", {
//     private_cursorless_command_no_wait(action: unknown): void {
//       print("private_cursorless_command_no_wait");
//       throw Error(`private_cursorless_command_no_wait not implemented.`);
//     },
//     private_cursorless_command_and_wait(action: unknown): Promise<void> {
//       print("private_cursorless_command_and_wait");
//       throw Error(`private_cursorless_command_and_wait not implemented.`);
//     },
//     private_cursorless_command_get(action: unknown): Promise<unknown> {
//       print("private_cursorless_command_get");
//       throw Error(`private_cursorless_command_get not implemented.`);
//     },

//     // cursorless_js_run_command(...args: unknown[]) {
//     //   print("cursorless_js_run_command");
//     //   print(args);
//     //   talonJsIDE.updateTextEditor();
//     //   return commandApi.runCommandSafe(...args);
//     // },
//   });
// }

print("activate talon.js");

void activate();
