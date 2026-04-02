/* global window, document, acquireVsCodeApi */

const vscode = acquireVsCodeApi();
const msgTalon = document.querySelector("#msg-talon");
const msgCursorlessTalon = document.querySelector("#msg-cursorless-talon");
const msgCommandServer = document.querySelector("#msg-command-server");
const msgAllInstalled = document.querySelector("#msg-all-installed");
const inputDontShow = document.querySelector("#input-dont-show");

inputDontShow.addEventListener("change", (e) => {
  const command = { type: "dontShow", checked: e.target.checked };
  vscode.postMessage(command);
});

window.addEventListener("message", (event) => {
  const { dontShow, hasMissingDependencies, dependencies } = event.data;

  hide(msgTalon, dependencies.talon);
  // No need to show missing Cursorless Talon if Talon itself is missing
  hide(msgCursorlessTalon, dependencies.cursorlessTalon || !dependencies.talon);
  hide(msgCommandServer, dependencies.commandServer);
  hide(msgAllInstalled, hasMissingDependencies);
  inputDontShow.checked = dontShow;
});

function hide(element, doHide) {
  element.className = doHide ? "hide" : "";
}
