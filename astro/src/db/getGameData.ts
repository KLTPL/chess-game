import { queryDB } from "./connect";

export default async function getGameDataJSON(
  displayId: string
): Promise<string | null> {
  const resGame = await getResGame(displayId);

  if (resGame.rowCount === 0) {
    return null;
  }
  const id = resGame.rows[0].id as string;

  const resHalfmoves = await getResHalfmoves(id);

  resGame.rows[0].id = undefined;
  return JSON.stringify({
    game: resGame.rows[0],
    halfmoves: resHalfmoves.rows,
  });
}

async function getResGame(displayId: string): Promise<any> {
  const resGame = await queryDB(
    `SELECT
        g.id, g.is_finished, gr.name as result_name, ger.name as end_reason_name, g.castling_w_k, g.castling_w_q, g.castling_b_k, g.castling_b_q, u1.display_name AS user_w_display_name, u1.name AS user_w_name, u2.display_name AS user_b_display_name, u2.name AS user_b_name
      FROM (SELECT * FROM game WHERE display_id = $1) g
      JOIN app_user u1
      ON (u1.id = g.user_id_w)
      JOIN app_user u2
      ON (u2.id = g.user_id_b)
      LEFT JOIN dict_game_result gr
      ON (g.result_id = gr.id)
      LEFT JOIN dict_game_end_reason ger
      ON (g.end_reason_id = ger.id);`,
    [displayId]
  );
  return resGame;
}

async function getResHalfmoves(id: string): Promise<any> {
  const resHalfmoves = await queryDB(
    `SELECT d.symbol_FEN as piece_symbol_FEN, h.halfmove_number, h.pos_start_x, h.pos_start_y, h.pos_end_x, h.pos_end_y, h.king_checked_pos_x, h.king_checked_pos_y, h.is_castling
    FROM (SELECT * FROM game_halfmove WHERE game_id = $1) h
    JOIN dict_piece d
    ON (h.piece_id = d.id)
    ORDER BY halfmove_number;`,
    [id]
  );
  return resHalfmoves;
}
