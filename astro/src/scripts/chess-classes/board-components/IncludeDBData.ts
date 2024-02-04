import type { GetDBGameData, GetPostDBHalfmove } from "../../../db/types";
import Pos from "../Pos";
import {
  CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
  type AnyPiece,
  TEAMS,
} from "../pieces/Piece";
import type Board from "./Board";
import FENNotation from "./FENNotation";

export default class IncludeDBData {
  public isIncluding = true;
  constructor(
    DBGameData: GetDBGameData | undefined,
    private board: Board
  ) {
    if (DBGameData === undefined) {
      this.isIncluding = false;
      return;
    }
    this.includeCastlingRights(DBGameData);

    if (DBGameData.game.is_finished) {
      console.log("INCLUDE");
      this.board.match.end({
        result_id: DBGameData.game.result_id as string,
        end_reason_id: DBGameData.game.end_reason_id as string,
      });
    }

    setTimeout(() => this.insertDBHalfmoves(DBGameData.halfmoves)); // setTimeout so the constructor finishes before and Board.IncludeDBData is not null
  }

  private includeCastlingRights(DBGameData: GetDBGameData): void {
    this.board.getCastlingRights().white.k = DBGameData.game.castling_w_k;
    this.board.getCastlingRights().white.q = DBGameData.game.castling_w_q;
    this.board.getCastlingRights().black.k = DBGameData.game.castling_b_k;
    this.board.getCastlingRights().white.q = DBGameData.game.castling_b_q;
  }

  private insertDBHalfmoves(DBHalfmoves: GetPostDBHalfmove[]) {
    if (DBHalfmoves.length === 0) {
      this.isIncluding = false;
      return;
    }
    for (const DBHalfmove of DBHalfmoves) {
      this.movePiece(DBHalfmove);
    }
    this.isIncluding = false;
  }

  private movePiece(DBHalfmove: GetPostDBHalfmove): void {
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
      CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
      true
    );
    if (DBHalfmove.promoted_to_piece_symbol_fen !== null) {
      this.placePromotedPieceOnBoard(
        DBHalfmove.promoted_to_piece_symbol_fen,
        piece.team,
        endPos
      );
    }
  }

  private placePromotedPieceOnBoard(
    piece_fen: string,
    team: TEAMS,
    promotionPos: Pos
  ) {
    const b = this.board;
    if (team === TEAMS.WHITE) {
      piece_fen = piece_fen.toUpperCase();
    }
    const promotedToPiece = FENNotation.convertPieceFENToPieceObj(piece_fen, b);
    b.movesSystem.getLatestHalfmove().setPromotedTo(promotedToPiece);
    b.removePieceInPos(promotionPos, true);
    b.placePieceInPos(
      promotionPos,
      promotedToPiece,
      CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE,
      true
    );
  }
}
