export type GetDBGame = {
  id: string;
  display_id: string;
  is_finished: boolean;
  result_id: null | GAME_RESULTS_ID_DB;
  result_name: null | string;
  end_reason_id: null | END_REASONS_ID_DB;
  end_reason_name: null | string;
  castling_w_k: boolean;
  castling_w_q: boolean;
  castling_b_k: boolean;
  castling_b_q: boolean;
  user_w_id: string;
  user_w_display_name: string;
  user_w_name: string;
  user_b_id: string;
  user_b_display_name: string;
  user_b_name: string;
  start_date: string;
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
  result_id: GAME_RESULTS_ID_DB | number;
  end_reason_id: END_REASONS_ID_DB | number;
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
  is_user_from_white: boolean | null;
};

export type PostGameInvite = {
  userToId: string;
  isUserFromWhite: boolean | null;
};

export type PutGameInvite = {
  inviteId: string;
  userFromId: string;
};

export type DeleteGameInvite = {
  inviteId: string;
};

export type PostGameInviteLink = {
  isUserFromWhite: boolean | null;
};

export type PostResultGameInviteLink = {
  inviteLink: string;
};

export type PutResponseGameInvite = {
  newGamePath: string;
};

export type GetResponseGameInviteLink = {
  id: string;
  user_from: GetDBAppUser;
  is_user_from_white: boolean | null;
};

export type GetGameInviteLink = {
  displayId: string;
};

export type DeleteGameInviteLink = {
  id: string;
};

export type PutGameInviteLink = {
  id: string;
};

export type PutResponseGameInviteLink = {
  newGamePath: string;
};

export type GetUserGames = {
  id: string;
  startIdx: number;
  endIdx: number;
};

export type GetResultRelatedUsers = {
  friends: GetDBAppUser[];
  invited: GetDBAppUser[];
  whoInvited: GetDBAppUser[];
  blocked: GetDBAppUser[];
  type: "GetResultRelatedUsers";
};

export type GetResultSearchAlias = {
  friends: GetDBAppUser[];
  invited: GetDBAppUser[];
  whoInvited: GetDBAppUser[];
  suggestions: GetDBAppUser[];
  blocked: GetDBAppUser[];
  type: "GetResultSearchAlias";
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
