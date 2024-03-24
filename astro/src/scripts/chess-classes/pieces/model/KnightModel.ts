import BoardModel from "../../board-components/model/BoardModel";
import { PIECES, TEAMS } from "./PieceModel";
import Pos from "../../board-components/model/Pos";
import Dir from "../../board-components/model/Dir";
import PieceModel from "./PieceModel";

export default class KnightModel extends PieceModel {
  readonly value: number = 3;
  readonly id: PIECES = PIECES.KNIGHT;
  constructor(
    readonly team: TEAMS,
    protected boardModel: BoardModel
  ) {
    super(team, boardModel);
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
      .filter((pos) => BoardModel.isPosInBounds(pos));
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const myKing = this.boardModel.getKingByTeam(this.team);
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
      (move) => this.boardModel.getPiece(move)?.team !== this.team
    );
  }
}
