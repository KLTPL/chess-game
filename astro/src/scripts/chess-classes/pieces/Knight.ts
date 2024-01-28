import Board from "../board-components/Board";
import Piece, { PIECES, TEAMS } from "./Piece";
import Pos from "../Pos";
import Dir from "../Dir";

export default class Knight extends Piece {
  public value: number = 3;
  public id: PIECES = PIECES.KNIGHT;
  constructor(
    readonly team: TEAMS,
    protected board: Board
  ) {
    super(team, board);
    this.addClassName(this.id);
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const directions = [
      new Dir(1, 2),
      new Dir(1, -2),
      new Dir(-1, 2),
      new Dir(-1, -2),
      new Dir(2, 1),
      new Dir(2, -1),
      new Dir(-2, 1),
      new Dir(-2, -1),
    ];

    return directions
      .map((dir) => new Pos(pos.y + dir.y, pos.x + dir.x))
      .filter((pos) => Board.isPosIn(pos));
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const myKing = this.board.getKingByTeam(this.team);
    const absPins = myKing.createArrOfAbsolutePins();

    let possibleMoves = [pos, ...this.createArrOfNormalMoves(pos)];
    possibleMoves = this.substractAbsPinsFromPossMoves(
      possibleMoves,
      absPins,
      pos
    );
    possibleMoves = this.removePossMovesIfKingIsInCheck(
      possibleMoves,
      myKing,
      pos
    );

    return possibleMoves;
  }

  private createArrOfNormalMoves(pos: Pos): Pos[] {
    return this.createArrOfPossibleMovesFromPosForKing(pos).filter(
      (move) => this.board.getPiece(move)?.team !== this.team
    );
  }
}
