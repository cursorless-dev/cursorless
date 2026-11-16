/**
 * Maps the keyboard "wrap" / "rewrap" action to the cursorless command that
 * performs it with a paired delimiter.
 *
 * Kept free of `vscode` imports so it can be unit tested outside the extension
 * host.
 *
 * @param actionId The keyboard action identifier, either `wrap` or `rewrap`
 * @returns The command name to run on the target
 */
export function getPairedDelimiterCommandName(
  actionId: "wrap" | "rewrap",
): "wrapWithPairedDelimiter" | "rewrapWithPairedDelimiter" {
  return actionId === "rewrap"
    ? "rewrapWithPairedDelimiter"
    : "wrapWithPairedDelimiter";
}
