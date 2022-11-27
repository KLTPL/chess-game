import Board from "./Board.js";
import { BoardArg } from "./Board.js";
import Player from "./Player.js";
import { PlayerArg } from "./Player.js";
import EndType from "./EndType.js";
import Move from "./Move.js";

type Players = {
  white: Player;
  black: Player;
};

export default class Match {
  gameRunning: Boolean;
  players: Players;
  board: Board;
  constructor(
    player1Arg: PlayerArg,
    player2Arg: PlayerArg,
    boardArg: BoardArg
  ) {
    this.gameRunning = true;
    this.board = new Board(
      boardArg.htmlPageContainerQSelector,
      this,
      boardArg.startPositionsOfPieces
    );
    this.players = {
      white: new Player(
        player1Arg.name,
        player1Arg.image,
        player1Arg.team,
        player1Arg.timeS,
        this.board
      ),
      black: new Player(
        player2Arg.name,
        player2Arg.image,
        player2Arg.team,
        player2Arg.timeS,
        this.board
      ),
    };
  }

  checkIfGameShouldEndAfterMove(move: Move) {
    const whiteMoved = move.piece.team === this.board.whiteNum;
    const playerWhoMadeMove = (whiteMoved) ? this.players.white : this.players.black;
    const otherKing = (!whiteMoved) ? this.board.kings.white : this.board.kings.black;
    const otherPlayer = (!whiteMoved) ? this.players.white : this.players.black;

    if (
      this.board.insufficientMaterialThatLeadsToDraw() ||
      this.board.threeMovesRepetition() ||
      this.board.noCapturesOrPawnMovesIn50Moves()
    ) {
      this.end(new EndType(playerWhoMadeMove, "draw"));
      return;
    }

    if (!otherPlayer.hasMoves()) {
      const endedWith = (otherKing.checks.length > 0) ? "check-mate" : "stale-mate";
      this.end(new EndType(playerWhoMadeMove, endedWith));
    }
  }

  end(endType?: EndType) {
    this.gameRunning = false;
    console.log(this.board.moves);
    if (endType) {
      console.log(
        `Game has ended by ${endType.cousedBy.name} with a ${endType.type}`
      ); 
    } else {
      console.log("Game ended");
    }
  }
}
