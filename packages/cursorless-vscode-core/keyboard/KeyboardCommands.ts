import { StatusBarItem } from "../StatusBarItem";
import KeyboardCommandsModal from "./KeyboardCommandsModal";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import KeyboardHandler from "./KeyboardHandler";

export default class KeyboardCommands {
  targeted: KeyboardCommandsTargeted;
  modal: KeyboardCommandsModal;
  keyboardHandler: KeyboardHandler;

  private constructor(statusBarItem: StatusBarItem) {
    this.targeted = new KeyboardCommandsTargeted();
    this.modal = new KeyboardCommandsModal();
    this.keyboardHandler = new KeyboardHandler(statusBarItem);
  }

  static create(statusBarItem: StatusBarItem) {
    const keyboardCommands = new KeyboardCommands(statusBarItem);
    keyboardCommands.init();
    return keyboardCommands;
  }

  private init() {
    this.targeted.init();
    this.modal.init();
    this.keyboardHandler.init();
  }
}
