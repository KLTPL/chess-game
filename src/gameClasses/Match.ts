import Board from "./Board.js";
import { BoardArg } from "./Board.js";
import Player from "./Player.js";
import { PlayerArg } from "./Player.js";
import Move from "./Move.js";
import { TEAMS } from "./Pieces/Piece.js";

type EndInfo = {
  cousedBy: Player;
  type: string;
}

type Players = {
  white: Player;
  black: Player;
};

export default class Match {
  public gameRunning: Boolean;
  public players: Players;
  private board: Board;
  constructor(
    player1Arg: PlayerArg,
    player2Arg: PlayerArg,
    boardArg: BoardArg
  ) {
    this.gameRunning = true;
    this.board = this.createNewBoardObj(boardArg);
    this.players = this.createNewPlayersObj(player1Arg, player2Arg);
  }

  private createNewBoardObj(boardArg: BoardArg): Board {
    return new Board(
      boardArg.htmlPageContainerQSelector,
      boardArg.customPositionFEN,
      this,
      );
  }

  private createNewPlayersObj(player1Arg: PlayerArg, player2Arg: PlayerArg): Players {
    return {
      white: new Player(
        player1Arg.image,
        player1Arg.name,
        player1Arg.team,
        player1Arg.timeS,
        this.board
      ),
      black: new Player(
        player2Arg.image,
        player2Arg.name,
        player2Arg.team,
        player2Arg.timeS,
        this.board
      ),
    };
  }

  public checkIfGameShouldEndAfterMove(move: Move): void {
    const whiteMoved = (move.piece.team === TEAMS.WHITE);
    const playerWhoMadeMove = (whiteMoved) ? this.players.white : this.players.black;
    const otherKing = (!whiteMoved) ? this.board.getKingByTeam(TEAMS.WHITE) : this.board.getKingByTeam(TEAMS.WHITE);
    const otherPlayer = (!whiteMoved) ? this.players.white : this.players.black;

    if (
      this.board.isDrawByInsufficientMaterial() ||
      this.board.isDrawByThreeMovesRepetition() ||
      this.board.isDrawByNoCapturesOrPawnMovesIn50Moves()
    ) {
      this.end({cousedBy: playerWhoMadeMove, type: "draw"});
      return;
    }
    if (!otherPlayer.isAbleToMakeMove()) {
      const endType = (otherKing.checks.length > 0) ? "check-mate" : "stale-mate";
      this.end({cousedBy: playerWhoMadeMove, type: endType});
    }
  }

  public end(endType?: EndInfo): void {
    this.gameRunning = false;
    this.board.removeEventListenersFromPieces();
    console.log("moves: ",this.board.moves);
    if (endType !== undefined) {
      console.log(
        `Game has ended by ${endType.cousedBy.name} with a ${endType.type}`
      ); 
    } else {
      console.log("Game ended");
    }
  }
}
