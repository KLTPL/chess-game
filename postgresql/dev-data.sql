/*
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
       (display_id, user_w_id, user_b_id)
VALUES ('104955a9-0221-471f-be5c-d40acfb252c9', 1, 8);

INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (1, 1, 1, 4, 6, 4, 4, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (1, 1, 2, 4, 1, 4, 3, NULL, NULL, false);

INSERT INTO game 
       (display_id, user_w_id, user_b_id, is_finished, result_id, end_reason_id, end_date)
VALUES ('1234', 1, 8, true, 1, 1, NOW());

INSERT INTO app_user
(email, name, display_name, password)
VALUES ('hubwu@email.com', 'hubwu', 'hubwu', '50397815013');

INSERT INTO app_user
(email, name, display_name, password)
VALUES ('xMajkel@email.com', 'XDDPLAYERXDD', 'xMajkel', 'WOMEN-HEHEHE');

INSERT INTO game 
       (display_id, user_w_id, user_b_id)
VALUES ('1', 10, 9);

INSERT INTO game 
       (display_id, user_w_id, user_b_id)
VALUES ('2', 9, 10);

INSERT INTO game 
       (display_id, user_w_id, user_b_id)
VALUES ('3', 1, 10);

INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (3, 1, 1, 4, 6, 4, 4, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (3, 1, 2, 4, 1, 4, 3, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (3, 3, 3, 6, 7, 5, 5, NULL, NULL, false);

INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (4, 1, 1, 4, 6, 4, 4, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (4, 1, 2, 4, 1, 4, 3, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (4, 5, 3, 3, 7, 7, 3, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (4, 1, 4, 6, 1, 6, 2, NULL, NULL, false);
INSERT INTO game_halfmove
       (game_id, piece_id, halfmove_number, pos_start_x, pos_start_y, pos_end_x, pos_end_y, king_checked_pos_x, king_checked_pos_y, is_castling)
VALUES (4, 5, 5, 7, 3, 4, 3, 4, 0, false);

INSERT INTO game_invite 
(user_from_id, user_to_id)
VALUES (12, 11);
*/

-- SELECT * FROM app_user;
-- SELECT * FROM game;
-- SELECT * FROM friend_connection;