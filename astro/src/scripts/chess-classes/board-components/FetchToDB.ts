import type { GetPostDBHalfmove } from "../../../db/types";
import type Halfmove from "../Halfmove";
import FENNotation from "./FENNotation";

export default class FetchToDB {
  constructor(private game_id: string) {}
  public postHalfmove(halfmove: Halfmove, halfmoveNum: number) {
    const promotedTo = halfmove.getPromotedTo();

    const GetDBHalfmove: GetPostDBHalfmove = {
      game_id: this.game_id,
      halfmove_number: halfmoveNum,
      is_castling: halfmove.isCastling,
      king_checked_pos_x:
        halfmove.posOfKingChecked === null ? null : halfmove.posOfKingChecked.x,
      king_checked_pos_y:
        halfmove.posOfKingChecked === null ? null : halfmove.posOfKingChecked.y,
      piece_symbol_fen: FENNotation.convertPieceIdToFEN(halfmove.piece.id),
      pos_start_x: halfmove.from.x,
      pos_start_y: halfmove.from.y,
      pos_end_x: halfmove.to.x,
      pos_end_y: halfmove.to.y,
      promoted_to_piece_symbol_fen:
        promotedTo === null
          ? null
          : FENNotation.convertPieceIdToFEN(promotedTo.id),
    };
    fetch(
      `${import.meta.env.PUBLIC_URL}/api/online-game/${this.game_id}}.json`,
      {
        method: "POST",
        body: JSON.stringify(GetDBHalfmove),
      }
    );
  }
}
