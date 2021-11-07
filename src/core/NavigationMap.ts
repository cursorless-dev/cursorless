import { TextDocument } from "vscode";
import { HatStyleName } from "./constants";
import { Graph, Token } from "../typings/Types";

interface NavigationMapSnapshot {
  snapshotId: string;
  navigationMap: IndividualNavigationMap;
}

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export default class NavigationMap {
  activeMap: IndividualNavigationMap;
  mapSnapshot?: NavigationMapSnapshot;

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);
    this.activeMap = new IndividualNavigationMap(graph);
  }

  static getKey(hatStyle: HatStyleName, character: string) {
    return `${hatStyle}.${character}`;
  }

  static splitKey(key: string) {
    let [hatStyle, character] = key.split(".");
    if (character.length === 0) {
      // If the character is `.` then it will appear as a zero length string
      // due to the way the split on `.` works
      character = ".";
    }
    return { hatStyle: hatStyle as HatStyleName, character };
  }

  public getEntries() {
    return this.activeMap.getEntries();
  }

  public addToken(hatStyle: HatStyleName, character: string, token: Token) {
    this.activeMap.addToken(hatStyle, character, token);
  }

  public getToken(
    hatStyle: HatStyleName,
    character: string,
    snapshotId?: string
  ) {
    let individualMap: IndividualNavigationMap;

    if (snapshotId == null) {
      individualMap = this.activeMap;
    } else {
      if (snapshotId !== this.mapSnapshot?.snapshotId) {
        console.warn(`Unknown snapshot id ${snapshotId}`);
      }

      if (this.mapSnapshot == null) {
        throw new Error("No snapshot has been taken");
      }

      individualMap = this.mapSnapshot.navigationMap;
    }

    return individualMap.getToken(hatStyle, character);
  }

  public clear() {
    this.activeMap.clear();
  }

  public dispose() {
    this.activeMap.dispose();

    if (this.mapSnapshot != null) {
      this.mapSnapshot.navigationMap.dispose();
    }
  }

  takeSnapshot(snapshotId: string) {
    console.log(`taking snapshot ${snapshotId}`);
    if (this.mapSnapshot != null) {
      this.mapSnapshot.navigationMap.dispose();
    }

    this.mapSnapshot = {
      snapshotId,
      navigationMap: this.activeMap.clone(),
    };
  }
}

class IndividualNavigationMap {
  private documentTokenLists: Map<string, Token[]> = new Map();
  private deregisterFunctions: (() => void)[] = [];

  private map: {
    [decoratedCharacter: string]: Token;
  } = {};

  constructor(private graph: Graph) {}

  private getDocumentTokenList(document: TextDocument) {
    const key = document.uri.toString();
    let currentValue = this.documentTokenLists.get(key);

    if (currentValue == null) {
      currentValue = [];
      this.documentTokenLists.set(key, currentValue);
      this.deregisterFunctions.push(
        this.graph.rangeUpdater.registerRangeInfoList(document, currentValue)
      );
    }

    return currentValue;
  }

  public clone() {
    const ret = new IndividualNavigationMap(this.graph);
    this.getEntries().forEach(([key, token]) => {
      ret.addTokenByKey(key, token);
    });
    return ret;
  }

  public getEntries() {
    return Object.entries(this.map);
  }

  private addTokenByKey(key: string, token: Token) {
    this.map[key] = token;
    this.getDocumentTokenList(token.editor.document).push(token);
  }

  public addToken(hatStyle: HatStyleName, character: string, token: Token) {
    this.addTokenByKey(NavigationMap.getKey(hatStyle, character), token);
  }

  public getToken(hatStyle: HatStyleName, character: string) {
    return this.map[NavigationMap.getKey(hatStyle, character)];
  }

  public clear() {
    this.map = {};
    this.documentTokenLists = new Map();
    this.deregisterFunctions.forEach((func) => func());
  }

  public dispose() {
    this.deregisterFunctions.forEach((func) => func());
  }
}
