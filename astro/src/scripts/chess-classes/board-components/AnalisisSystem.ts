import Board, { FIELDS_IN_ONE_ROW } from "./Board";
import { CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE } from "../pieces/Piece";
import Pos from "../Pos";

export const BUTTON_ID_BACK = "back";
export const BUTTON_ID_FORWARD = "forward";

const ARROW_KEY_BACK = "ArrowLeft";
const ARROW_KEY_FORWARD = "ArrowRight";

const CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT = 10;
const CSS_PIECE_TRANSITION_DELAY_MS_GO_BACK_TO_CURR_POS = 500;

const MOVE_0_INDEX = -1;

export default class AnalisisSystem {
  private currHalfmoveIndex: number | null = null; // null means latest halfmove so user is not analising
  constructor(private board: Board) {
    this.board.piecesHtml.addEventListener("pointerdown", (ev) => {
      if (ev.button === 0 && this.isUserAnalising()) {
        this.goBackToCurrMoveIfUserIsAnalising();
      }
    });
    document
      .querySelector(`#${BUTTON_ID_BACK}`)
      ?.addEventListener("click", () => {
        if (this.board.movesSystem.halfmoves.length > 0) {
          this.goOneHalfmoveBack();
        }
      });

    document
      .querySelector(`#${BUTTON_ID_FORWARD}`)
      ?.addEventListener("click", () => {
        if (this.board.movesSystem.halfmoves.length > 0) {
          this.goOneHalfmoveForward(CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT);
        }
      });

    window.addEventListener("keydown", (ev) => {
      if (this.board.movesSystem.halfmoves.length === 0) {
        return;
      }

      switch (ev.key) {
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
    return this.currHalfmoveIndex !== null;
  }

  public getIndexOfHalfmoveUserIsOn(): number {
    return this.currHalfmoveIndex === null
      ? this.board.movesSystem.halfmoves.length - 1
      : this.currHalfmoveIndex;
  }

  public isUserAnalisingMove0(): boolean {
    return this.currHalfmoveIndex === MOVE_0_INDEX;
  }

  private goBackToCurrMoveIfUserIsAnalising(): void {
    let tempAmount = 1;
    while (this.currHalfmoveIndex !== null) {
      tempAmount++;
      const newDelay =
        CSS_PIECE_TRANSITION_DELAY_MS_GO_BACK_TO_CURR_POS / tempAmount;
      const delayOnThatMove =
        newDelay < CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE
          ? CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE
          : newDelay;
      this.goOneHalfmoveForward(delayOnThatMove);
    }
  }

  private goOneHalfmoveBack(): void {
    const isIndexChanged = this.changeCurrHalfmoveIndexBack();
    if (isIndexChanged) {
      this.goOneHalfmoveOnBoardHtmlBack();
    }
  }

  private changeCurrHalfmoveIndexBack(): boolean {
    // returns isIndexChanged
    if (this.currHalfmoveIndex === MOVE_0_INDEX) {
      return false;
    }
    if (this.currHalfmoveIndex === null) {
      this.currHalfmoveIndex = this.board.movesSystem.halfmoves.length - 2;
      return true;
    }
    this.currHalfmoveIndex--;
    return true;
  }

  private goOneHalfmoveOnBoardHtmlBack(): void {
    const board = this.board;
    const halfmoves = this.board.movesSystem.halfmoves;
    const currHalfmoveIndex = this.currHalfmoveIndex as number;
    const moveToReverse = halfmoves[currHalfmoveIndex + 1];
    const to = moveToReverse.to.getInvertedProperly(board.isInverted);
    const from = moveToReverse.from.getInvertedProperly(board.isInverted);
    const isPiecePromoted = moveToReverse.getPromotedTo() !== null;

    if (isPiecePromoted) {
      // behavior when piece is promoted
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
    } else {
      // normal behavior
      board.removePieceInPos(to, false);
      board.placePieceInPos(
        from,
        moveToReverse.piece,
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT,
        false
      );
    }

    if (moveToReverse.capturedPiece !== null) {
      // capture
      board.placePieceInPos(
        to,
        moveToReverse.capturedPiece,
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
        true
      );
    }
    if (moveToReverse.isCastling) {
      const fromX = from.x;
      const toX = to.x;
      const castleXDir = toX - fromX > 0 ? 1 : -1;
      const currRookPos = new Pos(to.y, toX - castleXDir);
      const rookStartPosX = castleXDir > 0 ? FIELDS_IN_ONE_ROW - 1 : 0;
      const rookStartPos = new Pos(to.y, rookStartPosX);
      const currRook = board.getPiece(currRookPos);
      board.removePieceInPos(currRookPos, false);
      board.placePieceInPos(
        rookStartPos,
        currRook,
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT * 3.5,
        false
      );
    }
    board.showEventsOnBoard.stopShowingMoveClassification();
    board.showEventsOnBoard.stopShowingLastMove();
    if (!this.isUserAnalisingMove0()) {
      // highlight field under checked king
      const currHalfmove = halfmoves[currHalfmoveIndex];
      board.showEventsOnBoard.stopShowingCheck();
      if (currHalfmove.posOfKingChecked !== null) {
        board.showEventsOnBoard.showCheck(
          currHalfmove.posOfKingChecked.getInvertedProperly(board.isInverted)
        );
      }
      board.showEventsOnBoard.showNewLastMove(
        currHalfmove.from.getInvertedProperly(board.isInverted),
        currHalfmove.to.getInvertedProperly(board.isInverted)
      );
    }
  }

  private goOneHalfmoveForward(cssPieceTransitionDelayMs: number): void {
    const isIndexChanged = this.changeCurrHalfmoveIndexForward();
    if (isIndexChanged) {
      this.goOneHalfMoveOnBoardHtmlForward(cssPieceTransitionDelayMs);
    }
  }

  private changeCurrHalfmoveIndexForward(): boolean {
    // returns isIndexChanged
    if (this.currHalfmoveIndex === null) {
      return false;
    }
    this.currHalfmoveIndex++;
    if (
      this.currHalfmoveIndex ===
      this.board.movesSystem.halfmoves.length - 1
    ) {
      this.currHalfmoveIndex = null;
    }
    return true;
  }

  private goOneHalfMoveOnBoardHtmlForward(
    cssPieceTransitionDelayMs: number
  ): void {
    const board = this.board;
    const halfmoves = this.board.movesSystem.halfmoves;
    const currHalfmoveIndex =
      this.currHalfmoveIndex === null
        ? halfmoves.length - 1
        : this.currHalfmoveIndex;
    const moveToDo = halfmoves[currHalfmoveIndex];
    const to = moveToDo.to.getInvertedProperly(board.isInverted);
    const from = moveToDo.from.getInvertedProperly(board.isInverted);

    if (moveToDo.capturedPiece !== null) {
      board.removePieceInPos(to, true);
    }

    const promotedTo = moveToDo.getPromotedTo();
    const isPiecePromoted = promotedTo !== null;
    const pieceToPlace = isPiecePromoted ? promotedTo : moveToDo.piece;

    board.removePieceInPos(from, isPiecePromoted);
    board.placePieceInPos(
      to,
      pieceToPlace,
      cssPieceTransitionDelayMs,
      isPiecePromoted
    );
    if (moveToDo.isCastling) {
      // castle
      const fromX = from.x;
      const toX = to.x;
      const castleXDir = toX - fromX > 0 ? 1 : -1;
      const currRookPosX = castleXDir > 0 ? FIELDS_IN_ONE_ROW - 1 : 0;
      const rookPosXAfter = toX - castleXDir;
      const currRook = board.getPiece(new Pos(to.y, currRookPosX));
      board.removePieceInPos(new Pos(to.y, currRookPosX), false);
      board.placePieceInPos(
        new Pos(to.y, rookPosXAfter),
        currRook,
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT * 3.5,
        false
      );
    }

    board.showEventsOnBoard.showNewLastMove(from, to);
    board.showEventsOnBoard.showNewMoveClassification(to);
    board.showEventsOnBoard.stopShowingCheck();
    if (moveToDo.posOfKingChecked !== null) {
      board.showEventsOnBoard.showCheck(
        moveToDo.posOfKingChecked.getInvertedProperly(board.isInverted)
      );
    }
  }
}
