-- CREATE DATABASE chess ENCODING UTF8;

CREATE TABLE dict_game_result (
  id SMALLSERIAL PRIMARY KEY,
  name VARCHAR(50)
  -- all name values are the same as corresponding value in 
  --  languages.sql -> 
  --  translations_game_end_info ->
  --  text_key format: result-[dict_game_result.name]
);

INSERT INTO dict_game_result VALUES (0, 'draw');
INSERT INTO dict_game_result VALUES (1, 'white_win');
INSERT INTO dict_game_result VALUES (2, 'black_win');

CREATE TABLE dict_game_end_reason (
  id SMALLSERIAL PRIMARY KEY,
  name VARCHAR(50) 
  -- all name values are the same as corresponding value in 
  --  languages.sql -> 
  --  translations_game_end_info ->
  --  text_key format: reason-[dict_game_end_reason.name]
);


INSERT INTO dict_game_end_reason VALUES (1, 'checkmate'); 
INSERT INTO dict_game_end_reason VALUES (2, 'resignation');
INSERT INTO dict_game_end_reason VALUES (3, 'timeout');
INSERT INTO dict_game_end_reason VALUES (10, 'stalemate');
INSERT INTO dict_game_end_reason VALUES (11, 'insufficient_material');
INSERT INTO dict_game_end_reason VALUES (12, '50_move_rule');
INSERT INTO dict_game_end_reason VALUES (13, 'repetition');
INSERT INTO dict_game_end_reason VALUES (14, 'agreement');

CREATE TABLE dict_piece (
  id SMALLSERIAL PRIMARY KEY,
  symbol_FEN VARCHAR(1),
  name VARCHAR(10)
);

INSERT INTO dict_piece VALUES (1, 'p', 'pion');
INSERT INTO dict_piece VALUES (2, 'r', 'wieża');
INSERT INTO dict_piece VALUES (3, 'n', 'skoczek');
INSERT INTO dict_piece VALUES (4, 'b', 'goniec');
INSERT INTO dict_piece VALUES (5, 'q', 'hetman');
INSERT INTO dict_piece VALUES (6, 'k', 'król');

CREATE TABLE app_user (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(50) NOT NULL,
  password VARCHAR(128) NOT NULL,
  password_salt VARCHAR(32) NOT NULL,
  date_create TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  date_last_login TIMESTAMP
);

CREATE TABLE game (
  id BIGSERIAL PRIMARY KEY,
  display_id varchar(36) NOT NULL UNIQUE,
  user_w_id BIGINT NOT NULL REFERENCES app_user(id),
  user_b_id BIGINT NOT NULL REFERENCES app_user(id),
  result_id SMALLINT REFERENCES dict_game_result(id),
  end_reason_id SMALLINT REFERENCES dict_game_end_reason(id),
  is_finished BOOLEAN NOT NULL DEFAULT false,
  start_date TIMESTAMP NOT NULL DEFAULT NOW(),
  end_date TIMESTAMP,
  castling_w_k BOOLEAN NOT NULL DEFAULT true,
  castling_w_q BOOLEAN NOT NULL DEFAULT true,
  castling_b_k BOOLEAN NOT NULL DEFAULT true,
  castling_b_q BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE game_halfmove (
  id BIGSERIAL PRIMARY KEY,
  game_id BIGINT NOT NULL REFERENCES game(id),
  piece_id SMALLINT NOT NULL REFERENCES dict_piece(id),
  halfmove_number SMALLINT NOT NULL,
  pos_start_x SMALLINT NOT NULL,
  pos_start_y SMALLINT NOT NULL,
  pos_end_x SMALLINT NOT NULL,
  pos_end_y SMALLINT NOT NULL,
  king_checked_pos_x SMALLINT,
  king_checked_pos_y SMALLINT,
  is_castling BOOLEAN NOT NULL,
  promoted_to_piece_id SMALLINT REFERENCES dict_piece(id)
);

CREATE TABLE friend_connection (
  id BIGSERIAL PRIMARY KEY,
  user_1_id BIGINT NOT NULL REFERENCES app_user(id),
  user_2_id BIGINT NOT NULL REFERENCES app_user(id),
  create_timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE friend_invite (
  id BIGSERIAL PRIMARY KEY,
  user_from_id BIGINT NOT NULL REFERENCES app_user(id),
  user_to_id BIGINT NOT NULL REFERENCES app_user(id),
  create_timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE game_invite (
  id BIGSERIAL PRIMARY KEY,
  user_from_id BIGINT NOT NULL REFERENCES app_user(id),
  user_to_id BIGINT NOT NULL REFERENCES app_user(id),
  create_timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  is_user_from_white BOOLEAN
);

CREATE TABLE game_invite_link (
  id BIGSERIAL PRIMARY KEY,
  display_id varchar(36) NOT NULL UNIQUE,
  user_from_id BIGINT NOT NULL REFERENCES app_user(id),
  is_user_from_white BOOLEAN,
  create_timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);