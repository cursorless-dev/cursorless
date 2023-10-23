import { Messages, showInfo } from "@cursorless/common";
import { VscodeApi } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import { ExtendedHatStyleMap } from "../VscodeEnabledHatStyleManager";
import { IndividualHatAdjustmentMap } from "./shapeAdjustments";

/**
 * We set this key in global state the first time they user gets the new shapes from #1868. We use this to
 * determine whether or not to show them messages about resetting their hat adjustments.
 */
export const PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY =
  "performedPr1868ShapeUpdateInit";

/**
 * If this is the first time the user has gotten the new shapes from #1868, we
 * show them a message about resetting their hat adjustments if they have done
 * any customization.
 *
 * We can probably remove this after a while.
 */
export async function performPr1868ShapeUpdateInit(
  extensionContext: vscode.ExtensionContext,
  vscodeApi: VscodeApi,
  messages: Messages,
  hatStyleMap: ExtendedHatStyleMap,
  userSizeAdjustment: number,
  userVerticalOffset: number,
  userIndividualAdjustments: IndividualHatAdjustmentMap,
) {
  if (
    // Only show in focused window
    !vscodeApi.window.state.focused ||
    // Only run on initial update to new hat shapes
    extensionContext.globalState.get<boolean>(
      PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY,
    )
  ) {
    return;
  }

  // Whether or not we end up showing anything, we don't want to show this
  // message after the first time they get the new hats. If they make adjustments
  // in the future, they've done so with the new hats in mind.
  await extensionContext.globalState.update(
    PERFORMED_PR_1868_SHAPE_UPDATE_INIT_KEY,
    true,
  );

  let shownMessage = false;

  // If they have any individual adjustments, we should tell them to reset them
  if (
    Object.values(userIndividualAdjustments)
      .flatMap((entry) => Object.values(entry))
      .some((value) => value != null && value !== 0)
  ) {
    shownMessage = true;
    const PERFORM_RESET = "Perform reset";
    const TAKE_ME_THERE = "Take me there";
    const result = await showInfo(
      messages,
      "maybeUpdateIndividualHatSettings",
      "The hat shapes have been updated; you probably want to reset your individual hat adjustments.",
      PERFORM_RESET,
      TAKE_ME_THERE,
    );

    if (result === TAKE_ME_THERE) {
      await vscode.commands.executeCommand(
        "workbench.action.openSettingsJson",
        {
          revealSetting: { key: "cursorless.individualHatAdjustments" },
        },
      );
    } else if (result === PERFORM_RESET) {
      await vscode.workspace
        .getConfiguration("cursorless")
        .update("individualHatAdjustments", undefined, true);
    }
  }

  // If they have any global adjustments, they may want to tweak them
  if (
    (userSizeAdjustment !== 0 || userVerticalOffset !== 0) &&
    // Don't bother if they have no shapes enabled, as the default shape
    // is similar enough in size / offset to the old default shape
    hasAnyShapesEnabled(hatStyleMap)
  ) {
    const TAKE_ME_THERE = "Take me there";
    const message = shownMessage
      ? "You may also want to tweak your global hat settings."
      : "The hat shapes have been updated; you may want to tweak your hat settings.";

    const result = await showInfo(
      messages,
      "maybeUpdateGlobalHatSettings",
      message,
      TAKE_ME_THERE,
    );

    if (result === TAKE_ME_THERE) {
      await vscode.commands.executeCommand(
        "workbench.action.openSettings",
        `@ext:${extensionContext.extension.id}`,
      );
    }
  }
}

function hasAnyShapesEnabled(hatStyleMap: ExtendedHatStyleMap) {
  // A bit of a hack, but if they have any shapes enabled, they'll have keys
  // like `blue-fox`, which contain a `-`. If they don't have any shapes
  // enabled, they'll only have keys like `blue`, `default, etc.
  return Object.keys(hatStyleMap).some((key) => key.includes("-"));
}
