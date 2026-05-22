import { commands } from "vscode";

export async function closeUiElements() {
  // If we're in a snippet, leave it. This is needed or some snippet tests will fail.
  await commands.executeCommand("leaveSnippet");
  // Many times running these tests opens the sidebar, which slows performance. Close it.
  await commands.executeCommand("workbench.action.closeSidebar");
  // Close the find widget as well, since it can also be open and cause performance issues.
  await commands.executeCommand("closeFindWidget");
}
