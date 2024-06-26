CREATE TABLE translations (
  id SERIAL PRIMARY KEY,
  language_code VARCHAR(2) NOT NULL,  -- ISO 639-1 language code
  text_key TEXT NOT NULL,
  translated_text TEXT NOT NULL
);

CREATE TABLE translations_game_list (LIKE translations INCLUDING ALL);
INSERT INTO translations_game_list (language_code, text_key, translated_text)
VALUES
  ('pl', 'header', 'Twoje gry:'),
  ('pl', 'bar-type', 'Typ'),
  ('pl', 'bar-players', 'Gracze'),
  ('pl', 'bar-result', 'Rezultat'),
  ('pl', 'bar-moves', 'Ruchy'),
  ('pl', 'bar-date', 'Data'),
  ('pl', 'type-online', 'Online'),
  ('pl', 'result-in_progress', 'W grze'),
  ('pl', 'no_games', 'Wygląda na to, że nie zagrał_ś jeszcze ani jednej gry.'),
  ('pl', 'invite_via_link', 'Zaproś poprzez link'),
  ('en', 'invite_via_link', 'Invite via link'),
  ('pl', 'invite_friend', 'Zaproś znajomego'),
  ('en', 'header', 'Your games:'),
  ('en', 'bar-type', 'Type'),
  ('en', 'bar-players', 'Players'),
  ('en', 'bar-result', 'Result'),
  ('en', 'bar-moves', 'Moves'),
  ('en', 'bar-date', 'Date'),
  ('en', 'type-online', 'Online'),
  ('en', 'result-in_progress', 'In progress'),
  ('en', 'no_games', 'It looks like you haven''t played any games yet.'),
  ('en', 'invite_friend', 'Invite a friend');

CREATE TABLE translations_game_invite_receive (LIKE translations INCLUDING ALL);
INSERT INTO translations_game_invite_receive (language_code, text_key, translated_text)
VALUES
  ('pl', 'header', 'Zaproszenie:'),
  ('pl', 'game_type', 'Typ gry:'),
  ('pl', 'your_team', 'Twój team:'),
  ('pl', 'accept', 'Akceptuj'),
  ('pl', 'reject', 'Odrzuć'),
  ('en', 'header', 'Invitation:'),
  ('en', 'game_type', 'Game type:'),
  ('en', 'your_team', 'Your team:'),
  ('en', 'accept', 'Accept'),
  ('en', 'reject', 'Reject');

CREATE TABLE translations_game_invite_create (LIKE translations INCLUDING ALL);
INSERT INTO translations_game_invite_create (language_code, text_key, translated_text)
VALUES
  ('pl', 'open_button-play', 'Zagraj'),
  ('pl', 'open_button-invite_via_link', 'Zaproś poprzez link'),
  ('pl', 'user', 'Użytkownik:'),
  ('pl', 'rules', 'Zasady:'),
  ('pl', 'time_control', 'Czas'),
  ('pl', 'your_team', 'Team'),
  ('pl', 'button-invite', 'Zaproś'),
  ('pl', 'button-copy_link', 'Kopiuj link'),
  ('pl', 'invite_notification-success', 'Wysłano zaproszenie.'),
  ('pl', 'invite_link_notification-success', 'Skopiowano link. Zaproszenie będzie dostępne przez 15 minut.'),
  ('en', 'open_button-play', 'Play'),
  ('en', 'open_button-invite_via_link', 'Invite via link'),
  ('en', 'user', 'User:'),
  ('en', 'rules', 'Rules:'),
  ('en', 'time_control', 'Time control'),
  ('en', 'your_team', 'Team'),
  ('en', 'button-invite', 'Invite'),
  ('en', 'button-copy_link', 'Copy link'),
  ('en', 'invite_notification-success', 'Invitation sent.'),
  ('en', 'invite_link_notification-success', 'Copied link. The invitation will be available for 15 minutes.');

CREATE TABLE translations_index (LIKE translations INCLUDING ALL);
INSERT INTO translations_index (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Strona główna'),
  ('pl', 'header', 'Życie jest jak szachy'),
  ('pl', 'game_invites-header', 'Zaproszenia do gier'),
  ('pl', 'not_logged_in-header', 'Wygląda na to, że nie jesteś zalogowan_'),
  ('pl', 'not_logged_in-log_in', 'Zaloguj się lub zarejestruj, by zagrać online'),
  ('pl', 'not_logged_in-or', 'lub'),
  ('pl', 'not_logged_in-play_local', 'Zagraj grę lokalną'),
  ('en', 'page_title', 'Home'),
  ('en', 'header', 'Life is like chess'),
  ('en', 'game_invites-header', 'Game invitations'),
  ('en', 'not_logged_in-header', 'Looks like you are not logged in'),
  ('en', 'not_logged_in-log_in', 'Log in or register to play online'),
  ('en', 'not_logged_in-or', 'or'),
  ('en', 'not_logged_in-play_local', 'Play local game'),
  ('en', 'header', 'Let''s play some chess');

CREATE TABLE translations_sign_in (LIKE translations INCLUDING ALL);
INSERT INTO translations_sign_in (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Zaloguj'),
  ('pl', 'sign_in', 'Zaloguj'),
  ('pl', 'alias', 'Email lub nazwa użytkownika:'),
  ('pl', 'password', 'Hasło:'),
  ('pl', 'no_account', 'Nie masz konta? Zarejestruj się'),
  ('en', 'page_title', 'Sign in'),
  ('en', 'sign_in', 'Sign in'),
  ('en', 'alias', 'Email or username:'),
  ('en', 'password', 'Password:'),
  ('en', 'no_account', 'Don''t have an account? Sign up');

CREATE TABLE translations_sign_in_error (LIKE translations INCLUDING ALL);
INSERT INTO translations_sign_in_error (language_code, text_key, translated_text)
VALUES
  ('pl', 'error-username_or_email_not_found', 'Błędny email lub nazwa użytkownika'),
  ('pl', 'error-wrong_password', 'Błędne hasło'),
  ('en', 'error-username_or_email_not_found', 'Incorrect email or username'),
  ('en', 'error-wrong_password', 'Incorrect password');
  
CREATE TABLE translations_sign_up (LIKE translations INCLUDING ALL);
INSERT INTO translations_sign_up (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Zarejestruj'),
  ('pl', 'sign_up', 'Zarejestruj'),
  ('pl', 'email', 'Email:'),
  ('pl', 'name', 'Nazwa użytkownika:'),
  ('pl', 'display_name', 'Wyświetlana nazwa użytkownika:'),
  ('pl', 'password', 'Hasło:'),
  ('pl', 'field-optional', '[opcjonalne]'),
  ('pl', 'field-required', '[wymagane]'),
  ('pl', 'account_made', 'Masz już konto? Zaloguj się'),
  ('en', 'page_title', 'Sign up'),
  ('en', 'sign_up', 'Sign up'),
  ('en', 'email', 'Email:'),
  ('en', 'name', 'Username:'),
  ('en', 'display_name', 'Display name:'),
  ('en', 'password', 'Password:'),
  ('en', 'field-optional', '[optional]'),
  ('en', 'field-required', '[required]'),
  ('en', 'account_made', 'Already have an account? Sign in');

CREATE TABLE translations_sign_up_error (LIKE translations INCLUDING ALL);
INSERT INTO translations_sign_up_error (language_code, text_key, translated_text)
VALUES
  ('pl', 'error-username_taken', 'Nazwa użytkownika już w użyciu'),
  ('pl', 'error-email_taken', 'Email już w użyciu'),
  ('pl', 'error-email_not_valid', 'Nieprawidłowy email'),
  ('pl', 'error-username_to_long_1', 'Nazwa użytkownika musi mieć'),
  ('pl', 'error-username_to_long_2', 'znaków lub mniej'),
  ('pl', 'error-username_with_forbidden_charackters', 'Nazwa użytkownika może zawierać tylko litery, cyfry, przecinki i podłogi'),
  ('pl', 'error-display_name_to_long_1', 'Wyświetlana nazwa użytkownika musi mieć'),
  ('pl', 'error-display_name_to_long_2', 'znaków lub mniej'),
  ('pl', 'error-email_to_long_1', 'Email musi mieć'),
  ('pl', 'error-email_to_long_2', 'znaków lub mniej'),
  ('pl', 'error-password_to_long_1', 'Hasło musi mieć'),
  ('pl', 'error-password_to_long_2', 'znaków lub mniej'),
  ('en', 'error-username_taken', 'Username already in use'),
  ('en', 'error-email_taken', 'Email already in use'),
  ('en', 'error-email_not_valid', 'Invalid email'),
  ('en', 'error-username_to_long_1', 'Username must have'),
  ('en', 'error-username_to_long_2', 'characters or fewer'),
  ('en', 'error-username_with_forbidden_charackters', 'Username can only contain letters, numbers, commas, and underscores'),
  ('en', 'error-display_name_to_long_1', 'Display name must have'),
  ('en', 'error-display_name_to_long_2', 'characters or fewer'),
  ('en', 'error-email_to_long_1', 'Email must have'),
  ('en', 'error-email_to_long_2', 'characters or fewer'),
  ('en', 'error-password_to_long_1', 'Password must have'),
  ('en', 'error-password_to_long_2', 'characters or fewer');

CREATE TABLE translations_friends (LIKE translations INCLUDING ALL);
INSERT INTO translations_friends (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Znajomi'),
  ('pl', 'input_placeholder', 'Wyszukaj po nazwie lub wyświetlanej nazwie'),
  ('pl', 'card_header-friends', 'Znajomi'),
  ('pl', 'card_header-invited', 'Zaproszeni'),
  ('pl', 'card_header-who_invited', 'Ci którzy Cię zaprosili'),
  ('pl', 'card_header-blocked', 'Zablokowani'),
  ('pl', 'card_header-suggestions', 'Sugestie'),
  ('pl', 'card_button-delete', 'Usuń'),
  ('pl', 'card_button-cancel', 'Anuluj'),
  ('pl', 'card_button-accept', 'Akceptuj'),
  ('pl', 'card_button-reject', 'Odrzuć'),
  ('pl', 'card_button-invite', 'Zaproś'),
  ('en', 'page_title', 'Friends'),
  ('en', 'input_placeholder', 'Search by name or display name'),
  ('en', 'card_header-friends', 'Friends'),
  ('en', 'card_header-invited', 'Invited'),
  ('en', 'card_header-who_invited', 'Who invited you'),
  ('en', 'card_header-blocked', 'Blocked'),
  ('en', 'card_header-suggestions', 'Suggestions'),
  ('en', 'card_button-delete', 'Delete'),
  ('en', 'card_button-cancel', 'Cancel'),
  ('en', 'card_button-accept', 'Accept'),
  ('en', 'card_button-reject', 'Reject'),
  ('en', 'card_button-invite', 'Invite');


CREATE TABLE translations_online (LIKE translations INCLUDING ALL);
INSERT INTO translations_online (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Online'),
  ('pl', 'button_invite_link', 'Zaproś poprzez link'),
  ('en', 'page_title', 'Online'),
  ('en', 'button_invite_link', 'Invite via link');

CREATE TABLE translations_game_invite_link (LIKE translations INCLUDING ALL);
INSERT INTO translations_game_invite_link (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Zaproszenie do gry od'),
  ('en', 'page_title', 'Game invitation from');

CREATE TABLE translations_game_end_info (LIKE translations INCLUDING ALL);
-- all values from text_key with 'result-[value]' or 'reason-[value]' format are the same as corresponding value in 
  --  main.sql -> 
  --  dict_game_result or dict_game_end_reason ->
  --  'name' row
INSERT INTO translations_game_end_info (language_code, text_key, translated_text)
VALUES
  ('pl', 'result-white_win', 'Wygrana białych'),
  ('pl', 'result-black_win', 'Wygrana czarnych'),
  ('pl', 'result-draw', 'Remis'),
  ('pl', 'reason', 'Powód:'),
  ('pl', 'reason-checkmate', 'mat'),
  ('pl', 'reason-resignation', 'poddanie'),
  ('pl', 'reason-timeout', 'przekroczenie limitu czasowego'),
  ('pl', 'reason-stalemate', 'pat'),
  ('pl', 'reason-insufficient_material', 'niewystarczający materiał'),
  ('pl', 'reason-50_move_rule', 'zasada 50 ruchów'),
  ('pl', 'reason-repetition', '3 ruchy powtórzenia'),
  ('pl', 'reason-agreement', 'remis za porozumieniem'),
  ('en', 'result-white_win', 'White wins'),
  ('en', 'result-black_win', 'Black wins'),
  ('en', 'result-draw', 'Draw'),
  ('en', 'reason', 'Reason:'),
  ('en', 'reason-checkmate', 'checkmate'),
  ('en', 'reason-resignation', 'resignation'),
  ('en', 'reason-timeout', 'timeout'),
  ('en', 'reason-stalemate', 'stalemate'),
  ('en', 'reason-insufficient_material', 'insufficient material'),
  ('en', 'reason-50_move_rule', '50-move rule'),
  ('en', 'reason-repetition', 'threefold repetition'),
  ('en', 'reason-agreement', 'draw by agreement');

CREATE TABLE translations_local (LIKE translations INCLUDING ALL);
INSERT INTO translations_local (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Gra lokalna'),
  ('pl', 'game-type', 'Lokalna'),
  ('pl', 'player-white', 'białe'),
  ('pl', 'player-black', 'czarne'),
  ('en', 'page_title', 'Local game'),
  ('en', 'game-type', 'Local'),
  ('en', 'player-white', 'white'),
  ('en', 'player-black', 'black');

CREATE TABLE translations_online_game (LIKE translations INCLUDING ALL);
INSERT INTO translations_online_game (language_code, text_key, translated_text)
VALUES
  ('pl', 'page_title', 'Gra online'),
  ('pl', 'game-type', 'Online'),
  ('en', 'page_title', 'Online game'),
  ('en', 'game-type', 'Online');

CREATE TABLE translations_navbar (LIKE translations INCLUDING ALL);
INSERT INTO translations_navbar (language_code, text_key, translated_text)
VALUES
  ('pl', 'nav-online', 'Online'),
  ('pl', 'nav-local', 'Lokalnie'),
  ('pl', 'nav-friends', 'Znajomi'),
  ('pl', 'auth-sign_in', 'Zaloguj'),
  ('pl', 'auth-sign_up', 'Zarejestruj'),
  ('pl', 'auth-log_out', 'Wyloguj'),
  ('en', 'nav-online', 'Online'),
  ('en', 'nav-local', 'Local'),
  ('en', 'nav-friends', 'Friends'),
  ('en', 'auth-sign_in', 'Sign in'),
  ('en', 'auth-sign_up', 'Sign up'),
  ('en', 'auth-log_out', 'Log out');