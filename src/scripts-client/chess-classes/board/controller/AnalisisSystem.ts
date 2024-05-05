import type MatchController from "./MatchController";
import { FIELDS_IN_ONE_ROW } from "../model/BoardModel";
import Pos from "../model/Pos";
import { CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE } from "../view/DragAndDropPieces";
import PieceView from "../../pieces/view/PieceView";
import PieceModel, { PIECES } from "../../pieces/model/PieceModel";

const ARROW_KEY_BACK = "ArrowLeft";
const ARROW_KEY_FORWARD = "ArrowRight";

const CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT = 10;
const CSS_PIECE_TRANSITION_DELAY_MS_GO_BACK_TO_CURR_POS = 500;

const MOVE_0_INDEX = -1;

export default class AnalisisSystem {
  private currHalfmoveIndex: number | null = null; // null means latest halfmove so user is not analising
  constructor(private match: MatchController) {
    this.match.boardView.onPointerDown((ev: PointerEvent) => {
      if (ev.button === 0 && this.isUserAnalising()) {
        this.goBackToCurrMoveIfUserIsAnalising();
      }
    });
    const halfmovesLength = match.getHalfmovesAmount();
    this.match.boardView.onButtonBack(() => {
      if (halfmovesLength > 0) {
        this.goOneHalfmoveBack();
      }
    });
    this.match.boardView.onButtonForward(() => {
      if (halfmovesLength > 0) {
        this.goOneHalfmoveForward(CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT);
      }
    });

    this.match.boardView.onKeyDown((ev) => {
      if (halfmovesLength === 0) {
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
      ? this.match.getHalfmovesAmount() - 1
      : this.currHalfmoveIndex;
  }

  public isUserAnalisingMove0(): boolean {
    return this.currHalfmoveIndex === MOVE_0_INDEX;
  }

  public goBackToCurrMoveIfUserIsAnalising(): void {
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
      this.goOneHalfmoveOnBoardHTMLBack();
    }
  }

  private changeCurrHalfmoveIndexBack(): boolean {
    // returns isIndexChanged
    if (this.currHalfmoveIndex === MOVE_0_INDEX) {
      return false;
    }
    if (this.currHalfmoveIndex === null) {
      this.currHalfmoveIndex = this.match.getHalfmovesAmount() - 2;
      return true;
    }
    this.currHalfmoveIndex--;
    return true;
  }

  private goOneHalfmoveOnBoardHTMLBack(): void {
    const b = this.match.boardView;
    const halfmoves = this.match.getHalfmoves();
    const currHalfmoveIndex = this.currHalfmoveIndex as number;
    const moveToReverse = halfmoves[currHalfmoveIndex + 1];
    const to = moveToReverse.to;
    const from = moveToReverse.from;
    const isPiecePromoted = moveToReverse.getPromotedTo() !== null;
    const piece = b.getField(to).getPiece();

    if (isPiecePromoted) {
      // behavior when piece is promoted
      const oldPiece = new PieceView(
        moveToReverse.piece.id,
        moveToReverse.piece.team,
        from,
        b.html,
        b.isInverted
      );
      b.removePieceInPos(to, true);
      b.placePieceInPos(
        to,
        oldPiece,
        CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
        true
      );
      b.removePieceInPos(to, false);
      b.placePieceInPos(
        from,
        oldPiece,
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT,
        true
      );
    } else {
      // normal behavior
      b.removePieceInPos(to, false);
      b.placePieceInPos(
        from,
        piece,
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT,
        false
      );
    }

    if (moveToReverse.capturedPiece !== null) {
      const { id, team } = moveToReverse.capturedPiece;
      // capture
      b.getField(to).placePiece(
        { id, team },
        to,
        this.match.boardView.piecesHtml,
        b.isInverted
      );
    }
    if (moveToReverse.isCastling) {
      const fromX = from.x;
      const toX = to.x;
      const castleXDir = toX - fromX > 0 ? 1 : -1;
      const currRookPos = new Pos(to.y, toX - castleXDir);
      const rookStartPosX = castleXDir > 0 ? FIELDS_IN_ONE_ROW - 1 : 0;
      const rookStartPos = new Pos(to.y, rookStartPosX);
      const currRook = b.getField(currRookPos).getPiece();
      b.removePieceInPos(currRookPos, false);
      b.placePieceInPos(
        rookStartPos,
        currRook,
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT * 3.5,
        false
      );
    }
    if (
      moveToReverse.isEnPassantCapture() &&
      PieceModel.isPawn(moveToReverse.piece)
    ) {
      const enPassantPos = moveToReverse.piece.getPosOfPieceCapturedByEnPassant(
        moveToReverse.to
      );
      b.placePieceInPos(
        enPassantPos,
        new PieceView(
          PIECES.PAWN,
          moveToReverse.piece.enemyTeamNum,
          enPassantPos,
          b.html,
          b.isInverted
        ),
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT,
        true
      );
    }
    b.showEventsOnBoard.stopShowingMoveClassification();
    b.showEventsOnBoard.stopShowingLastMove();
    if (!this.isUserAnalisingMove0()) {
      // highlight field under checked king
      const currHalfmove = halfmoves[currHalfmoveIndex];
      b.showEventsOnBoard.stopShowingCheck();
      if (currHalfmove.posOfKingChecked !== null) {
        b.showEventsOnBoard.showCheck(currHalfmove.posOfKingChecked);
      }
      b.showEventsOnBoard.showNewLastMove(currHalfmove.from, currHalfmove.to);
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
    if (this.currHalfmoveIndex === this.match.getHalfmovesAmount() - 1) {
      this.currHalfmoveIndex = null;
    }
    return true;
  }

  private goOneHalfMoveOnBoardHtmlForward(
    cssPieceTransitionDelayMs: number
  ): void {
    const b = this.match.boardView;
    const halfmoves = this.match.getHalfmoves();
    const currHalfmoveIndex =
      this.currHalfmoveIndex === null
        ? halfmoves.length - 1
        : this.currHalfmoveIndex;
    const moveToDo = halfmoves[currHalfmoveIndex];
    const to = moveToDo.to;
    const from = moveToDo.from;

    if (moveToDo.capturedPiece !== null) {
      b.removePieceInPos(to, true);
    }

    const promotedTo = moveToDo.getPromotedTo();
    const isPiecePromoted = promotedTo !== null;
    const pieceToPlace = isPiecePromoted
      ? new PieceView(
          promotedTo.id,
          promotedTo.team,
          to,
          this.match.boardView.piecesHtml,
          b.isInverted
        )
      : b.getField(from).getPiece();
    b.removePieceInPos(from, isPiecePromoted);
    b.placePieceInPos(
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
      const currRook = b.getField(new Pos(to.y, currRookPosX)).getPiece();
      b.removePieceInPos(new Pos(to.y, currRookPosX), false);
      b.placePieceInPos(
        new Pos(to.y, rookPosXAfter),
        currRook,
        CSS_PIECE_TRANSITION_DELAY_MS_DEFAULT * 3.5,
        false
      );
    }
    if (moveToDo.isEnPassantCapture() && PieceModel.isPawn(moveToDo.piece)) {
      const enPassantPos = moveToDo.piece.getPosOfPieceCapturedByEnPassant(
        moveToDo.to
      );
      b.removePieceInPos(enPassantPos, true);
    }

    b.showEventsOnBoard.showNewLastMove(from, to);
    b.showEventsOnBoard.showNewMoveClassification(to);
    b.showEventsOnBoard.stopShowingCheck();
    if (moveToDo.posOfKingChecked !== null) {
      b.showEventsOnBoard.showCheck(moveToDo.posOfKingChecked);
    }
  }
}
