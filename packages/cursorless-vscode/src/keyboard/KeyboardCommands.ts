import { ExtensionContext } from "vscode";
import KeyboardCommandsModal from "./KeyboardCommandsModal";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import KeyboardHandler from "./KeyboardHandler";
import { StatusBarItem } from "../StatusBarItem";

export class KeyboardCommands {
  targeted: KeyboardCommandsTargeted;
  modal: KeyboardCommandsModal;
  keyboardHandler: KeyboardHandler;

  private constructor(
    private context: ExtensionContext,
    statusBarItem: StatusBarItem,
  ) {
    this.keyboardHandler = new KeyboardHandler(context, statusBarItem);
    this.targeted = new KeyboardCommandsTargeted(this.keyboardHandler);
    this.modal = new KeyboardCommandsModal(
      context,
      this.targeted,
      this.keyboardHandler,
    );
  }

  static create(context: ExtensionContext, statusBarItem: StatusBarItem) {
    const keyboardCommands = new KeyboardCommands(context, statusBarItem);
    keyboardCommands.init();
    return keyboardCommands;
  }

  private init() {
    this.modal.init();
    this.keyboardHandler.init();
    this.targeted.init(this.modal);
  }
}
