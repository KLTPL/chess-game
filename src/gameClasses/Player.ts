import Board from "./Board.js";
import Pos from "./Pos.js";

export type PlayerArg = {
  name: string, 
  image: ImageBitmap | null, 
  team: number, 
  timeS: number
}

export default class Player {
  name: string;
  image: null;
  team: number;
  points: number;
  timeS: number;
  board: Board;
  constructor(
    name: string, 
    image: ImageBitmap | null, 
    team: number, 
    timeS: number, 
    board: Board
  ) {
    this.name = name;
    this.image = this.getImage(image);
    this.team = team;
    this.points = 0;
    this.timeS = timeS;
    this.board = board;
  }

  getImage(image: ImageBitmap | null) {
    image
    // return image == null ?
    return null;
  }

  countsPoints() {
    const board = this.board;
    this.points = 0;
    for( let r=0 ; r<board.el.length ; r++ ) {
      for( let c=0 ; c<board.el[r].length ; c++ ) {
        if( board.el[r][c].piece.team === this.team ) {
          this.points += board.el[r][c].piece.value;
        }
      }
    }
  }

  enemyTeamNum() {
    return (this.team === this.board.whiteNum) ? 
    this.board.blackNum : 
    this.board.whiteNum;
  }

  hasMoves() {
    const boardEl = this.board.el;
    for (let r=0 ; r<boardEl.length ; r++) {
      for (let c=0 ; c<boardEl[r].length ; c++) {
        if( 
          boardEl[r][c].piece.team === this.team && 
          boardEl[r][c].piece.getPossibleMovesFromPos(new Pos(r, c)).length > 1
        ) {
          return true;
        }
      }
    }
    return false;
  }
}