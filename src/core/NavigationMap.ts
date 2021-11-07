import { TextDocument } from "vscode";
import { HatStyleName } from "./constants";
import { Graph, Token } from "../typings/Types";
import { mkdir, stat } from "fs/promises";
import { join } from "path";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export default class NavigationMap {
  activeMap: IndividualNavigationMap;
  mapSnapshot?: IndividualNavigationMap;

  hatMapSnapshotSignalPath: string | null = null;
  lastHatMapSnapshotSignalMtime: number = -1;

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);
    this.activeMap = new IndividualNavigationMap(graph);
  }

  async init() {
    if (this.graph.commandServerApi != null) {
      const cursorlessSubdir =
        this.graph.commandServerApi.getNamedSubdir("cursorless");
      await mkdir(cursorlessSubdir, { recursive: true });
      this.hatMapSnapshotSignalPath = join(
        cursorlessSubdir,
        "hatMapSnapshotSignal"
      );
    }
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
    useSnapshot?: boolean
  ) {
    let individualMap: IndividualNavigationMap;

    if (useSnapshot) {
      if (this.mapSnapshot == null) {
        throw new Error(
          "Navigation map snapshot requested, but no snapshot has been taken"
        );
      }

      individualMap = this.mapSnapshot;
    } else {
      individualMap = this.activeMap;
    }

    return individualMap.getToken(hatStyle, character);
  }

  public clear() {
    this.activeMap.clear();
  }

  public dispose() {
    this.activeMap.dispose();

    if (this.mapSnapshot != null) {
      this.mapSnapshot.dispose();
    }
  }

  async maybeTakeSnapshot() {
    if (this.hatMapSnapshotSignalPath != null) {
      try {
        console.log(this.hatMapSnapshotSignalPath);
        const newMtime = (await stat(this.hatMapSnapshotSignalPath)).mtimeMs;

        if (newMtime > this.lastHatMapSnapshotSignalMtime) {
          console.log("taking snapshot");
          this.takeSnapshot();
          this.lastHatMapSnapshotSignalMtime = newMtime;
        }
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
          throw err;
        }
      }
    }
  }

  private takeSnapshot() {
    if (this.mapSnapshot != null) {
      this.mapSnapshot.dispose();
    }

    this.mapSnapshot = this.activeMap;

    this.activeMap = new IndividualNavigationMap(this.graph);
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

  public getEntries() {
    return Object.entries(this.map);
  }

  public addToken(hatStyle: HatStyleName, character: string, token: Token) {
    this.map[NavigationMap.getKey(hatStyle, character)] = token;
    this.getDocumentTokenList(token.editor.document).push(token);
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
