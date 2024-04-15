// FORMAT: [IN_OR_OUT][ENDPOINT_TYPE][ROUTE_NAME]
// IN_OR_OUT - "API" (if body data) or "APIResp" (if response data)
// ENDPOINT_TYPE - list of: "Get", "Post", "Put", "Delete" (ex. GetPost)
// ROUTE_NAME - name written in CamelCase
// FORMAT EXAMPLE: APIGetPostYourRouteName
// for body, for enpoints get and post, for route: /api/your-route-name

export type APIGetGame = {
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
export type APIGetPostHalfmove = {
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

export type APIGetGameData = {
  game: APIGetGame;
  halfmoves: APIGetPostHalfmove[];
};

export type APIGetOnlineGame = {
  getDBGameData: APIGetGameData;
  userId: string | undefined;
};

export type APIGetAppUser = {
  id: string;
  email: string;
  name: string;
  display_name: string;
  is_active: boolean;
  date_create: string;
  date_last_login: string;
};

export type APIGetAppUserForLogin = APIGetAppUser & {
  password: string;
  password_salt: string;
};

export type APIGetGameInvite = {
  id: string;
  user_from: APIGetAppUser;
  is_user_from_white: boolean | null;
};

export type APIPostGameInvite = {
  userToId: string;
  isUserFromWhite: boolean | null;
};

export type APIPutGameInvite = {
  inviteId: string;
  userFromId: string;
};

export type APIDeleteGameInvite = {
  inviteId: string;
};

export type APIPostGameInviteLink = {
  isUserFromWhite: boolean | null;
};

export type APIRespPostGameInviteLink = {
  inviteLink: string;
};

export type APIRespPutGameInvite = {
  newGamePath: string;
};

export type APIRespGetGameInviteLink = {
  id: string;
  user_from: APIGetAppUser;
  is_user_from_white: boolean | null;
};

export type APIGetGameInviteLink = {
  displayId: string;
};

export type APIDeleteGameInviteLink = {
  id: string;
};

export type APIPutGameInviteLink = {
  id: string;
};

export type APIRespPutGameInviteLink = {
  newGamePath: string;
};

export type APIGetUserGames = {
  id: string;
  startIdx: number;
  endIdx: number;
};

export type APIRespGetRelatedUsers = {
  friends: APIGetAppUser[];
  invited: APIGetAppUser[];
  whoInvited: APIGetAppUser[];
  blocked: APIGetAppUser[];
  type: "APIRespGetRelatedUsers";
};

export type APIRespGetSearchAlias = {
  friends: APIGetAppUser[];
  invited: APIGetAppUser[];
  whoInvited: APIGetAppUser[];
  suggestions: APIGetAppUser[];
  blocked: APIGetAppUser[];
  type: "APIRespGetSearchAlias";
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

export type EndInfo = {
  result_id: GAME_RESULTS_ID_DB;
  end_reason_id: END_REASONS_ID_DB;
};
