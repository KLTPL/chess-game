import Board, { FIELDS_IN_ONE_ROW } from "../Board.js";
import Piece, { CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT, PIECES, TEAMS, Pin, AnyPiece } from "./Piece.js";
import Rook from "./Rook.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Check from "../Check.js";

export type CastleRights = {
  isAllowedKingSide: boolean,
  isAllowedQueenSide: boolean,
};

export default class King extends Piece {
  public value: number = 0;
  public id: number = PIECES.KING;
  public checks: Check[] = []; // could be 0, 1 or 2 length
  private isBeforeAnyMove: boolean = true;
  private castleRights: CastleRights;
  constructor(public team: number, protected board: Board) {
    super(team, board);
    const castleRights = this.board.startFENNotation.castlingRightsConverted;
    this.castleRights = (this.team === TEAMS.WHITE) ? castleRights.white : castleRights.black;

    this.addClassName(this.id);
  }

  public createArrOfPossibleMovesFromPosForKing(pos: Pos): Pos[] {
    const directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1, 0), new Dir( 0,1), new Dir(0,-1)
    ];

    return directions
      .map(dir => new Pos(pos.y+dir.y, pos.x+dir.x))
      .filter(pos => this.board.isPosInBoard(pos));
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
          this.board.isPosInBoard(pos) &&
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
    const kingPos = this.board.findKingPos(this.team);
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

      while (this.board.isPosInBoard(tempPos)) {
        if (this.board.el[tempPos.y][tempPos.x].piece !== null) {
          if (pinInThisDir === null) {
            if (this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum) {
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

          if((this.board.el[tempPos.y][tempPos.x].piece?.id !== PIECES.BISHOP &&
               this.board.el[tempPos.y][tempPos.x].piece?.id !== PIECES.ROOK &&
               this.board.el[tempPos.y][tempPos.x].piece?.id !== PIECES.QUEEN) 
              ||
              this.board.el[tempPos.y][tempPos.x].piece?.team === this.team
            ) {
            break;
          }

          if((isKingInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece?.id !== PIECES.BISHOP) 
              ||
              (!isKingInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece?.id !== PIECES.ROOK)
          ) {
            absPins.push(pinInThisDir);
          }
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

  public updateChecksArr(): void {
    const kingPos = this.board.findKingPos(this.team);

    this.checks = this.createArrOfPositionsOfPiecesCheckingKing()
      .map(pos => new Check(pos, kingPos, this.board));

    // field becomes red if in check
    const fieldClassName = "king-check";
    document.querySelectorAll(`.${fieldClassName}`).forEach(field => {
      field.classList.remove(fieldClassName);
    });
    if (this.checks.length > 0) {
      this.board.el[kingPos.y][kingPos.x].html.classList.add(fieldClassName);
    }
  }

  private createArrOfPositionsOfPiecesCheckingKing(): Pos[] {
    const kingPos = this.board.findKingPos(this.team);
    const enemyTeam = this.enemyTeamNum;

    const checkingPieces: Pos[] = [];
    for (let r=0 ; r<this.board.el.length ; r++) {
      for (let c=0 ; c<this.board.el[r].length ; c++) {
        if (
          this.board.el[r][c].piece === null ||
          this.board.el[r][c].piece?.team !== enemyTeam
        ) {
          continue;
        }
        const piecesMovesForKing = 
          (this.board.el[r][c].piece as Piece).createArrOfPossibleMovesFromPosForKing(new Pos(r, c));
        for (const move of piecesMovesForKing) {
          if (kingPos.isEqualTo(move)) {
            checkingPieces.push(new Pos(r, c));
          }
        }
      }
    }
    return checkingPieces;
  }

  public invertChecksArr(): void {
    for (const check of this.checks) {
      check.checkedKingPos  .invert();
      check.checkingPiecePos.invert();        
      for (const field of check.getFieldsInBetweenPieceAndKing()) {
        field.invert();
      }
    }
  }
}