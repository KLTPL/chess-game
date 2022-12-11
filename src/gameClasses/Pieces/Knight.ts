import Board from "../Board.js";
import Piece, { PIECES } from "./Piece.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";

export default class Knight extends Piece {
  constructor(team: number, board: Board) {
    super(team, board);
    this.num = PIECES.knight;
    this.value = 3;

    this.addClassName(this.num);
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    const directions = [
      new Dir(1,2), new Dir(1,-2), new Dir(-1,2), new Dir(-1,-2), 
      new Dir(2,1), new Dir(2,-1), new Dir(-2,1), new Dir(-2,-1)
    ];

    return directions
      .map(dir => new Pos(pos.y+dir.y, pos.x+dir.x))
      .filter(pos => this.board.isPosInBoard(pos));
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = this.board.getKingByTeam(this.team);
    const absPins = myKing.getPossitionsOfAbsolutePins();

    let possibleMoves = [pos, ...this.createArrOfNormalMoves(pos)];
    possibleMoves = this.substractAbsPinsFromPossMoves(possibleMoves, absPins, pos);
    possibleMoves = this.removePossMovesIfKingIsInCheck(possibleMoves, myKing, pos);

    return possibleMoves;
  }

  createArrOfNormalMoves(pos: Pos) {
    return this.getPossibleMovesFromPosForKing(pos)
      .filter(move => this.board.el[move.y][move.x].piece?.team !== this.team);
  }
}