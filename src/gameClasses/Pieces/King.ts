import Board, { FIELDS_IN_ONE_ROW } from "../Board.js";
import Piece, { DEFAULT_TRANSITION_DELAY_MS, PIECES } from "./Piece.js";
import Rook from "./Rook.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Pin from "../Pin.js";
import Check from "../Check.js";

export default class King extends Piece {
  haventMovedYet: Boolean;
  checks: Check[]; // could be 0, 1 or 2
  constructor(team: number, board: Board) {
    super(team, board);
    this.num = PIECES.king;
    this.value = 0;
    this.haventMovedYet = true;
    this.checks = [];

    this.addClassName(this.num);
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    const directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1, 0), new Dir( 0,1), new Dir(0,-1)
    ];

    return directions
      .map(dir => new Pos(pos.y+dir.y, pos.x+dir.x))
      .filter(pos => this.board.isPosInBoard(pos));
  }

  getPossibleMovesFromPos(pos: Pos) {
    const possibleMoves = [
      pos, 
      ...this.createArrOfNormalMoves(pos), 
      ...this.createArrOfPossibleCastlePos(pos)
    ];

    return this.filterMovesSoKingCantMoveIntoCheck(possibleMoves);
  }

  createArrOfNormalMoves(pos: Pos) {
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

  createArrOfPossibleCastlePos(pos: Pos) {
    const castlesDir = this.createArrOfPossibleCastleDir(pos);
    const castleNormalMoves = castlesDir.map(dir => new Pos(pos.y+(dir.y*2), pos.x+(dir.x*2)));
    // const castleMovesOnRook = castlesDir.map(dir => {
    //   const currentRookXPos = (dir.x > 0) ? FIELDS_IN_ONE_ROW-1 : 0;
    //   return new Pos(pos.y, currentRookXPos);
    // });
    return castleNormalMoves;
  }

  createArrOfPossibleCastleDir(pos: Pos) {
    if (!this.haventMovedYet) {
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
          this.board.isPosInBoard(new Pos(move2.y, move2.x)) && // if move2 is in board move1 also is
          currentRook?.haventMovedYet &&
          fieldsXPos.filter(xPos => this.board.el[pos.y][xPos].piece === null).length === fieldsXPos.length &&
          this.filterMovesSoKingCantMoveIntoCheck(moves).length === moves.length
        );
      });
  }

  createArrOfFieldsXPosBetweenKingAndRook(rookXPos: number, kingXPos: number, dirX: (-1 |1)) {
    const fields: number[] = [];
    const amountOfFields = Math.abs(rookXPos - kingXPos) - 1;
    let tempPos = kingXPos+dirX;
    while (fields.length < amountOfFields) {
      fields.push(tempPos)
      tempPos += dirX;
    }
    return fields;
  }

  filterMovesSoKingCantMoveIntoCheck(moves: Pos[]) {
    const enemyTeamNum = this.enemyTeamNum();
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
          (boardEl[r][c].piece as Piece).getPossibleMovesFromPosForKing(new Pos(r, c));
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

  createArrOfAbsolutePins(): Pin[] {
    const kingPos = this.board.findKingPos(this.team);
    const enemyTeamNum = this.enemyTeamNum();
    let absPins: Pin[] = [];

    const directions = [
      new Dir(1, 0), new Dir(-1, 0), new Dir(0, 1), new Dir( 0,-1), 
      new Dir(1, 1), new Dir(-1, 1), new Dir(1,-1), new Dir(-1,-1)
    ];
  
    for (let d=0 ; d<directions.length ; d++) {
      const kingIsInlineVerticallyOrHorizontally = (
        directions[d].x === 0 || 
        directions[d].y === 0
      );

      let pinInThisDir: (Pin|null) = null;
      let tempPos = new Pos(kingPos.y+directions[d].y, kingPos.x+directions[d].x);

      while (this.board.isPosInBoard(tempPos)) {
        if (this.board.el[tempPos.y][tempPos.x].piece !== null) {
          if (pinInThisDir === null) {
            if (this.board.el[tempPos.y][tempPos.x].piece?.team === enemyTeamNum) {
              break;
            }
            pinInThisDir = new Pin(new Pos(tempPos.y, tempPos.x), directions[d]);
            tempPos.x += directions[d].x;
            tempPos.y += directions[d].y;
            continue;
          }

          if( (this.board.el[tempPos.y][tempPos.x].piece?.num !== PIECES.bishop &&
               this.board.el[tempPos.y][tempPos.x].piece?.num !== PIECES.rook &&
               this.board.el[tempPos.y][tempPos.x].piece?.num !== PIECES.queen) 
              ||
              this.board.el[tempPos.y][tempPos.x].piece?.team === this.team
            ) {
            break;
          }

          if( (kingIsInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece?.num !== PIECES.bishop) 
              ||
              (!kingIsInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece?.num !== PIECES.rook)
          ) {
            absPins.push(pinInThisDir);
          }
        }
        tempPos.x += directions[d].x;
        tempPos.y += directions[d].y;
      }
    }

    return absPins;
  }

  sideEffectsOfMove(to: Pos, from: Pos) {
    if (this.haventMovedYet) {
      this.haventMovedYet = false;
    }
    // castle
    const moveIsCastle = Math.abs(from.x-to.x) > 1;
    if (moveIsCastle) {
      const castleDir = new Dir(0, to.x-from.x, true);
      const isCastleToRight = castleDir.x === 1;
      const rookXPos = (isCastleToRight) ? FIELDS_IN_ONE_ROW-1 : 0;
      const oldRookPos = new Pos(from.y, rookXPos);
      const newRookPos = new Pos(to.y, to.x+(castleDir.x*-1));
      const movingRook = this.board.el[oldRookPos.y][oldRookPos.x].piece as Piece;
      this.board.removePieceInPos(oldRookPos, false);
      this.board.placePieceInPos(newRookPos, movingRook, DEFAULT_TRANSITION_DELAY_MS*3.5);
    }
  }

  updateChecksArr() {
    this.checks = [];
    const kingPos = this.board.findKingPos(this.team);
    const possitionsOfPiecesCheckingKing = this.getPossitionsOfPiecesCheckingKing();
    for (const posOfPiece of possitionsOfPiecesCheckingKing) {
      this.checks.push(new Check(posOfPiece, kingPos, this.board));
    }

    // field becomes red if in check
    const fieldClassName = "king-check";
    document.querySelectorAll(`.${fieldClassName}`).forEach(field => {
      field.classList.remove(fieldClassName);
    });
    if (this.checks.length > 0) {
      this.board.el[kingPos.y][kingPos.x].html.classList.add(fieldClassName);
    }
  }

  getPossitionsOfPiecesCheckingKing() {
    const kingPos = this.board.findKingPos(this.team);
    const enemyTeamNum = this.enemyTeamNum();

    const checkingPieces: Pos[] = [];
    for (let r=0 ; r<this.board.el.length ; r++) {
      for (let c=0 ; c<this.board.el[r].length ; c++) {
        if (
          this.board.el[r][c].piece === null ||
          this.board.el[r][c].piece?.team !== enemyTeamNum
        ) {
          continue;
        }
        const piecesMovesForKing = 
          (this.board.el[r][c].piece as Piece).getPossibleMovesFromPosForKing(new Pos(r, c));
        for (const move of piecesMovesForKing) {
          if (kingPos.x === move.x && kingPos.y === move.y) {
            checkingPieces.push(new Pos(r, c));
          }
        }
      }
    }
    return checkingPieces;
  }

  invertChecksArr() {
    for (const check of this.checks) {
      check.checkedKingPos  .invert();
      check.checkingPiecePos.invert();        
      for (const field of check.fieldsInBetweenPieceAndKing) {
        field.invert();
      }
    }
  }
}