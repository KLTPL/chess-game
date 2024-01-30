import { queryDB } from "./connect";
import { pieceFENToId } from "./toDBConverter";
import type { DBHalfmove } from "./types";

export type addNewMoveProps = {
  DBHalfmove: DBHalfmove;
};

export default async function addNewMove({
  DBHalfmove,
}: addNewMoveProps): Promise<void> {
  const d = DBHalfmove;

  await queryDB(
    `
    INSERT INTO game_halfmove 
      (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, is_castling)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8);
    `,
    [
      d.game_id,
      pieceFENToId(d.piece_symbol_fen),
      d.halfmove_number,
      d.pos_start_x,
      d.pos_start_y,
      d.pos_end_x,
      d.pos_end_y,
      `${d.is_castling}`,
    ]
  );

  if (d.king_checked_pos_x !== null && d.king_checked_pos_y !== null) {
    await queryDB(
      `
      INSERT INTO game_halfmove 
        (king_checked_pos_x, king_checked_pos_y)
      VALUES 
        ($1, $2);
      `,
      [d.king_checked_pos_x, d.king_checked_pos_y]
    );
  }
}
