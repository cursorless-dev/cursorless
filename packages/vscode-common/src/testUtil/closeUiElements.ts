import { commands } from "vscode";

export async function closeUiElements() {
  // Many times running these tests opens the sidebar, which slows performance. Close it.
  await commands.executeCommand("workbench.action.closeSidebar");
  // Close the find widget as well, since it can also be open and cause performance issues.
  await commands.executeCommand("closeFindWidget");
}
