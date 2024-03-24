import type { GetDBGameData, GetPostDBHalfmove } from "../../../../db/types";
import Pos from "./Pos";
import { type AnyPieceModel, TEAMS } from "../../pieces/model/PieceModel";
import type BoardModel from "./BoardModel";
import FENNotation from "./FENNotation";
import type MatchController from "../controller/MatchController";

export default class IncludeDBData {
  private isIncluding: false | Promise<void>;
  constructor(
    DBGameData: GetDBGameData | null,
    private boardModel: BoardModel,
    match: MatchController | null
  ) {
    if (DBGameData === null) {
      this.isIncluding = false;
      return;
    }
    this.includeCastlingRights(DBGameData);

    this.isIncluding = new Promise<void>((resolve) => {
      setTimeout(async () => {
        await this.insertDBHalfmoves(DBGameData.halfmoves);
        if (DBGameData.game.is_finished && match !== null) {
          match.end({
            result_id: DBGameData.game.result_id as string,
            end_reason_id: DBGameData.game.end_reason_id as string,
          });
        }
        resolve();
      }); // setTimeout so the constructor finishes before and Board.IncludeDBData is not null
    });
    this.isIncluding.then(() => (this.isIncluding = false));
  }

  private includeCastlingRights({ game }: GetDBGameData): void {
    const c = this.boardModel.getCastlingRights();
    c.white.k = game.castling_w_k;
    c.white.q = game.castling_w_q;
    c.black.k = game.castling_b_k;
    c.white.q = game.castling_b_q;
  }

  private async insertDBHalfmoves(DBHalfmoves: GetPostDBHalfmove[]) {
    if (DBHalfmoves.length === 0) {
      return;
    }
    for (const DBHalfmove of DBHalfmoves) {
      await this.movePiece(DBHalfmove);
    }
  }

  private async movePiece(DBHalfmove: GetPostDBHalfmove): Promise<void> {
    const m = this.boardModel;
    const { pos_start_x, pos_start_y, pos_end_x, pos_end_y } = DBHalfmove;
    const startPos = new Pos(pos_start_y, pos_start_x);
    const endPos = new Pos(pos_end_y, pos_end_x);
    const piece = m.getPiece(startPos) as AnyPieceModel;
    const promoted = DBHalfmove.promoted_to_piece_symbol_fen;
    const promotedToId =
      promoted === null ? null : FENNotation.convertPieceFENToId(promoted);
    await m.movePiece(startPos, endPos, promotedToId, true);
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
    const m = this.boardModel;
    if (team === TEAMS.WHITE) {
      piece_fen = piece_fen.toUpperCase();
    }
    const promotedToPiece = FENNotation.convertPieceFENToPieceObj(piece_fen, m);
    m.movesSystem.getLatestHalfmove().setPromotedTo(promotedToPiece);
    m.removePieceInPos(promotionPos);
    m.placePieceInPos(promotionPos, promotedToPiece);
  }

  public async waitUntilIncludesDBData() {
    if (this.isIncluding !== false) {
      await this.isIncluding;
    }
  }
}
