import Board from "../Board.js";
import Piece, { PIECES } from "./Piece.js";
import Rook from "./Rook.js";
import Pos from "../Pos.js";
import Dir from "../Dir.js";
import Pin from "../Pin.js";
import Check from "../Check.js";

export default class King extends Piece {
  haventMovedYet: Boolean;
  checks: Check[]; // could be 0, 1 or 2
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = PIECES.king;
    this.value = 0;
    this.haventMovedYet = true;
    this.checks = [];
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    const directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1, 0), new Dir( 0,1), new Dir(0,-1)
    ];
    for (const dir of directions) {
      const newPos = new Pos(pos.y+dir.y, pos.x+dir.x);
      if (this.board.posIsInBoard(newPos)) {
        possibleMoves.push(newPos);
      }
    }

    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const enemyTeamNum = this.enemyTeamNum();
    let possibleMoves = [pos];
    const directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)
    ];

    const possibleCastlesDir = this.getPossibleCastlesDir(pos);
    const possibleCastlesPos = (() => {
      let possitions: Pos[] = [];
      for (const castDir of possibleCastlesDir) {
        possitions.push(new Pos(pos.y+castDir.y, pos.x+castDir.x));
      }
      return possitions;
    }) ();
    possibleMoves.push(...possibleCastlesPos);

    for (const dir of directions) {
      const newPos = new Pos(pos.y+dir.y, pos.x+dir.x);
      if(
        this.board.posIsInBoard(newPos) &&
        this.board.el[pos.y+dir.y][pos.x+dir.x].piece.team !== this.team 
      ) {
        possibleMoves.push(newPos);
      }
    };

    for (let r=0 ; r<this.board.el.length ; r++) {
      for (let c=0 ; c<this.board.el[r].length ; c++) {
        if (this.board.el[r][c].piece.team !== enemyTeamNum ) {
          continue;
        }
        const enemyPiecePossMoves = this.board.el[r][c].piece.getPossibleMovesFromPosForKing(new Pos(r, c));
        for (const enemyPossMove of enemyPiecePossMoves) {
          for (let m=1 ; m<possibleMoves.length ; m++) { // m=1 becouse possibleMoves[0] is kings pos
            if( 
              enemyPossMove.x === possibleMoves[m].x && 
              enemyPossMove.y === possibleMoves[m].y &&
              (
                enemyPossMove.x !== c || 
                enemyPossMove.y !== r
              )
            ) {
              possibleMoves.splice(m, 1);
              m--;
            }
          }
        };
      };
    }
    return possibleMoves;
  }

  getPossibleCastlesDir(pos: Pos) {
    if (!this.haventMovedYet) {
      return [];
    }

    let castlesDir = [new Dir(0, 2), new Dir(0, -2)];

    for (let i=0 ; i<castlesDir.length ; i++) {
      const currentRookXPos = 
        (castlesDir[i].simplifyDir(castlesDir[i].x) === 1) ? 
        this.board.fieldsInOneRow-1 : 
        0;
      const currentRook = this.board.el[pos.y][currentRookXPos].piece as Rook;
      if ( 
        !this.board.posIsInBoard(new Pos(pos.y, pos.x+castlesDir[i].x)) ||
        this.board.el[pos.y][pos.x+(castlesDir[i].x/2)].piece.num ||
        this.board.el[pos.y][pos.x+castlesDir[i].x].piece.num ||
        this.somePieceHasCheckOnWayOfCastle(new Pos(pos.y, pos.x+(castlesDir[i].x/2))) ||
        this.somePieceHasCheckOnWayOfCastle(new Pos(pos.y, pos.x+castlesDir[i].x)) || 
        !currentRook.haventMovedYet
      ) {
        castlesDir.splice(i, 1);
        i--;
      }
    }
    return castlesDir;
  }

  somePieceHasCheckOnWayOfCastle(pos: Pos) {
    const enemyTeamNum = this.enemyTeamNum();
    for (let r=0 ; r<this.board.el.length ; r++) {
      for (let c=0 ; c<this.board.el[r].length ; c++) {
        if ( 
          this.board.el[r][c].piece.team !== enemyTeamNum || 
          this.board.el[r][c].piece.num === PIECES.king
        ) {
          continue;
        }
        if (this.board.el[r][c].piece.num !== PIECES.pawn) { 
          const possMoves = this.board.el[r][c].piece.getPossibleMovesFromPos(new Pos(r, c));
          for (const move of possMoves) {
            if (move.x === pos.x && move.y === pos.y) {
              return true;
            }
          }
          continue;
        }
      }
    }
    return false;
  }

  getPossitionsOfAbsolutePins(): Pin[] {
    const kingPos = this.board.findKingsPos(this.team);
    let absPins: Pin[] = [];

    const directions = [
      new Dir( 1, 0 ), new Dir(-1, 0 ), new Dir( 0, 1 ), new Dir( 0, -1 ), 
      new Dir( 1, 1 ), new Dir(-1, 1 ), new Dir( 1,-1 ), new Dir(-1, -1 )
    ];
  
    for (let d=0 ; d<directions.length ; d++) {
      const kingIsInlineVerticallyOrHorizontally = (
        directions[d].x === 0 || 
        directions[d].y === 0
      );

      let tempPos = new Pos(kingPos.y, kingPos.x);
      let pinInThisDir: Pin | null = null;

      tempPos.x += directions[d].x;
      tempPos.y += directions[d].y;
      while (this.board.posIsInBoard(tempPos)) {
        if (this.board.el[tempPos.y][tempPos.x].piece.num) {
          if (!pinInThisDir) {
            if (this.board.el[tempPos.y][tempPos.x].piece.team !== this.team) {
              break;
            }
            pinInThisDir = new Pin(new Pos(tempPos.y, tempPos.x), directions[d]);
            tempPos.x += directions[d].x;
            tempPos.y += directions[d].y;
            continue;
          }

          if(   
            (
              this.board.el[tempPos.y][tempPos.x].piece.num !== PIECES.bishop &&
              this.board.el[tempPos.y][tempPos.x].piece.num !== PIECES.rook &&
              this.board.el[tempPos.y][tempPos.x].piece.num !== PIECES.queen
            ) ||
            this.board.el[tempPos.y][tempPos.x].piece.team === this.team
            ) {
            break;
          }

          if( 
            (
              kingIsInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece.num !== PIECES.bishop
            ) 
            ||
            (
              !kingIsInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece.num !== PIECES.rook
            )
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
      const toRight = castleDir.x === 1;
      const rookXPos = (toRight) ? this.board.fieldsInOneRow-1 : 0;
      const oldRookPos = new Pos(from.y, rookXPos);
      const newRookPos = new Pos(to.y, to.x+(castleDir.x*-1));
      const movingRook = this.board.el[oldRookPos.y][oldRookPos.x].piece;
      this.board.removePieceInPos(oldRookPos);
      this.board.placePieceInPos(newRookPos, movingRook, this.defaultTransitionDelay*3.5);
    }
  }

  updateChecksArr() {
    this.checks = [];
    const kingPos = this.board.findKingsPos(this.team);
    const possitionsOfPiecesCheckingKing = this.getPossitionsOfPiecesCheckingKing();
    for (let posOfPiece of possitionsOfPiecesCheckingKing) {
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
    const kingPos = this.board.findKingsPos(this.team);
    let checkingPieces: Pos[] = [];

    for (let r=0 ; r<this.board.el.length ; r++) {
      for (let c=0 ; c<this.board.el[r].length ; c++) {
        if (this.board.el[r][c].piece.team !== this.enemyTeamNum()) {
          continue;
        }
        const pieceMovesForKing = this.board.el[r][c].piece.getPossibleMovesFromPosForKing(new Pos(r, c));
        for (const move of pieceMovesForKing) {
          if (kingPos.x === move.x && kingPos.y === move.y) {
            checkingPieces.push(new Pos(r, c));
          }
        }
      }
    }
    return checkingPieces;
  }

  invertChecksArr() {
    const fieldsInOneRow = this.board.fieldsInOneRow;
    for (const check of this.checks) {
      check.checkedKingPos   = check.checkedKingPos  .invert(fieldsInOneRow);
      check.checkingPiecePos = check.checkingPiecePos.invert(fieldsInOneRow);        
      for (let field of check.fieldsInBetweenPieceAndKing) {
        field = field.invert(fieldsInOneRow);
      }
    }
  }
}