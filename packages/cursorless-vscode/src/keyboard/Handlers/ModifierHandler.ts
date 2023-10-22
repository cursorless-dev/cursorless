import { EveryScopeModifier, Modifier, ScopeType, SimpleScopeType } from "@cursorless/common";
import { Handler } from "../Handler";
import * as vscode from "vscode";
import { SimpleScopeTypeArray } from "./ScopeHandler";

export async function modifyInteriorExterior(
    mode: Handler,
    keySequence: string
): Promise<void> {
    if (keySequence !== "interiorOnly" && keySequence !== "excludeInterior") {
        throw Error(`Unsupported modifier: ${keySequence}`);
    }

    const modifier = {
        type: keySequence as "interiorOnly" | "excludeInterior",
    };
    mode.addModifier(modifier);
}

export async function everyModifier(
    mode: Handler,
    keySequence: string
): Promise<void> {
    if (keySequence !== "everyScope") {
        throw Error(`Unsupported modifier: ${keySequence}`);
    }

    const keyboardHandler = mode.keyboardHandler;
    const getCharacter = async (status: string = "Which hat?") => {
        return await keyboardHandler.awaitSingleKeypress({
            cursorStyle: vscode.TextEditorCursorStyle.Underline,
            whenClauseContext:
                "cursorless.keyboard.targeted.awaitingHatCharacter",
            statusBarText: status,
        });
    };
    const character = await getCharacter();
    if (character == null) {
        // Cancelled
        return;
    }
    const scope = mode.getFirstKeyMatching(character, SimpleScopeTypeArray);
    if (scope === undefined) {
        throw Error(`No scope found for character : ${character}`);
    }
    if (!SimpleScopeTypeArray.includes(scope)) {
        throw Error(`Unsupported scope: ${scope}`);
    }

    const modifier: EveryScopeModifier = {
        type: "everyScope",
        scopeType: {type:scope as SimpleScopeType},
    };
    mode.addModifier(modifier);
}
