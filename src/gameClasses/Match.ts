import Board from "./Board.js";
import { BoardInfo } from "./Board.js";
import Player from "./Player.js";
import { PlayerInfo } from "./Player.js";
import EndType from "./EndType.js";

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
    this.players = {
      white: new Player(player1Info.name, player1Info.image, player1Info.team, player1Info.timeS, this),
      black: new Player(player2Info.name, player2Info.image, player2Info.team, player2Info.timeS, this)
    };
    this.board = new Board(boardInfo.htmlQSelector, boardInfo.htmlPageContainerQSelector, boardInfo.teamPerspectiveNum, this, boardInfo.startPositionsOfPieces);

  }

  end( endType: EndType ) {
    this.gameRunning = false;
    console.log(`Game has ended by ${endType.cousedBy.name} with a ${endType.type}`);
  }
}