import * as vscode from "vscode"; 
import { getStyleName } from "../../ide/vscode/hats/getStyleName";
import { PartialTargetDescriptor } from "@cursorless/common";
import { Handler } from "../Handler";

 
 export  async function targetDecoratedMark (mode: Handler, keySequence:string):Promise<void>  {

    const keymap= mode.keymap;
    const keyboardHandler = mode.keyboardHandler;

    let color = keymap.getColorKeymap()[keySequence.toLowerCase()]??"default";
    let shape = keymap.getShapeKeymap()[keySequence.toLowerCase()]??"default";  

    const getCharacter = async (status:string="Which hat?") => {
      return await keyboardHandler.awaitSingleKeypress({
        cursorStyle: vscode.TextEditorCursorStyle.Underline,
        whenClauseContext: "cursorless.keyboard.targeted.awaitingHatCharacter",
        statusBarText: status,
      });
    }
    let character = await getCharacter();
    

    if (character == null) {
      // Cancelled
      return;
    }
    if (keymap.getColorKeymap()[character.toLowerCase()] && character === character.toUpperCase()) {
      color = keymap.getColorKeymap()[character.toLowerCase()];
      character = await getCharacter("Color ${color} selected. Which hat?");
    }
    else if (keymap.getShapeKeymap()[character.toLowerCase()] && character === character.toUpperCase()) {
      shape = keymap.getShapeKeymap()[character.toLowerCase()];
      character = await getCharacter("Shape ${shape} selected. Which hat?");
    }
    if (character == null) {
      // Cancelled
      return;
    }

    const target: PartialTargetDescriptor = {
      type: "primitive",
      mark: {
        type: "decoratedSymbol",
        symbolColor: getStyleName(color, shape),
        character,
      },
    };

    mode.addTarget(target);
  };