import Board, { FIELDS_IN_ONE_ROW } from "./Board";
import { CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE } from "./Pieces/Piece";
import Pos from "./Pos";

export const BUTTON_ID_BACK = "back";
export const BUTTON_ID_FORWARD = "forward";

const ARROW_KEY_BACK = "ArrowLeft";
const ARROW_KEY_FORWARD = "ArrowRight";

const CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT = 10;
const CSS_PIECE_TRANSITION_DELAY_MS_GO_BACK_TO_CURR_POS = 500;

export default class AnalisisSystem {
  private currHalfmoveIndex: (number|null) = null; // null means latest halfmove so user is not analising
  constructor(private board: Board) {
    this.board.piecesHtml.addEventListener("click", () => {
      if (this.isUserAnalising()) {
        this.goBackToCurrMoveIfUserIsAnalising();
      }
    });
    document.querySelector(`#${BUTTON_ID_BACK}`)?.addEventListener("click", () => {
      if (this.board.movesSystem.halfmoves.length > 0) {
        this.goOneHalfmoveBack();
      }
    });

    document.querySelector(`#${BUTTON_ID_FORWARD}`)?.addEventListener("click", () => {
      if (this.board.movesSystem.halfmoves.length > 0) {
        this.goOneHalfmoveForward(CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT);
      }
    });

    window.addEventListener("keydown", ev => {
      if (this.board.movesSystem.halfmoves.length === 0) {
        return;
      }

      switch(ev.key) {
        case ARROW_KEY_BACK:
          this.goOneHalfmoveBack();
          break;
        case ARROW_KEY_FORWARD:
          this.goOneHalfmoveForward(CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT);
          break;
      }
    });
  }

  public isUserAnalising(): boolean {
    return (this.currHalfmoveIndex !== null);
  }

  private goBackToCurrMoveIfUserIsAnalising(): void { 
    let tempAmount = 1;
    while (this.currHalfmoveIndex !== null) {
      tempAmount++;
      const newDelay = CSS_PIECE_TRANSITION_DELAY_MS_GO_BACK_TO_CURR_POS / tempAmount;
      const delayOnThatMove = 
        (newDelay < CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE) ?  
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE : 
        newDelay;
      this.goOneHalfmoveForward(delayOnThatMove);
    }
  }

  private goOneHalfmoveBack(): void {
    const isIndexChanged = this.changeCurrHalfmoveIndexBack();
    if (isIndexChanged) {
      this.goOneHalfmoveOnBoardHtmlBack();
    }
  }

  private changeCurrHalfmoveIndexBack(): boolean { // returns isIndexChanged
    const startIndex = -1;
    if (this.currHalfmoveIndex === startIndex) {
      return false;
    }
    if (this.currHalfmoveIndex === null) {
      this.currHalfmoveIndex = this.board.movesSystem.halfmoves.length-2;
      return true;
    }
    this.currHalfmoveIndex--;
    return true;
  }

  private goOneHalfmoveOnBoardHtmlBack(): void {
    const move0Index = -1;
    const board = this.board;
    const halfmoves = this.board.movesSystem.halfmoves;
    const currHalfmoveIndex = this.currHalfmoveIndex as number;
    const moveToReverse = halfmoves[currHalfmoveIndex+1];
    const to = moveToReverse.to.getInvertedProperly(board.isInverted);
    const from = moveToReverse.from.getInvertedProperly(board.isInverted);
    const isPiecePromoted = (moveToReverse.getPromotedTo() !== null);

    if (isPiecePromoted) { // behavior when piece is promoted
      board.removePieceInPos(to, true);
      board.placePieceInPos(
        to, 
        moveToReverse.piece, 
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE, 
        true
      );
      board.removePieceInPos(to, false);
      board.placePieceInPos(
        from, 
        moveToReverse.piece, 
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT, 
        true
      );
    } else { // normal behavior
      board.removePieceInPos(to, false);
      board.placePieceInPos(
        from, 
        moveToReverse.piece, 
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT, 
        false
      );
    }

    if (moveToReverse.capturedPiece !== null) { // capture
      board.placePieceInPos(
        to, 
        moveToReverse.capturedPiece, 
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE, 
        true
      );
    }
    if (moveToReverse.isCastle()) { 
      const fromX = from.x;
      const toX = to.x;
      const castleXDir = (toX - fromX > 0) ? 1 : -1;
      const currRookPos = new Pos(to.y, toX - castleXDir);
      const rookStartPosX = (castleXDir > 0) ? FIELDS_IN_ONE_ROW-1 : 0;
      const rookStartPos = new Pos(to.y, rookStartPosX);
      this.board.removePieceInPos(currRookPos, false);
      this.board.placePieceInPos(
        rookStartPos, 
        moveToReverse.rookThatCastled, 
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT*3.5, 
        false
      );
    }
    this.board.stopShowingMoveClassification();
    this.board.stopShowingLastMove();
    if (currHalfmoveIndex > move0Index) { // highlight field under checked king
      const currHalfmove = halfmoves[currHalfmoveIndex];
      this.board.stopShowingCheck();
      if (currHalfmove.posOfKingChecked !== null) {
        this.board.showCheck(currHalfmove.posOfKingChecked);
      }
      this.board.showNewLastMove(currHalfmove.from, currHalfmove.to);
    } 
  }

  private goOneHalfmoveForward(cssPieceTransitionDelayMs: number): void {
    const isIndexChanged = this.changeCurrHalfmoveIndexForward();
    if (isIndexChanged) {
      this.goOneHalfMoveOnBoardHtmlForward(cssPieceTransitionDelayMs);
    }
  }

  private changeCurrHalfmoveIndexForward(): boolean { // returns isIndexChanged
    if (this.currHalfmoveIndex === null) {
      return false;
    }
    this.currHalfmoveIndex++;
    if (this.currHalfmoveIndex === this.board.movesSystem.halfmoves.length-1) {
      this.currHalfmoveIndex = null;
    }
    return true;
  }

  private goOneHalfMoveOnBoardHtmlForward(cssPieceTransitionDelayMs: number): void {
    const board = this.board;
    const halfmoves = this.board.movesSystem.halfmoves;
    const currHalfmoveIndex = 
      (this.currHalfmoveIndex === null) ? 
      halfmoves.length-1 : 
      this.currHalfmoveIndex;
    const moveToDo = halfmoves[currHalfmoveIndex];
    const to = moveToDo.to.getInvertedProperly(board.isInverted);
    const from = moveToDo.from.getInvertedProperly(board.isInverted);

    if (moveToDo.capturedPiece !== null) {
      board.removePieceInPos(to, true);
    }

    const promotedTo = moveToDo.getPromotedTo();
    const isPiecePromoted = (promotedTo !== null);
    const pieceToPlace = (isPiecePromoted) ? promotedTo : moveToDo.piece;

    board.removePieceInPos(from, isPiecePromoted);
    board.placePieceInPos(to, pieceToPlace, cssPieceTransitionDelayMs, isPiecePromoted);
    if (moveToDo.isCastle()) { // castle
      const fromX = from.x;
      const toX = to.x;
      const castleXDir = (toX - fromX > 0) ? 1 : -1;
      const currRookPosX = (castleXDir > 0) ? FIELDS_IN_ONE_ROW-1 : 0;
      const rookPosXAfter = toX - castleXDir;
      this.board.removePieceInPos(new Pos(to.y, currRookPosX), false);
      this.board.placePieceInPos(
        new Pos(to.y, rookPosXAfter), 
        moveToDo.rookThatCastled, 
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT*3.5, 
        false
      );
    }

    this.board.showNewLastMove(from, to);
    this.board.showNewMoveClassification(to);
    this.board.stopShowingCheck();
    if (moveToDo.posOfKingChecked !== null) {
      this.board.showCheck(moveToDo.posOfKingChecked);
    }
  }
}