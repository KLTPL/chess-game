import Board from "../Board.js";
import Piece, { PIECES } from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";

export default class Knight extends Piece {
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = PIECES.knight;
    this.value = 3;

  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    const directions = [
      new Dir(1,2), new Dir(1,-2), new Dir(-1,2), new Dir(-1,-2), 
      new Dir(2,1), new Dir(2,-1), new Dir(-2,1), new Dir(-2,-1)
    ];
    for (const dir of directions) {
      const newMove = new Pos(pos.y+dir.y, pos.x+dir.x);
      if (this.board.posIsInBoard(newMove)) {
        possibleMoves.push(newMove);
      }
    };
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = this.board.getKingByTeamNum(this.team);
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMovesFromPosForKnight = this.getPossibleMovesFromPosForKing(pos)
      .filter(move => this.board.el[move.y][move.x].piece.team !== this.team);
    let possibleMoves = [pos, ...possibleMovesFromPosForKnight];

    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsChecked(possibleMoves, myKing, pos);

    return possibleMoves;
  }
}