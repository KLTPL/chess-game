import Board from "./Board.js";
import { BoardInfo } from "./Board.js";
import Player from "./Player.js";
import { PlayerInfo } from "./Player.js";
import EndType from "./EndType.js";
import Move from "./Move.js";
import Pos from "./Pos.js";

type Players = {
  white: Player,
  black: Player
};
export default class Match {
  gameRunning: Boolean;
  players: Players;
  board: Board;
  constructor(player1Info: PlayerInfo, player2Info: PlayerInfo, boardInfo: BoardInfo) {
    this.gameRunning = true;
    this.board = new Board(boardInfo.htmlQSelector, boardInfo.htmlPageContainerQSelector, boardInfo.teamPerspectiveNum, this, boardInfo.startPositionsOfPieces);
    this.players = {
      white: new Player(player1Info.name, player1Info.image, player1Info.team, player1Info.timeS, this.board),
      black: new Player(player2Info.name, player2Info.image, player2Info.team, player2Info.timeS, this.board)
    };

  }

  checkIfGameShouldEndAfterMove(move: Move) {
    const movingPiecesKing = (move.piece.team===this.board.whiteNum) ? this.board.kings.black : this.board.kings.white;
    const playerWhoMadeMove = (move.piece.team===this.board.whiteNum) ? this.players.white : this.players.black;
    const otherKing = (move.piece.team!==this.board.whiteNum) ? this.board.kings.black : this.board.kings.white;
    const othePlayer = (move.piece.team!==this.board.whiteNum) ? this.players.white : this.players.black;

    if( this.board.onlyTwoKingsLeft() ) {
      this.end(new EndType(playerWhoMadeMove, "draw"));
      return;
    }

    if( !playerWhoMadeMove.hasMoves() && movingPiecesKing.checks.length>0 ) {
      this.end(new EndType(playerWhoMadeMove, "check-mate"));
      return;
    }

    if( !othePlayer.hasMoves() && otherKing.checks.length===0 ) {
      this.end(new EndType(playerWhoMadeMove, "stale-mate"));
      return;
    }
  }

  end( endType: EndType ) {
    this.gameRunning = false;
    console.log(`Game has ended by ${endType.cousedBy.name} with a ${endType.type}`);
  }
}