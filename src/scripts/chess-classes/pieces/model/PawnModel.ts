import BoardModel, { FIELDS_IN_ONE_ROW } from "../../board/model/BoardModel";
import PieceModel, { PIECES, TEAMS } from "./PieceModel";
import Pos from "../../board/model/Pos";

export default class PawnModel extends PieceModel {
  readonly value: number = 1;
  readonly id: PIECES = PIECES.PAWN;
  private directionY: number;
  constructor(
    readonly team: TEAMS,
    protected boardModel: BoardModel
  ) {
    super(team, boardModel);
    this.directionY = this.isWhite() ? -1 : 1; // direction up or down
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const capturePos = [
      new Pos(pos.y + this.directionY, pos.x + 1),
      new Pos(pos.y + this.directionY, pos.x - 1),
    ].filter((capture) => BoardModel.isPosInBounds(capture));
    return capturePos;
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const myKing = this.boardModel.getKingByTeam(this.team);
    const absPins = myKing.createArrOfAbsolutePins();

    const enPassantPawns =
      this.createArrOfPosOfPawnsThatCanBeCapturedByEnPassant(pos);
    const enPassantCaptures = enPassantPawns.map(
      (capturePos) => new Pos(pos.y + this.directionY, capturePos.x)
    );
    let possibleMoves: Pos[] = [
      pos,
      ...this.createArrOfNormalMoves(pos),
      ...enPassantCaptures,
    ];
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
    const board = this.boardModel;
    const enemyTeamNum = this.enemyTeamNum;
    const capturePos = this.createArrOfPossibleMovesFromPosForKing(pos).filter(
      (move) => board.getPiece(move)?.team === enemyTeamNum
    );

    const moves: Pos[] = [];
    const newPos = new Pos(pos.y + this.directionY, pos.x);
    if (board.getPiece(newPos) === null) {
      // forward and double forward
      moves.push(newPos);
      const pawnStartRow = this.directionY === 1 ? 1 : FIELDS_IN_ONE_ROW - 2;
      const newPos2 = new Pos(pos.y + this.directionY * 2, pos.x);
      if (
        pos.y === pawnStartRow &&
        BoardModel.isPosInBounds(newPos2) &&
        board.getPiece(newPos2) === null
      ) {
        moves.push(newPos2);
      }
    }

    return [...moves, ...capturePos];
  }

  private createArrOfPosOfPawnsThatCanBeCapturedByEnPassant(pos: Pos): Pos[] {
    const board = this.boardModel;
    const enemyTeamNum = this.enemyTeamNum;
    const pawnsToCapturePos = [
      new Pos(pos.y, pos.x + 1),
      new Pos(pos.y, pos.x - 1),
    ];
    return pawnsToCapturePos.filter((pawnToCapturePos) => {
      const newCapture = new Pos(pos.y + this.directionY, pawnToCapturePos.x);
      const isAtLestOneMove = board.movesSystem.isThereAtLeastOneHalfMove();
      const lastMove = board.movesSystem.getLatestHalfmove();
      const isPawnAfterMoving2SqueresForward =
        Math.abs(lastMove?.from.y - lastMove?.to.y) > 1;
      const piece = BoardModel.isPosInBounds(pawnToCapturePos)
        ? board.getPiece(pawnToCapturePos)
        : null;
      return (
        BoardModel.isPosInBounds(newCapture) &&
        PieceModel.isPawn(piece) &&
        piece?.team === enemyTeamNum &&
        isAtLestOneMove &&
        piece === lastMove.piece &&
        isPawnAfterMoving2SqueresForward &&
        !this.isPawnPinnedAbsolutely(pawnToCapturePos, pos.x)
      );
    });
  }

  private isPawnPinnedAbsolutely(
    pawn: Pos,
    pawnToBeCapturedPosX: number
  ): boolean {
    const kingPos = this.boardModel.getKingPosByTeam(this.team);
    const isPawnInlineWithKingHoryzontally = pawn.y - kingPos.y === 0;
    return (
      isPawnInlineWithKingHoryzontally &&
      this.isRookOrQueenPinningPawns(
        pawn.y,
        kingPos.x,
        pawn.x,
        pawnToBeCapturedPosX
      )
    );
  }

  private isRookOrQueenPinningPawns(
    yPos: number,
    kingPosX: number,
    pawnPosX: number,
    pawnToBeCapturedPosX: number
  ): boolean {
    // this problem can be seen in this position (FEN notation): 8/1p3p2/8/K1PrP3/8/8/8/7k b - - 0 1
    const pinDir = pawnPosX > kingPosX ? 1 : -1;
    const pawnsNextToEachOther = {
      left: pawnPosX < pawnToBeCapturedPosX ? pawnPosX : pawnToBeCapturedPosX,
      right: pawnPosX > pawnToBeCapturedPosX ? pawnPosX : pawnToBeCapturedPosX,
    };
    const pawnKingSideX =
      pawnPosX > kingPosX
        ? pawnsNextToEachOther.left
        : pawnsNextToEachOther.right;
    const pawnOtherSideX =
      pawnPosX < kingPosX
        ? pawnsNextToEachOther.left
        : pawnsNextToEachOther.right;

    return (
      this.isPinPossibleFromKingToPawns(
        yPos,
        pawnKingSideX,
        -pinDir,
        kingPosX
      ) &&
      this.isPinPossibleFromPawnsToEdgeOfBoard(yPos, pawnOtherSideX, pinDir)
    );
  }

  private isPinPossibleFromKingToPawns(
    yPos: number,
    startPawnXPos: number,
    pinDir: number,
    kingPosX: number
  ): boolean {
    let tempXPos = startPawnXPos + pinDir;
    for (; tempXPos !== kingPosX; tempXPos += pinDir) {
      const pos = new Pos(yPos, tempXPos);
      if (this.boardModel.getPiece(pos) !== null) {
        return false;
      }
    }
    return true;
  }

  private isPinPossibleFromPawnsToEdgeOfBoard(
    yPos: number,
    startPawnXPos: number,
    pinDir: number
  ): boolean {
    const enemyTeamNum = this.enemyTeamNum;
    let tempXPos = startPawnXPos + pinDir;
    let currPos = new Pos(yPos, tempXPos);
    for (
      ;
      BoardModel.isPosInBounds((currPos = new Pos(yPos, tempXPos)));
      tempXPos += pinDir
    ) {
      const piece = this.boardModel.getPiece(currPos);
      if (
        (piece !== null && piece?.team === this.team) ||
        (piece?.team === enemyTeamNum &&
          !PieceModel.isQueen(piece) &&
          !PieceModel.isRook(piece))
      ) {
        return false;
      }
      if (piece?.team === enemyTeamNum) {
        return true;
      }
    }
    return false;
  }

  public sideEffectsOfMove(to: Pos): void {
    // en passant capture
    const b = this.boardModel;
    const enPassantPos = this.getPosOfPieceCapturedByEnPassant(to);
    if (b.movesSystem.getLatestHalfmove().isEnPassantCapture()) {
      b.removePieceInPos(enPassantPos);
    }
  }

  public isPosOfPromotion(pos: Pos) {
    const yPromotion = this.directionY === -1 ? 0 : FIELDS_IN_ONE_ROW - 1;
    return yPromotion === pos.y && BoardModel.isPosInBounds(pos);
  }

  public getPosOfPieceCapturedByEnPassant(moveTo: Pos) {
    return new Pos(moveTo.y - this.directionY, moveTo.x);
  }
}
