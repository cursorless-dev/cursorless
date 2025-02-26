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
import { FlashTargets } from "./FlashTargets";
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
  GitAccept,
  GitRevert,
  GitStage,
  GitUnstage,
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
  ) {
  this.addSelection = new AddSelection();
  this.addSelectionBefore = new AddSelectionBefore();
  this.addSelectionAfter = new AddSelectionAfter();
  this.callAsFunction = new Call(this);
  this.clearAndSetSelection = new Clear(this);
  this.copyToClipboard = new CopyToClipboard(this, this.rangeUpdater);
  this.cutToClipboard = new CutToClipboard(this);
  this.decrement = new Decrement(this);
  this.deselect = new Deselect();
  this.editNew = new EditNew(this.rangeUpdater, this);
  this.editNewLineAfter = new EditNewAfter(
    this,
    this.modifierStageFactory,
  );
  this.editNewLineBefore = new EditNewBefore(
    this,
    this.modifierStageFactory,
  );
  this.executeCommand = new ExecuteCommand(this.rangeUpdater);
  this.extractVariable = new ExtractVariable(this.rangeUpdater);
  this.findInDocument = new FindInDocument(this);
  this.findInWorkspace = new FindInWorkspace(this);
  this.flashTargets = new FlashTargets();
  this.foldRegion = new Fold(this.rangeUpdater);
  this.followLink = new FollowLink({ openAside: false });
  this.followLinkAside = new FollowLink({ openAside: true });
  this.generateSnippet = new GenerateSnippet(this.snippets);
  this.getText = new GetText();
  this.gitAccept = new GitAccept(this.rangeUpdater);
  this.gitRevert = new GitRevert(this.rangeUpdater);
  this.gitStage = new GitStage(this.rangeUpdater);
  this.gitUnstage = new GitUnstage(this.rangeUpdater);
  this.highlight = new Highlight();
  this.increment = new Increment(this);
  this.indentLine = new IndentLine(this.rangeUpdater);
  this.insertCopyAfter = new InsertCopyAfter(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  this.insertCopyBefore = new InsertCopyBefore(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  this.insertEmptyLineAfter = new InsertEmptyLineAfter(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  this.insertEmptyLineBefore = new InsertEmptyLineBefore(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  this.insertEmptyLinesAround = new InsertEmptyLinesAround(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  this.insertSnippet = new InsertSnippet(
    this.rangeUpdater,
    this.snippets,
    this,
    this.modifierStageFactory,
  );
  this.joinLines = new JoinLines(this.rangeUpdater, this.modifierStageFactory);
  this.breakLine = new BreakLine(this.rangeUpdater);
  this.moveToTarget = new Move(this.rangeUpdater);
  this.outdentLine = new OutdentLine(this.rangeUpdater);
  this.pasteFromClipboard = new PasteFromClipboard(this.rangeUpdater, this);
  this.randomizeTargets = new Random(this);
  this.remove = new Remove(this.rangeUpdater);
  this.rename = new Rename(this.rangeUpdater);
  this.replace = new Replace(this.rangeUpdater);
  this.replaceWithTarget = new Bring(this.rangeUpdater);
  this.revealDefinition = new RevealDefinition(this.rangeUpdater);
  this.revealTypeDefinition = new RevealTypeDefinition(this.rangeUpdater);
  this.reverseTargets = new Reverse(this);
  this.rewrapWithPairedDelimiter = new Rewrap(
    this.rangeUpdater,
    this.modifierStageFactory,
  );
  this.scrollToBottom = new ScrollToBottom();
  this.scrollToCenter = new ScrollToCenter();
  this.scrollToTop = new ScrollToTop();
  this.setSelection = new SetSelection();
  this.setSelectionAfter = new SetSelectionAfter();
  this.setSelectionBefore = new SetSelectionBefore();
  this.showDebugHover = new ShowDebugHover(this.rangeUpdater);
  this.showHover = new ShowHover(this.rangeUpdater);
  this.showQuickFix = new ShowQuickFix(this.rangeUpdater);
  this.showReferences = new ShowReferences(this.rangeUpdater);
  this.sortTargets = new Sort(this);
  this.swapTargets = new Swap(this.rangeUpdater);
  this.toggleLineBreakpoint = new ToggleBreakpoint(this.modifierStageFactory);
  this.toggleLineComment = new ToggleLineComment(this.rangeUpdater);
  this.unfoldRegion = new Unfold(this.rangeUpdater);
  this.wrapWithPairedDelimiter = new Wrap(this.rangeUpdater);
  this.wrapWithSnippet = new WrapWithSnippet(
    this.rangeUpdater,
    this.snippets,
    this.modifierStageFactory,
  );

  this["experimental.setInstanceReference"] = new SetSpecialTarget(
    "instanceReference",
  );

  this["private.showParseTree"] = new ShowParseTree(this.treeSitter);
  this["private.getTargets"] = new GetTargets();
  this["private.setKeyboardTarget"] = new SetSpecialTarget("keyboard");
  }

  addSelection;
  addSelectionBefore;
  addSelectionAfter;
  callAsFunction;
  clearAndSetSelection;
  copyToClipboard;
  cutToClipboard;
  decrement;
  deselect;
  editNew;
  editNewLineAfter: EditNewAfter;
  editNewLineBefore: EditNewBefore;
  executeCommand;
  extractVariable;
  findInDocument;
  findInWorkspace;
  flashTargets;
  foldRegion;
  followLink;
  followLinkAside;
  generateSnippet;
  getText;
  gitAccept;
  gitRevert;
  gitStage;
  gitUnstage;
  highlight;
  increment;
  indentLine;
  insertCopyAfter;
  insertCopyBefore;
  insertEmptyLineAfter;
  insertEmptyLineBefore;
  insertEmptyLinesAround;
  insertSnippet;
  joinLines;
  breakLine;
  moveToTarget;
  outdentLine;
  pasteFromClipboard;
  randomizeTargets;
  remove;
  rename;
  replace;
  replaceWithTarget;
  revealDefinition;
  revealTypeDefinition;
  reverseTargets;
  rewrapWithPairedDelimiter;
  scrollToBottom;
  scrollToCenter;
  scrollToTop;
  setSelection;
  setSelectionAfter;
  setSelectionBefore;
  showDebugHover;
  showHover;
  showQuickFix;
  showReferences;
  sortTargets;
  swapTargets;
  toggleLineBreakpoint;
  toggleLineComment;
  unfoldRegion;
  wrapWithPairedDelimiter;
  wrapWithSnippet;
  ["experimental.setInstanceReference"];
  ["private.showParseTree"];
  ["private.getTargets"];
  ["private.setKeyboardTarget"];
}
