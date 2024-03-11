const letter = document.querySelector("#letter");
const container = document.querySelector("#container");
const baselineHeight =
  letter.offsetTop +
  letter.offsetHeight -
  container.offsetHeight -
  container.offsetTop;
const vscode = acquireVsCodeApi();
vscode.postMessage({
  widthRatio: letter.offsetWidth / 1000,
  heightRatio: (letter.offsetHeight - baselineHeight) / 1000,
});
