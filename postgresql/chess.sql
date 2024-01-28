/*
CREATE DATABASE chess;

CREATE TABLE dict_game_result (
  id SMALLSERIAL PRIMARY KEY,
  name VARCHAR(50)
);

INSERT INTO dict_game_result VALUES (0, 'remis');
INSERT INTO dict_game_result VALUES (1, 'wygrana białych');
INSERT INTO dict_game_result VALUES (2, 'wygrana czarnych');

CREATE TABLE dict_game_end_reason (
  id SMALLSERIAL PRIMARY KEY,
  name VARCHAR(50)
);

INSERT INTO dict_game_end_reason VALUES (1, 'mat');
INSERT INTO dict_game_end_reason VALUES (2, 'poddanie');
INSERT INTO dict_game_end_reason VALUES (3, 'przekroczenie limitu czasowego');
INSERT INTO dict_game_end_reason VALUES (10, 'pat');
INSERT INTO dict_game_end_reason VALUES (11, 'niewystarczający materiał');
INSERT INTO dict_game_end_reason VALUES (12, 'zasada 50 ruchów');
INSERT INTO dict_game_end_reason VALUES (13, '3 ruchy powtórzenia');
INSERT INTO dict_game_end_reason VALUES (14, 'remis za porozumieniem stron');

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
  password VARCHAR(100) NOT NULL,
  date_create TIMESTAMP NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  date_last_login TIMESTAMP
);

CREATE TABLE game (
  id BIGSERIAL PRIMARY KEY,
  display_id varchar(36) NOT NULL UNIQUE,
  user_id_w BIGINT NOT NULL REFERENCES app_user(id),
  user_id_b BIGINT NOT NULL REFERENCES app_user(id),
  result_id BIGINT REFERENCES dict_game_result(id),
  end_reason_id BIGINT REFERENCES dict_game_end_reason(id),
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
  piece_id BIGINT NOT NULL REFERENCES dict_piece(id),
  halfmove_number SMALLINT NOT NULL,
  pos_start_x SMALLINT NOT NULL,
  pos_start_y SMALLINT NOT NULL,
  pos_end_x SMALLINT NOT NULL,
  pos_end_y SMALLINT NOT NULL,
  king_checked_pos_x SMALLINT,
  king_checked_pos_y SMALLINT,
  is_castling BOOLEAN NOT NULL
);

INSERT INTO app_user
(email, name, display_name, password)
VALUES ('kltpl@email.com', 'kltpl', 'kltpl', '1234');

INSERT INTO app_user
(email, name, display_name, password)
VALUES ('kltpl@email.com', 'klt', 'kltpl', '1234');

INSERT INTO app_user
(email, name, display_name, password)
VALUES ('klt@email.com', 'kltpl', 'kltpl', '1234');

INSERT INTO app_user
(email, name, display_name, password)
VALUES ('klt@email.com', 'klt', 'kltpl', '1234');

INSERT INTO game 
       (display_id, user_id_w, user_id_b)
VALUES ('104955a9-0221-471f-be5c-d40acfb252c9', 1, 8);


INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (1, 1, 1, 4, 6, 4, 4, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (1, 1, 2, 4, 1, 4, 3, NULL, NULL, false);
*/

INSERT INTO game 
       (display_id, user_id_w, user_id_b, is_finished, result_id, end_reason_id, end_date)
VALUES ('1234', 1, 8, true, 1, 1, NOW());

SELECT * FROM app_user;
SELECT * FROM game;
SELECT * FROM game_halfmove;