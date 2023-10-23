import {
  ActionDescriptor,
  Direction,
  LATEST_VERSION,
  PartialTargetDescriptor,
  SimpleScopeTypeType,
} from "@cursorless/common";
import { runCursorlessCommand } from "@cursorless/vscode-common";
import * as vscode from "vscode";
import type { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { getStyleName } from "../ide/vscode/hats/getStyleName";
import KeyboardCommandsModal from "./KeyboardVsCodeMode";
import KeyboardHandler from "./KeyboardHandler";


type TargetingMode = "replace" | "extend" | "append";
type TargetModifierTypeArgument = "every" | "interiorOnly" | "excludeInterior";
interface TargetDecoratedMarkArgument {
  color?: HatColor;
  shape?: HatShape;
  character?: string;
  /**
   * Indicates if the current target should be replaced by the given mark, or if
   * we should create a range (using existing target as anchor), or a list.
   */
  mode?: TargetingMode;
}

interface TargetScopeTypeArgument {
  scopeType: SimpleScopeTypeType;
  type?: "containingScope" | "everyScope";
}

/**
 * Defines a set of commands which are designed to work together for designing a
 * keyboard interface. The commands set highlights and allow you to perform
 * actions on highlighted targets.
 */
export default class KeyboardCommandsTargeted {
  private modal!: KeyboardCommandsModal;
  lastTarget: PartialTargetDescriptor;

  constructor(private keyboardHandler: KeyboardHandler) {
    this.targetDecoratedMark = this.targetDecoratedMark.bind(this);
    
    this.targetScopeType = this.targetScopeType.bind(this);
    this.targetSelection = this.targetSelection.bind(this);
    this.clearTarget = this.clearTarget.bind(this);
    this.highlightTarget = this.highlightTarget.bind(this);
    this.lastTarget = {   
      type: "primitive",
      mark: {
        type: "that",
      },
    };
  }

  init(modal: KeyboardCommandsModal) {
    this.modal = modal;
  }

  getMode() {
    return this.modal;
  } 




  /**
   * Sets the highlighted target to the given decorated mark. If {@link character} is
   * omitted, then we wait for the user to press a character
   * @param param0 Describes the desired targeted mark
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetDecoratedMark = async ({
    color = "default",
    shape = "default",
    character,
    mode = "replace",
  }: TargetDecoratedMarkArgument) => {

    // const getCharacter = async (status:string="Which hat?") => {
    //   return await this.keyboardHandler.awaitSingleKeypress({
    //     cursorStyle: vscode.TextEditorCursorStyle.Underline,
    //     whenClauseContext: "cursorless.keyboard.targeted.awaitingHatCharacter",
    //     statusBarText: status,
    //   });
    // }
    // character = await getCharacter();
    

    // if (character == null) {
    //   // Cancelled
    //   return;
    // }
    // if (keymap.getColorKeymap()[character.toLowerCase()] && character === character.toUpperCase()) {
    //   color = keymap.getColorKeymap()[character.toLowerCase()];
    //   character = await getCharacter("Color ${color} selected. Which hat?");
    // }
    // else if (keymap.getShapeKeymap()[character.toLowerCase()] && character === character.toUpperCase()) {
    //   shape = keymap.getShapeKeymap()[character.toLowerCase()];
    //   character = await getCharacter("Shape ${shape} selected. Which hat?");
    // }
    // if (character == null) {
    //   // Cancelled
    //   return;
    // }



    // let target: PartialTargetDescriptor = {
    //   type: "primitive",
    //   mark: {
    //     type: "decoratedSymbol",
    //     symbolColor: getStyleName(color, shape),
    //     character,
    //   },
    // };

    // switch (mode) {
    //   case "extend":
    //     target = {
    //       type: "range",
    //       anchor: {
    //         type: "primitive",
    //         mark: {
    //           type: "that",
    //         },
    //       },
    //       active: target,
    //       excludeActive: false,
    //       excludeAnchor: false,
    //     };
    //     break;
    //   case "append":
    //     target = {
    //       type: "list",
    //       elements: [
    //         {
    //           type: "primitive",
    //           mark: {
    //             type: "that",
    //           },
    //         },
    //         target,
    //       ],
    //     };
    //     break;
    //   case "replace":
    //     break;
    // }

    // return await executeCursorlessCommand({
    //   name: "highlight",
    //   target,
    // });
  };

  /**
   * Expands the current target to the containing {@link scopeType}
   * @param param0 Describes the desired scope type
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetScopeType = async ({
    scopeType,
    type = "containingScope",
  }: TargetScopeTypeArgument) =>
    await executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        modifiers: [
          {
            type,
            scopeType: {
              type: scopeType,
            },
          },
        ],
        mark: {
          type: "that",
        },
      },
    });

  
  targetModifierType = async (mod: TargetModifierTypeArgument) =>
    await executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        modifiers: [
          {
           type: "trailing",
           
          },
        ],
        mark: {
          type: "that",
        },
      },
    });

  highlightTarget = () =>
    executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "that",
        },
      },
    });
    performActionOnTarget = () =>
    executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "that",
        },
      },
    });

  /**
   * Sets the current target to the current selection
   * @returns A promise that resolves to the result of the cursorless command
   */
  targetSelection = () =>
    executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "cursor",
        },
      },
    });

  expandTarget = (direction:Direction) =>

    executeCursorlessCommand({

      name: "highlight",
      target: {
        type: "range",
        anchor: {
          type: "primitive",
          mark: {
            type: "that",
          },
        },
        active: {
          type: "primitive",
          mark: {
            type: "that",
            
          },
          modifiers: [
            {
              type: "relativeScope",
              direction: direction,
              length: 1,
              offset: 1,
              scopeType: {
                type: "token",
              },            
              
            },

          ],
        },
        excludeActive: false,
        excludeAnchor: false,
        

        
      },
    });

  /**
   * Unsets the current target, causing any highlights to disappear
   * @returns A promise that resolves to the result of the cursorless command
   */
  clearTarget = () =>
    executeCursorlessCommand({
      name: "highlight",
      target: {
        type: "primitive",
        mark: {
          type: "nothing",
        },
      },
    });
}

export function executeCursorlessCommand(action: ActionDescriptor) {
  return runCursorlessCommand({
    action,
    version: LATEST_VERSION,
    usePrePhraseSnapshot: false,
  });
}





