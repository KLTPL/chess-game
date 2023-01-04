import Board from "./Board";
import { CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE } from "./Pieces/Piece";

const ARROW_KEY_BACK = "ArrowLeft";
const ARROW_KEY_FORWARD = "ArrowRight";

const CSS_PIECE_TRASITION_DELAY_MS_DEFAULT = 10;
const CSS_PIECE_TRASITION_DELAY_MS_GO_BACK_TO_CURR_POS = 500;

export default class AnalisisSystem {
  private currHalfmoveIndex: (number|null) = null; // null means latest halfmove so user is not analising
  constructor(private board: Board) {
    this.board.html.addEventListener("click", () => {
      if (this.isUserAnalising()) {
        this.goBackToCurrMoveIfUserIsAnalising();
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
          this.goOneHalfmoveForward(CSS_PIECE_TRASITION_DELAY_MS_DEFAULT);
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
      const newDelay = CSS_PIECE_TRASITION_DELAY_MS_GO_BACK_TO_CURR_POS / tempAmount;
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
    const board = this.board;
    const halfmoves = this.board.movesSystem.halfmoves;
    const currHalfmoveIndex = this.currHalfmoveIndex as number;
    const moveToReverse = halfmoves[currHalfmoveIndex+1];
    const isPiecePromoted = (moveToReverse.getPromotedTo() !== null);
    if (isPiecePromoted) {
      board.removePieceInPos(moveToReverse.to, true);
      board.placePieceInPos(
        moveToReverse.to, 
        moveToReverse.piece, 
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE, 
        true
      );
      board.removePieceInPos(moveToReverse.to, false);
      board.placePieceInPos(
        moveToReverse.from, 
        moveToReverse.piece, 
        CSS_PIECE_TRASITION_DELAY_MS_DEFAULT, 
        true
      );
    } else {
      board.removePieceInPos(moveToReverse.to, false);
      board.placePieceInPos(
        moveToReverse.from, 
        moveToReverse.piece, 
        CSS_PIECE_TRASITION_DELAY_MS_DEFAULT, 
        false
      );
    }

    if (moveToReverse.capturedPiece !== null) {
      board.placePieceInPos(
        moveToReverse.to, 
        moveToReverse.capturedPiece, 
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE, 
        true
      );
    }
  }

  private goOneHalfmoveForward(cssPieceTransitionDelayMs: number): void {
    const isIndexChanged = this.changeCurrHalfmoveIndexForward();
    if (isIndexChanged) {
      this.goOneHalfmoveOnBoardHtmlForward(cssPieceTransitionDelayMs);
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

  private goOneHalfmoveOnBoardHtmlForward(cssPieceTransitionDelayMs: number): void {
    const board = this.board;
    const halfmoves = this.board.movesSystem.halfmoves;
    const currHalfmoveIndex = 
      (this.currHalfmoveIndex === null) ? 
      halfmoves.length-1 : 
      this.currHalfmoveIndex;
    const moveToDo = halfmoves[currHalfmoveIndex];

    if (moveToDo.capturedPiece !== null) {
      board.removePieceInPos(moveToDo.to, true);
    }

    const promotedTo = moveToDo.getPromotedTo();
    const isPiecePromoted = (promotedTo !== null);
    const pieceToPlace = (isPiecePromoted) ? promotedTo : moveToDo.piece;

    board.removePieceInPos(moveToDo.from, isPiecePromoted);
    board.placePieceInPos(moveToDo.to, pieceToPlace, cssPieceTransitionDelayMs, isPiecePromoted);
  }
}