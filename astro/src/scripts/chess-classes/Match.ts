import Board, { type CastlingRights } from "./board-components/Board";
import Player from "./Player";
import Halfmove from "./Halfmove";
import { TEAMS } from "./pieces/Piece";
import type { DBGameData } from "../../db/types";

type EndInfo = {
  cousedBy: Player | null;
  endReasonName: string;
  resultName: string;
};
type Players = {
  white: Player;
  black: Player;
};

export type BoardArg = {
  htmlPageContainerQSelector: string;
  DBGameData?: DBGameData;
  customPositionFEN: string | null;
};

export default class Match {
  public isGameRunning: Boolean = true;
  public players: Players;
  private board: Board;
  constructor(boardArg: BoardArg, DBGameData?: DBGameData) {
    this.board = new Board(
      boardArg.htmlPageContainerQSelector,
      boardArg.customPositionFEN,
      DBGameData,
      this
    );
    this.players = {
      white: new Player(
        TEAMS.WHITE,
        DBGameData
      ),
      black: new Player(
        TEAMS.BLACK,
        DBGameData
      ),
    };
  }

  public checkIfGameShouldEndAfterMove(move: Halfmove): void {
    const isItWhitesMove = move.piece.isWhite();
    const playerWhoMadeMove = isItWhitesMove
      ? this.players.white
      : this.players.black;
    const otherKing = this.board.getKingByTeam(move.piece.enemyTeamNum);

    if (
      this.board.isDrawByInsufficientMaterial() ||
      this.board.isDrawByThreeMovesRepetition() ||
      this.board.isDrawByNoCapturesOrPawnMovesIn50Moves()
    ) {
      this.end({
        cousedBy: playerWhoMadeMove,
        resultName: "remis",
        endReasonName: "nie wiadomo",
      });
      return;
    }
    if (!this.board.isPlayerAbleToMakeMove(move.piece.enemyTeamNum)) {
      if (otherKing.isInCheck()) {
        const resultName = move.piece.isWhite()
          ? "wygrana białych"
          : "wygrana czarnych";
        this.end({
          cousedBy: playerWhoMadeMove,
          endReasonName: "mat",
          resultName,
        });
      } else {
        const resultName = !move.piece.isWhite()
          ? "wygrana białych"
          : "wygrana czarnych";
        this.end({
          cousedBy: playerWhoMadeMove,
          endReasonName: "pat",
          resultName,
        });
      }
    }
  }

  public end(endType?: EndInfo): void {
    this.isGameRunning = false;
    this.board.showEventsOnBoard.turnOfCssGrabOnPieces();
    console.log("half moves: ", this.board.movesSystem.halfmoves);
    if (endType !== undefined) {
      console.log(
        `Gra zakończyła się. Gracz: ${endType.cousedBy?.displayName}, wynik: ${endType.resultName}, powód: ${endType.endReasonName}`
      );
    } else {
      console.log("Koniec gry");
    }
  }
}
