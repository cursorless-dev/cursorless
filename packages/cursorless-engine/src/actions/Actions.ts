import type { TreeSitter } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { BreakLine } from "./BreakLine";
import { Bring, Move, Swap } from "./BringMoveSwap";
import Call from "./Call";
import Clear from "./Clear";
import { CopyToClipboard } from "./CopyToClipboard";
import { CutToClipboard } from "./CutToClipboard";
import Deselect from "./Deselect";
import { EditNew } from "./EditNew";
import { EditNewAfter, EditNewBefore } from "./EditNewLineAction";
import ExecuteCommand from "./ExecuteCommand";
import { FindInDocument, FindInWorkspace } from "./Find";
import FollowLink from "./FollowLink";
import GenerateSnippet from "./GenerateSnippet";
import GetTargets from "./GetTargets";
import GetText from "./GetText";
import Highlight from "./Highlight";
import { IndentLine, OutdentLine } from "./IndentLine";
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
import JoinLines from "./JoinLines";
import { PasteFromClipboard } from "./PasteFromClipboard";
import Remove from "./Remove";
import Replace from "./Replace";
import Rewrap from "./Rewrap";
import { ScrollToBottom, ScrollToCenter, ScrollToTop } from "./Scroll";
import {
  AddSelection,
  AddSelectionAfter,
  AddSelectionBefore,
  SetSelection,
  SetSelectionAfter,
  SetSelectionBefore,
} from "./SetSelection";
import { SetSpecialTarget } from "./SetSpecialTarget";
import ShowParseTree from "./ShowParseTree";
import {
  ExtractVariable,
  Fold,
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
import type { ActionRecord } from "./actions.types";
import { Decrement, Increment } from "./incrementDecrement";

/**
 * Keeps a map from action names to objects that implement the given action
 */
export class Actions implements ActionRecord {
  constructor(
    private treeSitter: TreeSitter,
    private snippets: Snippets,
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
  ) {}

  addSelection = new AddSelection();
  addSelectionBefore = new AddSelectionBefore();
  addSelectionAfter = new AddSelectionAfter();
  callAsFunction = new Call(this);
  clearAndSetSelection = new Clear(this);
  copyToClipboard = new CopyToClipboard(this, this.rangeUpdater);
  cutToClipboard = new CutToClipboard(this);
  decrement = new Decrement(this);
  deselect = new Deselect();
  editNew = new EditNew(this.rangeUpdater, this);
  editNewLineAfter: EditNewAfter = new EditNewAfter(
    this,
    this.modifierStageFactory,
  );
  editNewLineBefore: EditNewBefore = new EditNewBefore(
    this,
    this.modifierStageFactory,
  );
  executeCommand = new ExecuteCommand(this.rangeUpdater);
  extractVariable = new ExtractVariable(this.rangeUpdater);
  findInDocument = new FindInDocument(this);
  findInWorkspace = new FindInWorkspace(this);
  foldRegion = new Fold(this.rangeUpdater);
  followLink = new FollowLink({ openAside: false });
  followLinkAside = new FollowLink({ openAside: true });
  generateSnippet = new GenerateSnippet(this.snippets);
  getText = new GetText();
  highlight = new Highlight();
  increment = new Increment(this);
  indentLine = new IndentLine(this.rangeUpdater);
  insertCopyAfter = new InsertCopyAfter(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  insertCopyBefore = new InsertCopyBefore(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  insertEmptyLineAfter = new InsertEmptyLineAfter(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  insertEmptyLineBefore = new InsertEmptyLineBefore(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  insertEmptyLinesAround = new InsertEmptyLinesAround(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  insertSnippet = new InsertSnippet(
    this.rangeUpdater,
    this.snippets,
    this,
    this.modifierStageFactory,
  );
  joinLines = new JoinLines(this.rangeUpdater, this.modifierStageFactory);
  breakLine = new BreakLine(this.rangeUpdater);
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
  ["private.setKeyboardTarget"] = new SetSpecialTarget("keyboard");
  ["experimental.setInstanceReference"] = new SetSpecialTarget(
    "instanceReference",
  );
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
  ["private.showParseTree"] = new ShowParseTree(this.treeSitter);
  ["private.getTargets"] = new GetTargets();
}
