import Board, { FIELDS_IN_ONE_ROW } from "../board-components/Board.js";
import Piece, { CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT, PIECES, TEAMS, Pin, AnyPiece } from "./Piece.js";
import Rook from "./Rook.js";
import Pos, { POS_OUT_OF_BOARD } from "../Pos.js";
import Dir from "../Dir.js";
import Check from "../Check.js";

export type CastleRights = {
  isAllowedKingSide: boolean,
  isAllowedQueenSide: boolean,
};

export default class King extends Piece {
  public value: number = 0;
  public id: PIECES = PIECES.KING;
  public pos = new Pos(POS_OUT_OF_BOARD, POS_OUT_OF_BOARD);
  private isBeforeAnyMove: boolean = true;
  private castleRights: CastleRights;
  constructor(readonly team: TEAMS, protected board: Board) {
    super(team, board);
    const castleRights = this.board.startFENNotation.castlingRightsConverted;
    this.castleRights = (this.team === TEAMS.WHITE) ? castleRights.white : castleRights.black;

    this.addClassName(this.id);
  }

  public updatePosProperty(): void {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        if (this.board.el[r][c].piece === this) {
          this.pos =  new Pos(r, c);
        }
      }
    }
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1, 0), new Dir( 0,1), new Dir(0,-1)
    ];

    return directions
      .map(dir => new Pos(pos.y+dir.y, pos.x+dir.x))
      .filter(pos => Board.isPosIn(pos));
  }

  public createArrOfPossibleMovesFromPos(pos: Pos): Pos[] {
    const possibleMoves = [
      pos, 
      ...this.createArrOfNormalMoves(pos), 
      ...this.createArrOfPossibleCastlePos(pos)
    ];
    return this.filterMovesSoKingCantMoveIntoCheck(possibleMoves);
  }

  private createArrOfNormalMoves(pos: Pos): Pos[] {
    const directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1, 0), new Dir( 0,1), new Dir(0,-1)
    ];
    return directions
      .map(dir => new Pos(pos.y+dir.y, pos.x+dir.x))
      .filter(pos => {
        return (
          Board.isPosIn(pos) &&
          this.board.el[pos.y][pos.x].piece?.team !== this.team 
        );
      });
  }

  private createArrOfPossibleCastlePos(pos: Pos): Pos[] {
    const castlesDir = this.createArrOfPossibleCastleDir(pos);
    const castleNormalMoves = castlesDir.map(dir => new Pos(pos.y+(dir.y*2), pos.x+(dir.x*2)));
    // const castleMovesOnRook = castlesDir.map(dir => {
    //   const currentRookXPos = (dir.x > 0) ? FIELDS_IN_ONE_ROW-1 : 0;
    //   return new Pos(pos.y, currentRookXPos);
    // });
    return castleNormalMoves;
  }

  private createArrOfPossibleCastleDir(pos: Pos): Dir[] {
    if (!this.isBeforeAnyMove  || !this.isKingInStartPos(pos)) {
      return [];
    }

    return [new Dir(0, 1), new Dir(0, -1)]
      .filter(dir => {
        const currentRookXPos = (dir.x > 0) ? FIELDS_IN_ONE_ROW-1 : 0;
        const currentRook = this.board.el[pos.y][currentRookXPos].piece as (Rook|null);
        const move1 = new Pos(pos.y, pos.x+dir.x);
        const move2 = new Pos(pos.y, pos.x+(dir.x*2));
        const moves = [move1, move2];
        const fieldsXPos = this.createArrOfFieldsXPosBetweenKingAndRook(
          currentRookXPos, 
          pos.x, 
          (dir.x as (-1|1))
        ); // sometimes 2 fields, sometimes 3
        return (
          this.isKingRightToCastle(move2.x, pos.x) &&
          currentRook?.isBeforeAnyMove &&
          fieldsXPos.filter(xPos => this.board.el[pos.y][xPos].piece === null).length === fieldsXPos.length &&
          this.filterMovesSoKingCantMoveIntoCheck(moves).length === moves.length
        );
      });
  }

  private isKingInStartPos(pos: Pos): boolean {
    const startPos = 
      (this.team === TEAMS.WHITE) ? 
      this.board.startKingPosWhite : 
      this.board.startKingPosBlack;
    return pos.isEqualTo(startPos);
  }

  private isKingRightToCastle(castleMoveX: number, startKingXPos: number): boolean {
    const b = this.board;
    const startQueenXPos = (this.team === TEAMS.WHITE) ? b.startQueenPosWhite.x : b.startQueenPosBlack.x;
    const isCastleKingSide = 
      (Math.abs(castleMoveX - startQueenXPos) > Math.abs(castleMoveX - startKingXPos));
    return (isCastleKingSide) ? this.castleRights.isAllowedKingSide : this.castleRights.isAllowedQueenSide;
  }

  private createArrOfFieldsXPosBetweenKingAndRook(rookXPos: number, kingXPos: number, dirX: (-1 |1)): number[] {
    const fields: number[] = [];
    const amountOfFields = Math.abs(rookXPos - kingXPos) - 1;
    let tempPos = kingXPos+dirX;
    while (fields.length < amountOfFields) {
      fields.push(tempPos)
      tempPos += dirX;
    }
    return fields;
  }

  private filterMovesSoKingCantMoveIntoCheck(moves: Pos[]): Pos[] {
    const enemyTeamNum = this.enemyTeamNum;
    const boardEl = this.board.el;
    for (let r=0 ; r<boardEl.length ; r++) {
      for (let c=0 ; c<boardEl[r].length ; c++) {
        if (
          boardEl[r][c].piece === null || 
          (boardEl[r][c].piece as Piece).team !== enemyTeamNum
        ) {
          continue;
        }
        
        const enemyPiecePossMoves = 
          (boardEl[r][c].piece as Piece).createArrOfPossibleMovesFromPosForKing(new Pos(r, c));
        for (const enemyPossMove of enemyPiecePossMoves) {
          moves = moves.filter(move => {
            return (
              (enemyPossMove.x !== move.x ||
               enemyPossMove.y !== move.y) 
              &&
              (enemyPossMove.x !== c ||
               enemyPossMove.y !== r)
            );
          });
        }
      }
    }
    return moves;
  }

  public createArrOfAbsolutePins(): Pin[] {
    const kingPos = this.board.getKingPosByTeam(this.team);
    const enemyTeamNum = this.enemyTeamNum;
    const absPins: Pin[] = [];

    const directions = [
      new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir( 0,-1), 
      new Dir(1, 1), new Dir(-1, 1), new Dir(1,-1), new Dir(-1,-1)
    ];
  
    for (const direction of directions) {
      const isKingInlineVerticallyOrHorizontally = (
        direction.x === 0 || 
        direction.y === 0
      );

      let pinInThisDir: (Pin|null) = null;
      const tempPos = new Pos(kingPos.y+direction.y, kingPos.x+direction.x);

      while (Board.isPosIn(tempPos)) {
        const piece = this.board.el[tempPos.y][tempPos.x].piece;
        if (piece === null) {
          tempPos.x += direction.x;
          tempPos.y += direction.y;
          continue;
        }
        if (pinInThisDir === null) {
          if (piece.team === enemyTeamNum) {
            break;
          }
          pinInThisDir = {
            pinnedPiecePos: new Pos(tempPos.y, tempPos.x),
            pinDir: direction
          };
          tempPos.x += direction.x;
          tempPos.y += direction.y;
          continue;
        }

        if((!Piece.isBishop(piece) &&
            !Piece.isRook(piece) &&
            !Piece.isQueen(piece)) 
            ||
            piece.team === this.team
          ) {
          break;
        }

        if((isKingInlineVerticallyOrHorizontally &&
            !Piece.isBishop(piece)) 
            ||
            (!isKingInlineVerticallyOrHorizontally &&
            !Piece.isRook(piece))
        ) {
          absPins.push(pinInThisDir);
        }
        
        tempPos.x += direction.x;
        tempPos.y += direction.y;
      }
    }
    return absPins;
  }

  public sideEffectsOfMove(to: Pos, from: Pos): void {
    if (this.isBeforeAnyMove) {
      this.isBeforeAnyMove = false;
    }

    this.pos = to.getInvertedProperly(this.board.isInverted);
    // castle
    const moveIsCastle = Math.abs(from.x-to.x) > 1;
    if (moveIsCastle) {
      const castleDir = new Dir(0, to.x-from.x, true);
      const isCastleToRight = castleDir.x === 1;
      const rookXPos = (isCastleToRight) ? FIELDS_IN_ONE_ROW-1 : 0;
      const oldRookPos = new Pos(from.y, rookXPos);
      const newRookPos = new Pos(to.y, to.x+(castleDir.x*-1));
      const movingRook = this.board.el[oldRookPos.y][oldRookPos.x].piece as AnyPiece;
      this.board.removePieceInPos(oldRookPos, false);
      this.board.placePieceInPos(newRookPos, movingRook, CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT*3.5, false);
    }

  }

  public isInCheck() {
    return this.createArrOfChecks().length > 0;
  }

  public createArrOfChecks(): Check[] {
    return this.createArrOfPositionsOfPiecesCheckingKing()
      .map(pos => new Check(pos, this.pos.getInvertedProperly(this.board.isInverted), this.board));
  }

  private createArrOfPositionsOfPiecesCheckingKing(): Pos[] {
    const enemyTeam = this.enemyTeamNum;
    const checkingPieces: Pos[] = [];

    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        const piece = this.board.el[r][c].piece;
        const pos = new Pos(r, c);
        if (
          piece === null ||
          piece.team !== enemyTeam
        ) {
          continue;
        }
        for (const move of piece.createArrOfPossibleMovesFromPosForKing(pos)) {
          if (this.pos.getInvertedProperly(this.board.isInverted).isEqualTo(move)) {
            checkingPieces.push(pos);
          }
        }
        }
    }
    return checkingPieces;
  }
}