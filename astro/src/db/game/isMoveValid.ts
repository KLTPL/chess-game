import BoardModel from "../../scripts/chess-classes/board-components/model/BoardModel";
import FENNotation from "../../scripts/chess-classes/board-components/model/FENNotation";
import Pos from "../../scripts/chess-classes/board-components/model/Pos";
import PieceModel, {
  TEAMS,
} from "../../scripts/chess-classes/pieces/model/PieceModel";
import type { GetDBGameData, GetPostDBHalfmove } from "../types";
import getGameData from "./getGameData";
import { getGameDisplayId } from "./getGameDisplayId";

export default async function isMoveValid(
  halfmove: GetPostDBHalfmove
): Promise<true | { code: number; message: string }> {
  // returns true of the http status code
  try {
    const gameDisplayId = await getGameDisplayId(halfmove.game_id);
    if (gameDisplayId === null) {
      return { code: 404, message: "Game not found" };
    }
    const gameData = await getGameData(gameDisplayId);
    if (gameData === null) {
      throw new Error(
        `Found game display_id by game id, but did not managed, to get game data by game display_id. Something weird just happend`
      );
    }
    if (await validateMove(gameData, halfmove)) {
      return true;
    }
    return { code: 400, message: `Move not valid` };
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return { code: 500, message: err.message };
    }
    return { code: 500, message: "Server error" };
  }
}

async function validateMove(
  gameData: GetDBGameData,
  halfmove: GetPostDBHalfmove
): Promise<boolean> {
  try {
    const board = new BoardModel(null, gameData, null);
    await board.includeDBData.waitUntilIncludesDBData();
    const posStart = new Pos(halfmove.pos_start_y, halfmove.pos_start_x);
    const posEnd = new Pos(halfmove.pos_end_y, halfmove.pos_end_x);
    if (
      board.movesSystem.getHalfmovesAmount() + 1 !==
      halfmove.halfmove_number
    ) {
      return false;
    }
    const piece = board.getPiece(posStart);
    if (piece === null) {
      return false;
    }
    const currTeam =
      board.movesSystem.getHalfmovesAmount() % 2 === 0
        ? TEAMS.WHITE
        : TEAMS.BLACK;
    if (piece.team !== currTeam) {
      return false;
    }
    if (
      piece.id != FENNotation.convertPieceFENToId(halfmove.piece_symbol_fen)
    ) {
      return false;
    }
    const possMoves = piece.createArrOfPossibleMovesFromPos(posStart);
    const filtered = possMoves.filter(
      (move) => move.x === posEnd.x && move.y === posEnd.y
    );
    if (filtered.length === 0) {
      return false;
    }
    if (
      halfmove.promoted_to_piece_symbol_fen !== null &&
      (!PieceModel.isPawn(piece) || !piece.isPosOfPromotion(posEnd))
    ) {
      return false;
    }
    const promotedTo =
      halfmove.promoted_to_piece_symbol_fen === null
        ? null
        : FENNotation.convertPieceFENToId(
            halfmove.promoted_to_piece_symbol_fen
          );
    board.movePiece(posStart, posEnd, promotedTo, true);
    const newHalfmove = board.movesSystem.getLatestHalfmove();
    if (newHalfmove.isCastling !== halfmove.is_castling) {
      return false;
    }
    const kingCheckX =
      newHalfmove.posOfKingChecked === null
        ? null
        : newHalfmove.posOfKingChecked.x;
    const kingCheckY =
      newHalfmove.posOfKingChecked === null
        ? null
        : newHalfmove.posOfKingChecked.y;
    if (
      kingCheckX !== halfmove.king_checked_pos_x ||
      kingCheckY !== halfmove.king_checked_pos_y
    ) {
      return false;
    }

    return true;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return false;
  }
}
