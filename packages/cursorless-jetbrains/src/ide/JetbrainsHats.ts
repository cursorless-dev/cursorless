import type {
  Disposable,
  HatRange,
  Hats,
  HatStyleInfo,
  HatStyleMap,
  Listener,
} from "@cursorless/common";
import { Notifier } from "@cursorless/common";
import type { JetbrainsClient } from "./JetbrainsClient";
import type { JetbrainsHatRange } from "../types/jetbrains.types";

const HAT_COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
] as const;

export class JetbrainsHats implements Hats {
  private isEnabledNotifier: Notifier<[boolean]> = new Notifier();
  private hatStyleChangedNotifier: Notifier<[HatStyleMap]> = new Notifier();

  private hatRanges: HatRange[] = [];
  private client: JetbrainsClient;
  enabledHatStyles: HatStyleMap;
  private enabledHatShapes = ["default"];

  constructor(client: JetbrainsClient) {
    this.client = client;
    this.enabledHatStyles = this.generateHatStyles();
  }

  setHatRanges(hatRanges: HatRange[]): Promise<void> {
    console.log("ASOEE/CL: JetbrainsHats.setHatRanges : " + hatRanges.length);

    this.hatRanges = hatRanges;
    const jbHatRanges = this.toJetbransHatRanges(hatRanges);
    const hatsJson = JSON.stringify(jbHatRanges);
    // console.log("ASOEE/CL: JetbrainsHats.setHatRanges json: " + hatsJson);
    this.client.hatsUpdated(hatsJson);
    return Promise.resolve();
  }

  setEnabledHatShapes(enabledHatShapes: string[]): void {
    this.enabledHatShapes = enabledHatShapes;
    this.enabledHatStyles = this.generateHatStyles();
    this.hatStyleChangedNotifier.notifyListeners(this.enabledHatStyles);
  }

  toJetbransHatRanges(hatRanges: HatRange[]): JetbrainsHatRange[] {
    return hatRanges.map((range) => {
      return {
        styleName: range.styleName,
        editorId: range.editor.id,
        range: range.range,
      };
    });
  }

  private generateHatStyles(): HatStyleMap {
    const res = new Map<string, HatStyleInfo>();
    for (const color of HAT_COLORS) {
      const colorPenalty = color === "default" ? 0 : 1;
      for (const shape of this.enabledHatShapes) {
        const shapePenalty = shape === "default" ? 0 : 2;
        let styleName: string;
        if (shape === "default") {
          styleName = color;
        } else {
          styleName = `${color}-${shape}`;
        }
        res.set(styleName, { penalty: colorPenalty + shapePenalty });
      }
    }
    return Object.fromEntries(res);
  }

  onDidChangeEnabledHatStyles(listener: Listener<[HatStyleMap]>): Disposable {
    return this.hatStyleChangedNotifier.registerListener(listener);
  }

  isEnabled: boolean = true;
  onDidChangeIsEnabled(listener: Listener<[boolean]>): Disposable {
    return this.isEnabledNotifier.registerListener(listener);
  }

  toggle(isEnabled?: boolean) {
    this.isEnabled = isEnabled ?? !this.isEnabled;
    this.isEnabledNotifier.notifyListeners(this.isEnabled);
  }
}
