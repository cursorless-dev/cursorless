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
    treeSitter: TreeSitter,
    snippets: Snippets,
    rangeUpdater: RangeUpdater,
    modifierStageFactory: ModifierStageFactory,
  ) {
    this.addSelection = new AddSelection();
    this.addSelectionBefore = new AddSelectionBefore();
    this.addSelectionAfter = new AddSelectionAfter();
    this.callAsFunction = new Call(this);
    this.clearAndSetSelection = new Clear(this);
    this.copyToClipboard = new CopyToClipboard(this, rangeUpdater);
    this.cutToClipboard = new CutToClipboard(this);
    this.decrement = new Decrement(this);
    this.deselect = new Deselect();
    this.editNew = new EditNew(rangeUpdater, this);
    this.editNewLineAfter = new EditNewAfter(this, modifierStageFactory);
    this.editNewLineBefore = new EditNewBefore(this, modifierStageFactory);
    this.executeCommand = new ExecuteCommand(rangeUpdater);
    this.extractVariable = new ExtractVariable(rangeUpdater);
    this.findInDocument = new FindInDocument(this);
    this.findInWorkspace = new FindInWorkspace(this);
    this.flashTargets = new FlashTargets();
    this.foldRegion = new Fold(rangeUpdater);
    this.followLink = new FollowLink({ openAside: false });
    this.followLinkAside = new FollowLink({ openAside: true });
    this.generateSnippet = new GenerateSnippet(snippets);
    this.getText = new GetText();
    this.gitAccept = new GitAccept(rangeUpdater);
    this.gitRevert = new GitRevert(rangeUpdater);
    this.gitStage = new GitStage(rangeUpdater);
    this.gitUnstage = new GitUnstage(rangeUpdater);
    this.highlight = new Highlight();
    this.increment = new Increment(this);
    this.indentLine = new IndentLine(rangeUpdater);
    this.insertCopyAfter = new InsertCopyAfter(
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertCopyBefore = new InsertCopyBefore(
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertEmptyLineAfter = new InsertEmptyLineAfter(
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertEmptyLineBefore = new InsertEmptyLineBefore(
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertEmptyLinesAround = new InsertEmptyLinesAround(
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertSnippet = new InsertSnippet(
      rangeUpdater,
      this,
      modifierStageFactory,
    );
    this.joinLines = new JoinLines(rangeUpdater, modifierStageFactory);
    this.breakLine = new BreakLine(rangeUpdater);
    this.moveToTarget = new Move(rangeUpdater);
    this.outdentLine = new OutdentLine(rangeUpdater);
    this.pasteFromClipboard = new PasteFromClipboard(rangeUpdater, this);
    this.randomizeTargets = new Random(this);
    this.remove = new Remove(rangeUpdater);
    this.rename = new Rename(rangeUpdater);
    this.replace = new Replace(rangeUpdater);
    this.replaceWithTarget = new Bring(rangeUpdater);
    this.revealDefinition = new RevealDefinition(rangeUpdater);
    this.revealTypeDefinition = new RevealTypeDefinition(rangeUpdater);
    this.reverseTargets = new Reverse(this);
    this.rewrapWithPairedDelimiter = new Rewrap(
      rangeUpdater,
      modifierStageFactory,
    );
    this.scrollToBottom = new ScrollToBottom();
    this.scrollToCenter = new ScrollToCenter();
    this.scrollToTop = new ScrollToTop();
    this.setSelection = new SetSelection();
    this.setSelectionAfter = new SetSelectionAfter();
    this.setSelectionBefore = new SetSelectionBefore();
    this.showDebugHover = new ShowDebugHover(rangeUpdater);
    this.showHover = new ShowHover(rangeUpdater);
    this.showQuickFix = new ShowQuickFix(rangeUpdater);
    this.showReferences = new ShowReferences(rangeUpdater);
    this.sortTargets = new Sort(this);
    this.swapTargets = new Swap(rangeUpdater);
    this.toggleLineBreakpoint = new ToggleBreakpoint(modifierStageFactory);
    this.toggleLineComment = new ToggleLineComment(rangeUpdater);
    this.unfoldRegion = new Unfold(rangeUpdater);
    this.wrapWithPairedDelimiter = new Wrap(rangeUpdater);
    this.wrapWithSnippet = new WrapWithSnippet(
      rangeUpdater,
      modifierStageFactory,
    );

    this["experimental.setInstanceReference"] = new SetSpecialTarget(
      "instanceReference",
    );

    this["private.showParseTree"] = new ShowParseTree(treeSitter);
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
