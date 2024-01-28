import type { DBGameData, DBHalfmove } from "../../../db/types";
import Pos from "../Pos";
import {
  CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
  type AnyPiece,
} from "../pieces/Piece";
import type Board from "./Board";

export default class IncludeDBData {
  isIncluding = true;
  constructor(
    DBGameData: DBGameData | undefined,
    private board: Board
  ) {
    if (DBGameData === undefined) {
      return;
    }
    if (DBGameData.game.is_finished) {
      this.board.match.end({
        cousedBy: null,
        resultName: DBGameData.game.result_name as string,
        endReasonName: DBGameData.game.end_reason_name as string,
      });
      return;
    }

    this.includeCastlingRights(DBGameData);
    setTimeout(() => this.insertDBHalfmoves(DBGameData.halfmoves)); // setTimeout so the constructor finishes before and Board.IncludeDBData is not null
  }

  public includeCastlingRights(DBGameData: DBGameData): void {
    this.board.getCastlingRights().white.k = DBGameData.game.castling_w_k;
    this.board.getCastlingRights().white.q = DBGameData.game.castling_w_q;
    this.board.getCastlingRights().black.k = DBGameData.game.castling_b_k;
    this.board.getCastlingRights().white.q = DBGameData.game.castling_b_q;
  }

  private insertDBHalfmoves(DBHalfmoves: DBHalfmove[]) {
    if (DBHalfmoves.length === 0) {
      return;
    }
    for (const DBHalfmove of DBHalfmoves) {
      this.movePiece(DBHalfmove);
    }
    this.isIncluding = false;
  }

  private movePiece(DBHalfmove: DBHalfmove): void {
    const b = this.board;
    const { pos_start_x, pos_start_y, pos_end_x, pos_end_y } = DBHalfmove;
    const startPos = new Pos(pos_start_y, pos_start_x);
    const endPos = new Pos(pos_end_y, pos_end_x);
    const piece = b.getPiece(startPos) as AnyPiece;
    b.removePieceInPos(startPos, false);
    b.movePiece(
      startPos,
      endPos,
      piece as AnyPiece,
      CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE
    );
  }
}
