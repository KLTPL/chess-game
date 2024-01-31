import Board from "./board-components/Board";
import Player from "./Player";
import Halfmove from "./Halfmove";
import { TEAMS } from "./pieces/Piece";
import {
  END_REASONS_ID_DB,
  GAME_RESULTS_ID_DB,
  type GetDBGameData,
  type PutDBGame,
} from "../../db/types";
import FetchToDB from "./board-components/FetchToDB";

type Players = {
  white: Player;
  black: Player;
};

export type BoardArg = {
  htmlPageContainerQSelector: string;
  DBGameData?: GetDBGameData;
  customPositionFEN: string | null;
};

export type EndInfo = Pick<PutDBGame, "result_id" | "end_reason_id"> &
  Partial<Pick<PutDBGame, "id">>;
// export type EndInfo = PutDBGame | Omit<PutDBGame, "id">;

export default class Match {
  public isGameRunning: Boolean = true;
  public players: Players;
  public endInfo: EndInfo | null = null;
  private board: Board;
  constructor(boardArg: BoardArg, DBGameData?: GetDBGameData) {
    this.board = new Board(
      boardArg.htmlPageContainerQSelector,
      boardArg.customPositionFEN,
      DBGameData,
      this
    );
    this.players = {
      white: new Player(TEAMS.WHITE, DBGameData),
      black: new Player(TEAMS.BLACK, DBGameData),
    };
  }

  public checkIfGameShouldEndAfterMove(move: Halfmove): void {
    const otherKing = this.board.getKingByTeam(move.piece.enemyTeamNum);
    const dbGameId =
      this.board.fetchToDB === null ? undefined : this.board.fetchToDB.game_id;

    if (this.board.isDrawByInsufficientMaterial()) {
      this.end({
        id: dbGameId,
        end_reason_id: END_REASONS_ID_DB.INSUFFICENT,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      });
      return;
    }
    if (this.board.isDrawByThreeMovesRepetition()) {
      this.end({
        id: dbGameId,
        end_reason_id: END_REASONS_ID_DB.REPETITION,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      });
      return;
    }
    if (this.board.isDrawByNoCapturesOrPawnMovesIn50Moves()) {
      this.end({
        id: dbGameId,
        end_reason_id: END_REASONS_ID_DB.MOVE_RULE_50,
        result_id: GAME_RESULTS_ID_DB.DRAW,
      });
      return;
    }

    if (!this.board.isPlayerAbleToMakeMove(move.piece.enemyTeamNum)) {
      if (otherKing.isInCheck()) {
        const resultId = move.piece.isWhite()
          ? GAME_RESULTS_ID_DB.WHITE
          : GAME_RESULTS_ID_DB.BLACK;
        this.end({
          id: dbGameId,
          end_reason_id: END_REASONS_ID_DB.CHECKMATE,
          result_id: resultId,
        });
      } else {
        const resultId = !move.piece.isWhite()
          ? GAME_RESULTS_ID_DB.WHITE
          : GAME_RESULTS_ID_DB.BLACK;
        this.end({
          id: dbGameId,
          end_reason_id: END_REASONS_ID_DB.STALEMATE,
          result_id: resultId,
        });
      }
    }
  }

  public end(endInfo: EndInfo): void {
    this.isGameRunning = false;
    this.endInfo = endInfo;
    this.board.showEventsOnBoard.turnOfCssGrabOnPieces();
    console.log("half moves: ", this.board.movesSystem.halfmoves);

    if (endInfo.id !== undefined) {
      this.board.fetchToDB?.putGameStatus(endInfo as PutDBGame);
    }

    console.log("Koniec gry");
    this.printEndInfo(endInfo);
  }

  private async printEndInfo(endInfo: EndInfo) {
    try {
      const resultName = await FetchToDB.getResultName(endInfo.result_id);
      const endReasonName = await FetchToDB.getEndReasonName(
        endInfo.end_reason_id
      );
      console.log(
        `Gra zakończyła się. Wynik: ${resultName}, powód: ${endReasonName}`
      );
    } catch (err) {
      console.error(err);
    }
  }
}
