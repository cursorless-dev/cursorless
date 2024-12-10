import type {
  Disposable,
  HatRange,
  Hats,
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
  private hatRanges: HatRange[] = [];
  private client: JetbrainsClient;

  constructor(client: JetbrainsClient) {
    this.client = client;
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

  toJetbransHatRanges(hatRanges: HatRange[]): JetbrainsHatRange[] {
    return hatRanges.map((range) => {
      return {
        styleName: range.styleName,
        editorId: range.editor.id,
        range: range.range,
      };
    });
  }

  enabledHatStyles: HatStyleMap = Object.fromEntries(
    HAT_COLORS.map((color) => [
      color,
      { penalty: color === "default" ? 0 : 1 },
    ]),
  );

  onDidChangeEnabledHatStyles(_listener: Listener<[HatStyleMap]>): Disposable {
    return { dispose: () => {} };
  }

  isEnabled: boolean = true;
  onDidChangeIsEnabled(_listener: Listener<[boolean]>): Disposable {
    return { dispose: () => {} };
  }

  toggle(isEnabled?: boolean) {
    this.isEnabled = isEnabled ?? !this.isEnabled;
    this.isEnabledNotifier.notifyListeners(this.isEnabled);
  }
}
