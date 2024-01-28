import type { DBGameData } from "../../db/types";
import { TEAMS } from "./pieces/Piece";

export default class Player {
  readonly name: string;
  readonly displayName: string;
  // private image: null;
  constructor(
    readonly team: TEAMS,
    DBGameData: DBGameData | undefined
    // image: ImageBitmap | null,
  ) {
    if (DBGameData === undefined) {
      this.name = this.team === TEAMS.WHITE ? "white" : "black";
      this.displayName = this.team === TEAMS.WHITE ? "white" : "black";
    } else {
      this.name =
        this.team === TEAMS.WHITE
          ? DBGameData.game.user_w_name
          : DBGameData.game.user_b_name;
      this.displayName =
        this.team === TEAMS.WHITE
          ? DBGameData.game.user_w_display_name
          : DBGameData.game.user_b_display_name;
    }
  }

  // public getImage(image: ImageBitmap): ImageBitmap {
  //   return this.image;
  // }

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
}
