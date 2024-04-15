import MatchEnd from "../../scripts/chess-classes/board/controller/MatchEnd";
import BoardModel from "../../scripts/chess-classes/board/model/BoardModel";
import FENNotation from "../../scripts/chess-classes/board/model/FENNotation";
import Pos from "../../scripts/chess-classes/board/model/Pos";
import PieceModel, {
  TEAMS,
} from "../../scripts/chess-classes/pieces/model/PieceModel";
import type { GetDBGameData, GetPostDBHalfmove, EndInfo } from "../types";
import getGameData from "./getGameData";

type isMoveValidRet = {
  errData?: { code: number; message: string };
  endInfo?: EndInfo;
};

export default async function isMoveValid(
  halfmove: GetPostDBHalfmove,
  displayId: string
): Promise<isMoveValidRet> {
  // returns true of the http status code
  try {
    const gameData = await getGameData(displayId);
    if (gameData === null) {
      return { errData: { code: 400, message: `Move not valid` } };
    }

    const ret = await validateMove(gameData, halfmove);
    if (!ret.ok) {
      return { errData: { code: 400, message: `Move not valid` } };
    }
    return { endInfo: ret.endInfo };
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
      return { errData: { code: 500, message: err.message } };
    }
    return { errData: { code: 500, message: "Server error" } };
  }
}

type ValidateMoveRet = {
  ok: boolean;
  endInfo?: EndInfo;
};

async function validateMove(
  gameData: GetDBGameData,
  halfmove: GetPostDBHalfmove
): Promise<ValidateMoveRet> {
  try {
    const board = new BoardModel(null, gameData, null);
    await board.includeDBData.waitUntilIncludesDBData();
    const posStart = new Pos(halfmove.pos_start_y, halfmove.pos_start_x);
    const posEnd = new Pos(halfmove.pos_end_y, halfmove.pos_end_x);
    if (
      board.movesSystem.getHalfmovesAmount() + 1 !==
      halfmove.halfmove_number
    ) {
      return { ok: false };
    }
    const piece = board.getPiece(posStart);
    if (piece === null) {
      return { ok: false };
    }
    const currTeam =
      board.movesSystem.getHalfmovesAmount() % 2 === 0
        ? TEAMS.WHITE
        : TEAMS.BLACK;
    if (piece.team !== currTeam) {
      return { ok: false };
    }
    if (
      piece.id != FENNotation.convertPieceFENToId(halfmove.piece_symbol_fen)
    ) {
      return { ok: false };
    }
    const possMoves = piece.createArrOfPossibleMovesFromPos(posStart);
    const filtered = possMoves.filter(
      (move) => move.x === posEnd.x && move.y === posEnd.y
    );
    if (filtered.length === 0) {
      return { ok: false };
    }
    if (
      halfmove.promoted_to_piece_symbol_fen !== null &&
      (!PieceModel.isPawn(piece) || !piece.isPosOfPromotion(posEnd))
    ) {
      return { ok: false };
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
      return { ok: false };
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
      return { ok: false };
    }
    const ret: ValidateMoveRet = { ok: true };
    const endInfo = MatchEnd.checkIfGameShouldEndAfterMove(board);
    if (endInfo !== false) {
      ret.endInfo = endInfo;
    }
    return ret;
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    return { ok: false };
  }
}
