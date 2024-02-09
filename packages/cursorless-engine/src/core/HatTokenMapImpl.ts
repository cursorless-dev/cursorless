import {
  CommandServerApi,
  HatTokenMap,
  Hats,
  ReadOnlyHatMap,
  TokenHat,
} from "@cursorless/common";
import { hrtime } from "process";
import { ide } from "../singletons/ide.singleton";
import { abs } from "../util/bigint";
import { Debug } from "./Debug";
import { HatAllocator } from "./HatAllocator";
import { IndividualHatMap } from "./IndividualHatMap";
import { RangeUpdater } from "./updateSelections/RangeUpdater";

/**
 * Maximum age for the pre-phrase snapshot before we consider it to be stale
 */
const PRE_PHRASE_SNAPSHOT_MAX_AGE_NS = BigInt(6e10); // 60 seconds

/**
 * Maps from (hatStyle, character) pairs to tokens
 */
export class HatTokenMapImpl implements HatTokenMap {
  /**
   * This is the active map that changes every time we reallocate hats. It is
   * liable to change in the middle of a phrase.
   */
  private activeMap: IndividualHatMap;

  /**
   * This is a snapshot of the hat map that remains stable over the course of a
   * phrase. Ranges will be updated to account for changes to the document, but a
   * hat with the same color and shape will refer to the same logical range.
   */
  private prePhraseMapSnapshot?: IndividualHatMap;
  private prePhraseMapsSnapshotTimestamp: bigint | null = null;

  private lastSignalVersion: string | null = null;
  private hatAllocator: HatAllocator;

  constructor(
    rangeUpdater: RangeUpdater,
    private debug: Debug,
    hats: Hats,
    private commandServerApi: CommandServerApi | null,
  ) {
    ide().disposeOnExit(this);
    this.activeMap = new IndividualHatMap(rangeUpdater);

    this.getActiveMap = this.getActiveMap.bind(this);
    this.allocateHats = this.allocateHats.bind(this);

    this.hatAllocator = new HatAllocator(hats, {
      getActiveMap: this.getActiveMap,
    });
  }

  /**
   * Allocate hats to the visible tokens.
   *
   * @param oldTokenHats If supplied, pretend that this allocation was the
   * previous allocation when trying to maintain stable hats.  This parameter is
   * used for testing.
   */
  allocateHats(oldTokenHats?: TokenHat[]) {
    return this.hatAllocator.allocateHats(oldTokenHats);
  }

  private async getActiveMap() {
    // NB: We need to take a snapshot of the hat map before we make any
    // modifications if it is the beginning of the phrase
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
    // NB: Take a snapshot before we return the map if it is the beginning of
    // the phrase so all commands will get the same map over the course of the
    // phrase
    await this.maybeTakePrePhraseSnapshot();

    if (usePrePhraseSnapshot) {
      if (this.lastSignalVersion == null) {
        console.error(
          "Pre phrase snapshot requested but no signal was present; please upgrade command client",
        );
        return this.activeMap;
      }

      if (this.prePhraseMapSnapshot == null) {
        console.error(
          "Navigation map pre-phrase snapshot requested, but no snapshot has been taken",
        );
        return this.activeMap;
      }

      if (
        abs(hrtime.bigint() - this.prePhraseMapsSnapshotTimestamp!) >
        PRE_PHRASE_SNAPSHOT_MAX_AGE_NS
      ) {
        console.error(
          "Navigation map pre-phrase snapshot requested, but snapshot is more than a minute old",
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
    const phraseStartSignal = this.commandServerApi?.signals?.prePhrase;

    if (phraseStartSignal != null) {
      const newSignalVersion = await phraseStartSignal.getVersion();

      if (newSignalVersion !== this.lastSignalVersion) {
        this.debug.log("taking snapshot");
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
    this.prePhraseMapsSnapshotTimestamp = hrtime.bigint();
  }
}
