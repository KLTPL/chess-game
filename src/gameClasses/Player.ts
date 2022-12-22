import Board from "./Board.js";
import Pos from "./Pos.js";
import Piece from "./Pieces/Piece.js";
import { TEAMS } from "./Pieces/Piece.js";

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

  countPoints() {
    const boardEl = this.board.el;
    this.points = 0;
    for (let r=0 ; r<boardEl.length ; r++) {
      for (let c=0 ; c<boardEl[r].length ; c++) {
        if (boardEl[r][c].piece?.team === this.team) {
          this.points += (boardEl[r][c].piece as Piece).value;
        }
      }
    }
  }

  enemyTeamNum() {
    return (
      (this.team === TEAMS.WHITE) ? 
      TEAMS.BLACK : 
      TEAMS.WHITE
    );
  }

  hasMoves() {
    const boardEl = this.board.el;
    for (let r=0 ; r<boardEl.length ; r++) {
      for (let c=0 ; c<boardEl[r].length ; c++) {
        if (boardEl[r][c].piece?.team === this.team) {
          const possMoves = (boardEl[r][c].piece as Piece).getPossibleMovesFromPos(new Pos(r, c));
          if ( //possMoves[0]: first pos is where piece is placed
            possMoves.length !== 0 &&
            (possMoves.length > 1 || 
            !possMoves[0].isEqualTo(new Pos(r, c)))
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }
}