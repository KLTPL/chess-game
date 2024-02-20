export type GetDBGame = {
  id: string;
  display_id: string;
  is_finished: boolean;
  result_id: null | string;
  result_name: null | string;
  end_reason_id: null | string;
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

export type PutDBGame = {
  id: string;
  result_id: string | number;
  end_reason_id: string | number;
};

export type GetDBAppUser = {
  id: string;
  email: string;
  name: string;
  display_name: string;
  is_active: boolean;
  date_create: string;
  date_last_login: string;
};

export type GetDBAppUserForLogin = GetDBAppUser & {
  password: string;
  password_salt: string;
};

export type GetDBGameInvite = {
  id: string;
  user_from: GetDBAppUser;
};

export const enum END_REASONS_ID_DB {
  CHECKMATE = 1,
  RESIGNATION = 2,
  TIMEOUT = 3,
  STALEMATE = 10,
  INSUFFICENT = 11,
  MOVE_RULE_50 = 12,
  REPETITION = 13,
  AGREEMENT = 14,
  DATA_ERROR = 20,
}

export const enum GAME_RESULTS_ID_DB {
  DRAW = 0,
  WHITE = 1,
  BLACK = 2,
}
