import { queryDB } from "../../../db/connect";
import { type APIRoute } from "astro";

export const GET: APIRoute = async ({ params, request }) => {
  try {
    
    const displayId = params.display_id as string;

    const resGame = await getResGame(displayId);

    if (resGame.rowCount === 0) {
      throw new Error(`Game id not found. Game id: ${displayId}`);
    }
    const id = resGame.rows[0].id as string;

    const resHalfmoves = await getResHalfmoves(id);

    return new Response(
      JSON.stringify({ game: resGame.rows[0], halfmoves: resHalfmoves.rows, body: request.body }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({error: err.message}), {
      status: 500,
    });
  }
};

async function getResGame(displayId: string): Promise<any> {
  const resGame = await queryDB(
    `SELECT 
      id, is_finished, result_id, end_reason_id, castling_w_k, castling_w_q, castling_b_k, castling_b_q
    FROM game 
    WHERE display_id = $1;`,
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