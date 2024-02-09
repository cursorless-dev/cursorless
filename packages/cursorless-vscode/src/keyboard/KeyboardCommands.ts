import { ExtensionContext } from "vscode";
import KeyboardCommandsModal from "./KeyboardCommandsModal";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import KeyboardHandler from "./KeyboardHandler";
import { StatusBarItem } from "../StatusBarItem";
import { VscodeApi } from "@cursorless/vscode-common";

export class KeyboardCommands {
  targeted: KeyboardCommandsTargeted;
  modal: KeyboardCommandsModal;
  keyboardHandler: KeyboardHandler;

  private constructor(
    context: ExtensionContext,
    vscodeApi: VscodeApi,
    statusBarItem: StatusBarItem,
  ) {
    this.keyboardHandler = new KeyboardHandler(context, statusBarItem);
    this.targeted = new KeyboardCommandsTargeted(this.keyboardHandler);
    this.modal = new KeyboardCommandsModal(
      context,
      this.targeted,
      this.keyboardHandler,
      vscodeApi,
    );
  }

  static create(
    context: ExtensionContext,
    vscodeApi: VscodeApi,
    statusBarItem: StatusBarItem,
  ) {
    const keyboardCommands = new KeyboardCommands(
      context,
      vscodeApi,
      statusBarItem,
    );
    keyboardCommands.init();
    return keyboardCommands;
  }

  private init() {
    this.modal.init();
    this.keyboardHandler.init();
    this.targeted.init(this.modal);
  }
}
