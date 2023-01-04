import Board from "./Board.js";
import Pos from "./Pos.js";
import Piece from "./Pieces/Piece.js";
import { TEAMS } from "./Pieces/Piece.js";

export default class Player {
  public image: null;
  public points: number = 0;
  constructor(
    image: ImageBitmap | null, 
    public name: string, 
    public team: TEAMS, 
    public timeS: number, 
    private board: Board
  ) {
    this.image = this.getImage(image);
  }

  private getImage(image: ImageBitmap | null): null {
    image
    // return image == null ?
    return null;
  }

  // private countPoints(): void {
  //   const boardEl = this.board.el;
  //   this.points = 0;
  //   for (let r=0 ; r<boardEl.length ; r++) {
  //     for (let c=0 ; c<boardEl[r].length ; c++) {
  //       if (boardEl[r][c].piece?.team === this.team) {
  //         this.points += (boardEl[r][c].piece as Piece).value;
  //       }
  //     }
  //   }
  // }

  public isAbleToMakeMove(): boolean {
    const boardEl = this.board.el;
    for (let r=0 ; r<boardEl.length ; r++) {
      for (let c=0 ; c<boardEl[r].length ; c++) {
        if (boardEl[r][c].piece?.team === this.team) {
          const possMoves = (boardEl[r][c].piece as Piece).createArrOfPossibleMovesFromPos(new Pos(r, c));
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