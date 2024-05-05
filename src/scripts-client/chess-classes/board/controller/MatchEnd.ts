import {
  END_REASONS_ID_DB,
  GAME_RESULTS_ID_DB,
  type EndInfo,
} from "../../../../db/types";
import type BoardModel from "../model/BoardModel";

export default class MatchEnd {
  constructor() {}

  public static checkIfGameShouldEndAfterMove(b: BoardModel): EndInfo | false {
    const latestHalfmove = b.movesSystem.getLatestHalfmove();
    const otherKing = b.getKingByTeam(latestHalfmove.piece.enemyTeamNum);

    if (b.isDrawByInsufficientMaterial()) {
      return {
        end_reason_id: END_REASONS_ID_DB.INSUFFICENT,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      };
    }
    if (b.isDrawByThreeMovesRepetition()) {
      return {
        end_reason_id: END_REASONS_ID_DB.REPETITION,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      };
    }
    if (b.isDrawByNoCapturesOrPawnMovesIn50Moves()) {
      return {
        end_reason_id: END_REASONS_ID_DB.MOVE_RULE_50,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      };
    }

    if (!b.isPlayerAbleToMakeMove(latestHalfmove.piece.enemyTeamNum)) {
      const isWhite = latestHalfmove.piece.isWhite();
      if (otherKing.isInCheck()) {
        const resultId = isWhite
          ? GAME_RESULTS_ID_DB.WHITE
          : GAME_RESULTS_ID_DB.BLACK;
        return {
          end_reason_id: END_REASONS_ID_DB.CHECKMATE,
          result_id: resultId,
        };
      } else {
        const resultId = !isWhite
          ? GAME_RESULTS_ID_DB.WHITE
          : GAME_RESULTS_ID_DB.BLACK;
        return {
          end_reason_id: END_REASONS_ID_DB.STALEMATE,
          result_id: resultId,
        };
      }
    }
    return false;
  }
}
