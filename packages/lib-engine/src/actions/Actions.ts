import type { IDE, TreeSitter } from "@cursorless/lib-common";
import type { Snippets } from "../core/Snippets";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import type { ActionRecord } from "./actions.types";
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
import { Decrement, Increment } from "./incrementDecrement";
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

/**
 * Keeps a map from action names to objects that implement the given action
 */
export class Actions implements ActionRecord {
  constructor(
    ide: IDE,
    treeSitter: TreeSitter,
    snippets: Snippets,
    rangeUpdater: RangeUpdater,
    modifierStageFactory: ModifierStageFactory,
  ) {
    this.addSelection = new AddSelection(ide);
    this.addSelectionBefore = new AddSelectionBefore(ide);
    this.addSelectionAfter = new AddSelectionAfter(ide);
    this.callAsFunction = new Call(this);
    this.clearAndSetSelection = new Clear(ide, this);
    this.copyToClipboard = new CopyToClipboard(ide, this, rangeUpdater);
    this.cutToClipboard = new CutToClipboard(ide, this);
    this.decrement = new Decrement(this);
    this.deselect = new Deselect(ide);
    this.editNew = new EditNew(ide, rangeUpdater, this);
    this.editNewLineAfter = new EditNewAfter(this, modifierStageFactory);
    this.editNewLineBefore = new EditNewBefore(this, modifierStageFactory);
    this.executeCommand = new ExecuteCommand(ide, rangeUpdater);
    this.extractVariable = new ExtractVariable(ide, rangeUpdater);
    this.findInDocument = new FindInDocument(ide, this);
    this.findInWorkspace = new FindInWorkspace(ide, this);
    this.flashTargets = new FlashTargets(ide);
    this.foldRegion = new Fold(ide, rangeUpdater);
    this.followLink = new FollowLink(ide, { openAside: false });
    this.followLinkAside = new FollowLink(ide, { openAside: true });
    this.generateSnippet = new GenerateSnippet(ide, snippets);
    this.getText = new GetText(ide);
    this.gitAccept = new GitAccept(ide, rangeUpdater);
    this.gitRevert = new GitRevert(ide, rangeUpdater);
    this.gitStage = new GitStage(ide, rangeUpdater);
    this.gitUnstage = new GitUnstage(ide, rangeUpdater);
    this.highlight = new Highlight(ide);
    this.increment = new Increment(this);
    this.indentLine = new IndentLine(ide, rangeUpdater);
    this.insertCopyAfter = new InsertCopyAfter(
      ide,
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertCopyBefore = new InsertCopyBefore(
      ide,
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertEmptyLineAfter = new InsertEmptyLineAfter(
      ide,
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertEmptyLineBefore = new InsertEmptyLineBefore(
      ide,
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertEmptyLinesAround = new InsertEmptyLinesAround(
      ide,
      rangeUpdater,
      modifierStageFactory,
    );
    this.insertSnippet = new InsertSnippet(
      ide,
      rangeUpdater,
      this,
      modifierStageFactory,
    );
    this.joinLines = new JoinLines(ide, rangeUpdater, modifierStageFactory);
    this.breakLine = new BreakLine(ide, rangeUpdater);
    this.moveToTarget = new Move(ide, rangeUpdater);
    this.outdentLine = new OutdentLine(ide, rangeUpdater);
    this.pasteFromClipboard = new PasteFromClipboard(ide, rangeUpdater, this);
    this.randomizeTargets = new Random(ide, this);
    this.remove = new Remove(ide, rangeUpdater);
    this.rename = new Rename(ide, rangeUpdater);
    this.replace = new Replace(ide, rangeUpdater);
    this.replaceWithTarget = new Bring(ide, rangeUpdater);
    this.revealDefinition = new RevealDefinition(ide, rangeUpdater);
    this.revealTypeDefinition = new RevealTypeDefinition(ide, rangeUpdater);
    this.reverseTargets = new Reverse(ide, this);
    this.rewrapWithPairedDelimiter = new Rewrap(
      ide,
      rangeUpdater,
      modifierStageFactory,
    );
    this.scrollToBottom = new ScrollToBottom(ide);
    this.scrollToCenter = new ScrollToCenter(ide);
    this.scrollToTop = new ScrollToTop(ide);
    this.setSelection = new SetSelection(ide);
    this.setSelectionAfter = new SetSelectionAfter(ide);
    this.setSelectionBefore = new SetSelectionBefore(ide);
    this.showDebugHover = new ShowDebugHover(ide, rangeUpdater);
    this.showHover = new ShowHover(ide, rangeUpdater);
    this.showQuickFix = new ShowQuickFix(ide, rangeUpdater);
    this.showReferences = new ShowReferences(ide, rangeUpdater);
    this.sortTargets = new Sort(ide, this);
    this.swapTargets = new Swap(ide, rangeUpdater);
    this.toggleLineBreakpoint = new ToggleBreakpoint(ide, modifierStageFactory);
    this.toggleLineComment = new ToggleLineComment(ide, rangeUpdater);
    this.unfoldRegion = new Unfold(ide, rangeUpdater);
    this.wrapWithPairedDelimiter = new Wrap(ide, rangeUpdater);
    this.wrapWithSnippet = new WrapWithSnippet(
      ide,
      rangeUpdater,
      modifierStageFactory,
    );

    this["experimental.setInstanceReference"] = new SetSpecialTarget(
      "instanceReference",
    );

    this["private.showParseTree"] = new ShowParseTree(ide, treeSitter);
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
