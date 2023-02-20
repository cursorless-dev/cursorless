import { MessageId, Messages, MessageType } from "../types/Messages";

/**
 * Displays a warning message {@link message} to the user along with possible
 * {@link options} for them to select.
 *
 * @param id Each code site where we issue a warning should have a unique,
 * human readable id for testability, eg "deprecatedPositionInference". This
 * allows us to write tests without tying ourself to the specific wording of
 * the warning message provided in {@link message}.
 * @param message The message to display to the user
 * @param options A list of options to display to the user. The selected
 * option will be returned by this function
 * @returns The option selected by the user, or `undefined` if no option was
 * selected
 */
export function showWarning(
  messages: Messages,
  id: MessageId,
  message: string,
  ...options: string[]
): Promise<string | undefined> {
  return messages.showMessage(MessageType.warning, id, message, ...options);
}

/**
 * Displays a error message {@link message} to the user along with possible
 * {@link options} for them to select.
 *
 * @param id Each code site where we issue a error should have a unique,
 * human readable id for testability, eg "deprecatedPositionInference". This
 * allows us to write tests without tying ourself to the specific wording of
 * the error message provided in {@link message}.
 * @param message The message to display to the user
 * @param options A list of options to display to the user. The selected
 * option will be returned by this function
 * @returns The option selected by the user, or `undefined` if no option was
 * selected
 */
export function showError(
  messages: Messages,
  id: MessageId,
  message: string,
  ...options: string[]
): Promise<string | undefined> {
  return messages.showMessage(MessageType.error, id, message, ...options);
}

/**
 * Displays an informational message {@link message} to the user along with
 * possible {@link options} for them to select.
 *
 * @param id Each code site where we issue a message should have a unique, human
 * readable id for testability, eg "deprecatedPositionInference". This allows us
 * to write tests without tying ourself to the specific wording of the info
 * message provided in {@link message}.
 * @param message The message to display to the user
 * @param options A list of options to display to the user. The selected option
 * will be returned by this function
 * @returns The option selected by the user, or `undefined` if no option was
 * selected
 */
export function showInfo(
  messages: Messages,
  id: MessageId,
  message: string,
  ...options: string[]
): Promise<string | undefined> {
  return messages.showMessage(MessageType.info, id, message, ...options);
}
