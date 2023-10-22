import * as vscode from "vscode"; 
import { getStyleName } from "../../ide/vscode/hats/getStyleName";
import { PartialTargetDescriptor } from "@cursorless/common";
import { Handler } from "../Handler";
import { HAT_COLORS, HAT_NON_DEFAULT_SHAPES, HatColor, HatNonDefaultShape, HatShape } from "../../ide/vscode/hatStyles.types";

 
 export  async function targetDecoratedMark (mode: Handler, keySequence:string):Promise<void>  {

    
    const keyboardHandler = mode.keyboardHandler;

    let color: HatColor = "default";
    if ( HAT_COLORS.includes(keySequence as HatColor)){
      color = keySequence as HatColor;
    }

    let shape: HatShape = "default";
    if ( HAT_NON_DEFAULT_SHAPES.includes(keySequence as HatNonDefaultShape)){
      shape = keySequence as HatShape;
    }

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

    if ( character === character.toUpperCase()){
      const pickedColor = mode.getFirstKeyMatching(character, HAT_COLORS);
      if ( pickedColor !== undefined){
        color = pickedColor as HatColor;
      }
      const pickedShape = mode.getFirstKeyMatching(character, HAT_NON_DEFAULT_SHAPES);
      if ( pickedShape !== undefined){
        shape = pickedShape as HatShape;
      }
      if ( pickedColor !== undefined || pickedShape !== undefined){
        character = await getCharacter(`${color} ${shape} ___?`);
      }
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