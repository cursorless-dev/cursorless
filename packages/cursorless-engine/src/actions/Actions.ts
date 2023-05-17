import { Snippets } from "../core/Snippets";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { Bring, Move, Swap } from "./BringMoveSwap";
import Call from "./Call";
import Clear from "./Clear";
import { CutToClipboard } from "./CutToClipboard";
import Deselect from "./Deselect";
import { EditNew, EditNewAfter, EditNewBefore } from "./EditNew";
import ExecuteCommand from "./ExecuteCommand";
import { FindInWorkspace } from "./Find";
import FollowLink from "./FollowLink";
import GenerateSnippet from "./GenerateSnippet";
import GetText from "./GetText";
import Highlight from "./Highlight";
import {
  CopyContentAfter as InsertCopyAfter,
  CopyContentBefore as InsertCopyBefore,
} from "./InsertCopy";
import {
  InsertEmptyLineBelow as InsertEmptyLineAfter,
  InsertEmptyLineAbove as InsertEmptyLineBefore,
  InsertEmptyLinesAround,
} from "./InsertEmptyLines";
import InsertSnippet from "./InsertSnippet";
import { PasteFromClipboard } from "./PasteFromClipboard";
import Remove from "./Remove";
import Replace from "./Replace";
import Rewrap from "./Rewrap";
import { ScrollToBottom, ScrollToCenter, ScrollToTop } from "./Scroll";
import {
  SetSelection,
  SetSelectionAfter,
  SetSelectionBefore,
} from "./SetSelection";
import {
  CopyToClipboard,
  ExtractVariable,
  Fold,
  IndentLine,
  OutdentLine,
  Rename,
  RevealDefinition,
  RevealTypeDefinition,
  ShowDebugHover,
  ShowHover,
  ShowQuickFix,
  ShowReferences,
  ToggleLineComment,
  Unfold,
} from "./SimpleIdeCommandActions";
import { Random, Reverse, Sort } from "./Sort";
import ToggleBreakpoint from "./ToggleBreakpoint";
import Wrap from "./Wrap";
import WrapWithSnippet from "./WrapWithSnippet";
import { ActionRecord } from "./actions.types";

/**
 * Keeps a map from action names to objects that implement the given action
 */
export class Actions implements ActionRecord {
  constructor(
    private snippets: Snippets,
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
  ) {}

  callAsFunction = new Call(this);
  clearAndSetSelection = new Clear(this);
  copyToClipboard = new CopyToClipboard(this.rangeUpdater);
  cutToClipboard = new CutToClipboard(this);
  deselect = new Deselect();
  editNew = new EditNew(this.rangeUpdater, this, this.modifierStageFactory);
  editNewLineAfter = new EditNewAfter(
    this.rangeUpdater,
    this,
    this.modifierStageFactory,
  );
  editNewLineBefore = new EditNewBefore(
    this.rangeUpdater,
    this,
    this.modifierStageFactory,
  );
  executeCommand = new ExecuteCommand(this.rangeUpdater);
  extractVariable = new ExtractVariable(this.rangeUpdater);
  findInWorkspace = new FindInWorkspace(this);
  foldRegion = new Fold(this.rangeUpdater);
  followLink = new FollowLink(this);
  generateSnippet = new GenerateSnippet();
  getText = new GetText();
  highlight = new Highlight();
  indentLine = new IndentLine(this.rangeUpdater);
  insertCopyAfter = new InsertCopyAfter(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  insertCopyBefore = new InsertCopyBefore(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  insertEmptyLineAfter = new InsertEmptyLineAfter(this.rangeUpdater);
  insertEmptyLineBefore = new InsertEmptyLineBefore(this.rangeUpdater);
  insertEmptyLinesAround = new InsertEmptyLinesAround(this.rangeUpdater);
  insertSnippet = new InsertSnippet(
    this.rangeUpdater,
    this.snippets,
    this,
    this.modifierStageFactory,
  );
  moveToTarget = new Move(this.rangeUpdater);
  outdentLine = new OutdentLine(this.rangeUpdater);
  pasteFromClipboard = new PasteFromClipboard(this.rangeUpdater, this);
  randomizeTargets = new Random(this);
  remove = new Remove(this.rangeUpdater);
  rename = new Rename(this.rangeUpdater);
  replace = new Replace(this.rangeUpdater);
  replaceWithTarget = new Bring(this.rangeUpdater);
  revealDefinition = new RevealDefinition(this.rangeUpdater);
  revealTypeDefinition = new RevealTypeDefinition(this.rangeUpdater);
  reverseTargets = new Reverse(this);
  rewrapWithPairedDelimiter = new Rewrap(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  scrollToBottom = new ScrollToBottom();
  scrollToCenter = new ScrollToCenter();
  scrollToTop = new ScrollToTop();
  setSelection = new SetSelection();
  setSelectionAfter = new SetSelectionAfter();
  setSelectionBefore = new SetSelectionBefore();
  showDebugHover = new ShowDebugHover(this.rangeUpdater);
  showHover = new ShowHover(this.rangeUpdater);
  showQuickFix = new ShowQuickFix(this.rangeUpdater);
  showReferences = new ShowReferences(this.rangeUpdater);
  sortTargets = new Sort(this);
  swapTargets = new Swap(this.rangeUpdater);
  toggleLineBreakpoint = new ToggleBreakpoint(this.modifierStageFactory);
  toggleLineComment = new ToggleLineComment(this.rangeUpdater);
  unfoldRegion = new Unfold(this.rangeUpdater);
  wrapWithPairedDelimiter = new Wrap(this.rangeUpdater);
  wrapWithSnippet = new WrapWithSnippet(
    this.rangeUpdater,
    this.snippets,
    this.modifierStageFactory,
  );
}
