import { HatStyleName } from "./constants";
import { Graph } from "../typings/Types";
import { Signal } from "../util/getExtensionApi";
import { IndividualHatMap, ReadOnlyHatMap } from "./IndividualHatMap";
import { HatAllocator } from "./HatAllocator";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export default class NavigationMap {
  private activeMap: IndividualHatMap;
  private mapSnapshot?: IndividualHatMap;

  private phraseStartSignal: Signal | null = null;
  private lastSignalVersion: string | null = null;
  private hatAllocator: HatAllocator;

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);
    this.activeMap = new IndividualHatMap(graph);
    this.phraseStartSignal = graph.commandServerApi?.signals.prePhrase ?? null;

    this.getActiveMap = this.getActiveMap.bind(this);

    this.hatAllocator = new HatAllocator(graph, {
      getActiveMap: this.getActiveMap,
    });
  }

  init() {
    this.hatAllocator.addDecorations();
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

  private async getActiveMap() {
    await this.maybeTakeSnapshot();
    return this.activeMap;
  }

  async getReadableMap(useSnapshot: boolean): Promise<ReadOnlyHatMap> {
    await this.maybeTakeSnapshot();

    if (useSnapshot) {
      if (this.lastSignalVersion == null) {
        console.error(
          "Snapshot requested but no signal was present; please upgrade command client"
        );
        return this.activeMap;
      }

      if (this.mapSnapshot == null) {
        console.error(
          "Navigation map snapshot requested, but no snapshot has been taken"
        );
        return this.activeMap;
      }

      return this.mapSnapshot;
    }

    return this.activeMap;
  }

  public dispose() {
    this.activeMap.dispose();

    if (this.mapSnapshot != null) {
      this.mapSnapshot.dispose();
    }
  }

  private async maybeTakeSnapshot() {
    if (this.phraseStartSignal != null) {
      const newSignalVersion = await this.phraseStartSignal.getVersion();

      if (newSignalVersion !== this.lastSignalVersion) {
        console.debug("taking snapshot");
        this.lastSignalVersion = newSignalVersion;

        if (newSignalVersion != null) {
          this.takeSnapshot();
        }
      }
    }
  }

  private takeSnapshot() {
    if (this.mapSnapshot != null) {
      this.mapSnapshot.dispose();
    }

    this.mapSnapshot = this.activeMap.clone();
  }
}
