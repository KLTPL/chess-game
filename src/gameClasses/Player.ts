import Match from "./Match.js";

export type PlayerInfo = {
  name: string, 
  image: ImageBitmap, 
  team: number, 
  timeS: number
}

export default class Player {
  name: string;
  image: ImageBitmap;
  team: number;
  points: number;
  timeS: number;
  match: Match;
  constructor( name: string, image: ImageBitmap, team: number, timeS: number, match: Match ) {
    this.name = name;
    this.image = image;
    this.team = team;
    this.points = 0;
    this.timeS = timeS;
    this.match = match;
  }

  countsPoints() {
    const board = this.match.board;
    this.points = 0;
    for( let r=0 ; r<board.el.length ; r++ ) {
      for( let c=0 ; c<board.el[r].length ; c++ ) {
        if( board.el[r][c].piece.team===this.team ) {
          this.points += board.el[r][c].piece.value;
        }
      }
    }
  }
}