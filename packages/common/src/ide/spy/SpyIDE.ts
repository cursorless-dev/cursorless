import { pickBy, values } from "lodash";
import { GeneralizedRange } from "../../types/GeneralizedRange";
import { TextEditor } from "../../types/TextEditor";
import PassthroughIDEBase from "../PassthroughIDEBase";
import { FlashDescriptor } from "../types/FlashDescriptor";
import type {
  HighlightId,
  IDE,
} from "../types/ide.types";
import type {
  IterationScopeRanges,
  ScopeRanges
} from "../types/IdeScopeVisualizer";
import SpyMessages, { Message } from "./SpyMessages";

interface Highlight {
  highlightId: HighlightId | undefined;
  ranges: GeneralizedRange[];
}

interface ScopeVisualization {
  scopeRanges: ScopeRanges[] | undefined;
  iterationScopeRanges: IterationScopeRanges[] | undefined;
}

export interface SpyIDERecordedValues {
  messages?: Message[];
  flashes?: FlashDescriptor[];
  highlights?: Highlight[];
  scopeVisualizations?: ScopeVisualization[];
}

export default class SpyIDE extends PassthroughIDEBase {
  messages: SpyMessages;
  private flashes: FlashDescriptor[] = [];
  private highlights: Highlight[] = [];
  private scopeVisualizations: ScopeVisualization[] = [];

  constructor(original: IDE) {
    super(original);
    this.messages = new SpyMessages(original.messages);
  }

  getSpyValues(isFlashTest: boolean): SpyIDERecordedValues | undefined {
    const ret: SpyIDERecordedValues = {
      messages: this.messages.getSpyValues(),
      flashes: isFlashTest ? this.flashes : undefined,
      highlights: this.highlights.length === 0 ? undefined : this.highlights,
      scopeVisualizations:
        this.scopeVisualizations.length === 0
          ? undefined
          : this.scopeVisualizations,
    };

    return values(ret).every((value) => value == null)
      ? undefined
      : pickBy(ret, (value) => value != null);
  }

  flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    this.flashes.push(...flashDescriptors);
    return super.flashRanges(flashDescriptors);
  }

  setHighlightRanges(
    highlightId: string | undefined,
    editor: TextEditor,
    ranges: GeneralizedRange[],
  ): Promise<void> {
    this.highlights.push({
      highlightId,
      ranges,
    });
    return super.setHighlightRanges(highlightId, editor, ranges);
  }

  async setScopeVisualizationRanges(
    editor: TextEditor,
    scopeRanges: ScopeRanges[] | undefined,
    iterationScopeRanges: IterationScopeRanges[] | undefined,
  ): Promise<void> {
    this.scopeVisualizations.push({ scopeRanges, iterationScopeRanges });
  }
}
