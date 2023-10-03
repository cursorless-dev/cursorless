
import { ActionType, ModifierType, SimpleScopeTypeType, isTesting } from "@cursorless/common";
import * as vscode from "vscode";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { merge, toPairs } from "lodash";


type SectionName = "actions" | "scopes" | "colors" | "shapes" | "modifiers";
export type SectionKeymap<T> = Record<string, T>;

export const DEFAULT_ACTION_KEYMAP: SectionKeymap<ActionType> = isTesting()
    ? { t: "setSelection" }
    : {};

export const DEFAULT_SCOPE_KEYMAP: SectionKeymap<SimpleScopeTypeType> = isTesting()
    ? { sf: "namedFunction" }
    : {};

export const DEFAULT_COLOR_KEYMAP: SectionKeymap<HatColor> = isTesting()
    ? { d: "default" }
    : {};

export const DEFAULT_SHAPE_KEYMAP: SectionKeymap<HatShape> = isTesting() ? {} : {};

export const DEFAULT_MODIFIER_KEYMAP: SectionKeymap<ModifierType> = isTesting() ? {} : {};


export default class Keymap {

    private actionKeymap: SectionKeymap<ActionType> = {};
    private scopeKeymap: SectionKeymap<SimpleScopeTypeType> = {};
    private colorKeymap: SectionKeymap<HatColor> = {};
    private shapeKeymap: SectionKeymap<HatShape> = {};
    private modifierKeymap: SectionKeymap<ModifierType> = {};

    private handlerMap: Record<string, SectionName> = {};

    constructor() {
        this.loadKeymap();
    }

    public loadKeymap() {
        this.loadSection("actions", DEFAULT_ACTION_KEYMAP);
        this.loadSection("scopes", DEFAULT_SCOPE_KEYMAP);
        this.loadSection("colors", DEFAULT_COLOR_KEYMAP);
        this.loadSection("shapes", DEFAULT_SHAPE_KEYMAP);
        this.loadSection("modifiers", DEFAULT_MODIFIER_KEYMAP);
    }



    private loadSection<T>(sectionName: SectionName, defaultKeyMap: SectionKeymap<T>) {
        const userOverrides: SectionKeymap<T> =
            vscode.workspace
                .getConfiguration("cursorless.experimental.keyboard.modal.keybindings")
                .get<SectionKeymap<T>>(sectionName) ?? {};
        const keyMap = merge({}, defaultKeyMap, userOverrides);

        for (const [key, value] of toPairs(keyMap)) {
            const conflictingEntry = this.getConflictingKeyMapEntry(key);
            if (conflictingEntry != null) {
                vscode.window.showErrorMessage(
                    `Conflicting keybindings: \`${sectionName}.${value}\` and \`${conflictingEntry[0]}.${conflictingEntry[1]}\` both want key '${key}'`,
                );

                continue;
            }
            this.setMap(sectionName,key,value);
        }
    }

    public getMergeKeys():string[]{
        return merge({}, this.actionKeymap, this.scopeKeymap, this.colorKeymap, this.shapeKeymap, this.modifierKeymap).keys();
    }


    public setMap(sectionName:SectionName,key:string,value:any){
        switch (sectionName) {
            case "actions":
                this.actionKeymap[key]=value;
                break;
            case "scopes":
                this.scopeKeymap[key]=value;
                break;
            case "colors":
                this.colorKeymap[key]=value;
                break;
            case "shapes":
                this.shapeKeymap[key]=value;
                break;
            case "modifiers":
                this.modifierKeymap[key]=value;
                break;
        }
    }

    public clearMap(sectionName:SectionName){
        switch (sectionName) {
            case "actions":
                this.actionKeymap={};
                break;
            case "scopes":
                this.scopeKeymap={};
                break;
            case "colors":
                this.colorKeymap={};
                break;
            case "shapes":
                this.shapeKeymap={};
                break;
            case "modifiers":
                this.modifierKeymap={};
                break;
        }
    }
    


        /**
     * This function can be used to detect if a proposed map entry conflicts with
     * one in the map.  Used to detect if the user tries to use two map entries,
     * one of which is a prefix of the other.
     * @param text The proposed new map entry
     * @returns The first map entry that conflicts with {@link text}, if one
     * exists
     */
        getConflictingKeyMapEntry(text: string): [string, string] | undefined {
            const allMap = {
              "actions": this.actionKeymap.keys,
              "scopes": this.scopeKeymap.keys,
              "colors": this.colorKeymap.keys,
              "shapes": this.shapeKeymap.keys,
              "modifiers": this.modifierKeymap.keys,
            };
          
            for (const [sectionName, keyMap] of Object.entries(allMap)) {
              const conflictingPair = Object.entries(keyMap).find(
                ([key]) => text.startsWith(key) || key.startsWith(text)
              );
          
              if (conflictingPair != null) {
                return [sectionName, conflictingPair[0]];
              }
            }
          
            return undefined;
          }



}