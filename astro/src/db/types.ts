export type GetDBGame = {
  id: string;
  display_id: string;
  is_finished: boolean;
  result_name: null | string;
  end_reason_name: null | string;
  castling_w_k: boolean;
  castling_w_q: boolean;
  castling_b_k: boolean;
  castling_b_q: boolean;
  user_w_display_name: string;
  user_w_name: string;
  user_b_display_name: string;
  user_b_name: string;
};
export type GetPostDBHalfmove = {
  game_id: string;
  piece_symbol_fen: string;
  halfmove_number: number;
  pos_start_x: number;
  pos_start_y: number;
  pos_end_x: number;
  pos_end_y: number;
  king_checked_pos_x: null | number;
  king_checked_pos_y: null | number;
  is_castling: boolean;
  promoted_to_piece_symbol_fen: null | string;
};

export type GetDBGameData = {
  game: GetDBGame;
  halfmoves: GetPostDBHalfmove[];
};
