import { Graph } from "../typings/Types";
import KeyboardCommandsTargeted from "./KeyboardCommandsTargeted";
import KeyboardCommandsModal from "./KeyboardCommandsModal";
import KeyboardHandler from "./KeyboardHandler";

export default class KeyboardCommands {
  targeted: KeyboardCommandsTargeted;
  private modal: KeyboardCommandsModal;
  keyboardHandler: KeyboardHandler;

  constructor(graph: Graph) {
    this.targeted = new KeyboardCommandsTargeted(graph);
    this.modal = new KeyboardCommandsModal(graph);
    this.keyboardHandler = new KeyboardHandler(graph);
  }

  init() {
    this.targeted.init();
    this.modal.init();
  }
}
