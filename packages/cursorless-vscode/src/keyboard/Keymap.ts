
import { ActionType, ModifierType, SimpleScopeTypeType, isTesting } from "@cursorless/common";
import * as vscode from "vscode";
import { HatColor, HatShape } from "../ide/vscode/hatStyles.types";
import { merge, toPairs } from "lodash";



type SectionName = "actions" | "scopes" | "colors" | "shapes" | "modifiers" | "keyboardActions";
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
    private keyboardActions: SectionKeymap<string> = {};


    private handlerMap: Record<string, SectionName> = {};

    constructor() {
        this.clearAllMaps.bind(this);
        this.loadKeymap.bind(this);
        this.loadSection.bind(this);
        this.getMergeKeys.bind(this);
        this.setMap.bind(this);
        this.clearMap.bind(this);
        this.getConflictingKeyMapEntry.bind(this);
        this.loadKeymap();
    }


    public loadKeymap() {
        this.clearAllMaps();
        this.loadSection("actions", DEFAULT_ACTION_KEYMAP);
        this.loadSection("scopes", DEFAULT_SCOPE_KEYMAP);
        this.loadSection("colors", DEFAULT_COLOR_KEYMAP);
        this.loadSection("shapes", DEFAULT_SHAPE_KEYMAP);
        this.loadSection("modifiers", DEFAULT_MODIFIER_KEYMAP);
    }
    clearAllMaps() {
        this.clearMap("actions");
        this.clearMap("scopes");
        this.clearMap("colors");
        this.clearMap("shapes");
        this.clearMap("modifiers");
    }

    public getSectionAndCommand(key: string): [SectionName, any]  {

        if (this.actionKeymap[key] != null) {
            return ["actions", this.actionKeymap[key]];
        }
        if (this.scopeKeymap[key] != null) {
            return ["scopes", this.scopeKeymap[key]];
        }
        if (this.colorKeymap[key] != null) {
            return ["colors", this.colorKeymap[key]];
        }
        if (this.shapeKeymap[key] != null) {
            return ["shapes", this.shapeKeymap[key]];
        }
        if (this.modifierKeymap[key] != null) {
            return ["modifiers", this.modifierKeymap[key]];
        }
        if (this.keyboardActions[key] != null) {
            return ["actions", this.keyboardActions[key]];
        }
        // TODO How to log this?
        return ["actions", undefined];
        

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
        return Object.keys(merge( {},this.actionKeymap, this.scopeKeymap, this.colorKeymap, this.shapeKeymap, this.modifierKeymap,this.keyboardActions)) as string[];
    }

    public isPrefixOfMapEntry(text:string):boolean{
        return this.getMergeKeys().some((key)=>key.startsWith(text));
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
            case "keyboardActions":
                this.keyboardActions[key]=value;
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
            case "keyboardActions":
                this.keyboardActions={};
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
              "actions": this.actionKeymap,
              "scopes": this.scopeKeymap,
              "colors": this.colorKeymap,
              "shapes": this.shapeKeymap,
              "modifiers": this.modifierKeymap,
                "keyboardActions": this.keyboardActions,
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

    public getActionKeymap(): SectionKeymap<ActionType> {
        return this.actionKeymap;
    }

    public getScopeKeymap(): SectionKeymap<SimpleScopeTypeType> {
        return this.scopeKeymap;
    }

    public getColorKeymap(): SectionKeymap<HatColor> {
        return this.colorKeymap;
    }

    public getShapeKeymap(): SectionKeymap<HatShape> {
        return this.shapeKeymap;
    }

    public getModifierKeymap(): SectionKeymap<ModifierType> {
        return this.modifierKeymap;
    }

    

}