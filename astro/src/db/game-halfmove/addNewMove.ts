import { queryDB } from "../connect";
import type { GetPostDBHalfmove } from "../types";

export default async function addNewMove(
  DBHalfmove: GetPostDBHalfmove
): Promise<void> {
  const d = DBHalfmove;
  const resPieceId = await queryDB(
    "SELECT id FROM dict_piece WHERE symbol_fen = $1",
    [d.piece_symbol_fen]
  );
  await queryDB(
    `
    INSERT INTO game_halfmove 
      (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, is_castling)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8);
    `,
    [
      d.game_id,
      resPieceId.rows[0].id,
      d.halfmove_number,
      d.pos_start_x,
      d.pos_start_y,
      d.pos_end_x,
      d.pos_end_y,
      `${d.is_castling}`,
    ]
  );
  if (d.promoted_to_piece_symbol_fen !== null) {
    const resPromotedPieceId = await queryDB(
      "SELECT id FROM dict_piece WHERE symbol_fen = $1",
      [d.promoted_to_piece_symbol_fen]
    );
    await queryDB(
      `
      UPDATE game_halfmove 
      SET promoted_to_piece_id = $1
      WHERE game_id = $2 and halfmove_number = $3;
      `,
      [resPromotedPieceId.rows[0].id, d.game_id, d.halfmove_number]
    );
  }

  if (d.king_checked_pos_x !== null && d.king_checked_pos_y !== null) {
    await queryDB(
      `
      UPDATE game_halfmove 
      SET 
        king_checked_pos_x = $1,
        king_checked_pos_y = $2
      WHERE game_id = $3 and halfmove_number = $4;
      `,
      [d.king_checked_pos_x, d.king_checked_pos_y, d.game_id, d.halfmove_number]
    );
  }
}
