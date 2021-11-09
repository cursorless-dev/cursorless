import { HatStyleName } from "./constants";
import { Graph } from "../typings/Types";
import { Signal } from "../util/getExtensionApi";
import { IndividualHatMap, ReadOnlyHatMap } from "./IndividualHatMap";
import { HatAllocator } from "./HatAllocator";

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export default class HatTokenMap {
  private activeMap: IndividualHatMap;
  private prePhraseMapSnapshot?: IndividualHatMap;

  private lastSignalVersion: string | null = null;
  private hatAllocator: HatAllocator;

  constructor(private graph: Graph) {
    graph.extensionContext.subscriptions.push(this);
    this.activeMap = new IndividualHatMap(graph);

    this.getActiveMap = this.getActiveMap.bind(this);

    this.hatAllocator = new HatAllocator(graph, {
      getActiveMap: this.getActiveMap,
    });
  }

  init() {
    return this.hatAllocator.addDecorations();
  }

  addDecorations() {
    return this.hatAllocator.addDecorations();
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
    await this.maybeTakePrePhraseSnapshot();
    return this.activeMap;
  }

  /**
   * Returns a transient, read-only hat map for use during the course of a
   * single command.
   *
   * Please do not hold onto this copy beyond the lifetime of a single command,
   * because it will get stale.
   * @param usePrePhraseSnapshot Whether to use pre-phrase snapshot
   * @returns A readable snapshot of the map
   */
  async getReadableMap(usePrePhraseSnapshot: boolean): Promise<ReadOnlyHatMap> {
    await this.maybeTakePrePhraseSnapshot();

    if (usePrePhraseSnapshot) {
      if (this.lastSignalVersion == null) {
        console.error(
          "Pre phrase snapshot requested but no signal was present; please upgrade command client"
        );
        return this.activeMap;
      }

      if (this.prePhraseMapSnapshot == null) {
        console.error(
          "Navigation map pre-phrase snapshot requested, but no snapshot has been taken"
        );
        return this.activeMap;
      }

      return this.prePhraseMapSnapshot;
    }

    return this.activeMap;
  }

  public dispose() {
    this.activeMap.dispose();

    if (this.prePhraseMapSnapshot != null) {
      this.prePhraseMapSnapshot.dispose();
    }
  }

  private async maybeTakePrePhraseSnapshot() {
    const phraseStartSignal = this.graph.commandServerApi?.signals.prePhrase;

    if (phraseStartSignal != null) {
      const newSignalVersion = await phraseStartSignal.getVersion();

      if (newSignalVersion !== this.lastSignalVersion) {
        console.debug("taking snapshot");
        this.lastSignalVersion = newSignalVersion;

        if (newSignalVersion != null) {
          this.takePrePhraseSnapshot();
        }
      }
    }
  }

  private takePrePhraseSnapshot() {
    if (this.prePhraseMapSnapshot != null) {
      this.prePhraseMapSnapshot.dispose();
    }

    this.prePhraseMapSnapshot = this.activeMap.clone();
  }
}
