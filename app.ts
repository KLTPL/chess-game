let moves = [];
let currTeam = 1;
let board: Board;

const pawnNum = 1;
const rookNum = 2;
const knightNum = 3;
const bishopNum = 4;
const queenNum = 5;
const kingNum = 6;

const whiteNum = 1;
const blackNum = 2;

class Pos {
  x: number;
  y: number;
  constructor( y: number, x: number ) {
    this.y = y;
    this.x = x;
  }
}

class Dir extends Pos {
  constructor( y: number, x: number, simplifyXAndY?: boolean ) {
    super(y, x);
    if( simplifyXAndY ) {
      this.x = this.simplifyXAndY(this.x);
      this.y = this.simplifyXAndY(this.y);
    }
  }

  simplifyXAndY(num: number) {
    if( num>1 ) {
      return 1;
    }
    if( num<-1 ) {
      return -1;
    }
  }  
}

class Pin {
  pinnedPiecePos: Pos;
  pinDir: Dir;
  constructor(pinnedPiecePos: Pos, pinDir: Dir) {
    this.pinnedPiecePos = pinnedPiecePos;
    this.pinDir = pinDir;
  }
}

class Field {
  html: HTMLElement;
  piece: Piece;
  constructor(html: HTMLElement, piece: Piece) {
    this.html = html;
    this.piece = piece;
  }

  rightClickActions(e: MouseEvent) {

  }
}

class Piece {
  num: number;
  team: (number|null);
  html: (HTMLElement|null);
  board: Board;
  value: number;
  pos: (Pos|null);
  direction: Dir;
  possMoves: Pos[];
  constructor(team: number, html: HTMLElement, board: Board) {
    this.num = 0;
    this.team = team;
    this.html = html;
    this.board = board;
    this.pos = null;
    this.possMoves = [];
    if( this.html!==null ) {
      this.html.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
    }
  }

  enemyTeamNum(myTeamNum: number) {
    return (myTeamNum===whiteNum) ? blackNum : whiteNum;
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    let possibleMoves: Pos[] = [];
    return possibleMoves;
  }

  startFollowingCursor = (e: MouseEvent) => {
    const fieldCoor = this.board.getFieldCoorByPx(e.clientX, e.clientY);
    if( currTeam!==this.team ) {
      this.html.addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
      return;
    }
    this.possMoves = this.getPossibleMovesFromPos(fieldCoor);
    this.board.showPossibleMoves(this.possMoves, this.enemyTeamNum(this.team));
    let mouseHold = new Promise<void>((resolve, reject) => {
      this.html.addEventListener(
        "mouseup", 
        () => {
          reject();
        }, 
        {once: true}
      );
      setTimeout(() => {
        resolve();
      }, 150);
    });

    this.board.grabbedPiece = this;
    this.board.grabbedPiece.pos = fieldCoor;
    this.board.removePieceInPos(fieldCoor);
    this.html.id = "move";
    this.moveToCursor(e);
    document.addEventListener(
      "mousemove",
      this.moveToCursor
    );

    mouseHold.then(() => {
      setTimeout(() => {
        document.addEventListener(
          "mouseup", 
          this.stopFollowingCursor, 
          {once: true}
        );
      })
    }).catch(() => {
      setTimeout(() => {
        document.addEventListener(
          "click", 
          this.stopFollowingCursor, 
          {once: true}
        )
      });
    });


  }

  moveToCursor = (e: MouseEvent) => {
    this.board.highlightHtmlField(this.board.getFieldCoorByPx(e.clientX, e.clientY));
    this.html.style.transform = 
      `translate(
        ${e.clientX-((this.board.htmlPageContainer.offsetWidth-this.board.piecesHtml.offsetWidth)/2)-this.html.offsetWidth/2}px, 
        ${e.clientY-((this.board.htmlPageContainer.offsetHeight-this.board.piecesHtml.offsetHeight)/2)-this.html.offsetWidth/2}px
      )`;
  }

  stopFollowingCursor = (e: MouseEvent) => {
    this.html.id = "";
    if( document.getElementById("fieldHighlighted") ) {
      document.getElementById("fieldHighlighted").id = "";
    }
    document.removeEventListener(
      "mousemove", 
      this.moveToCursor
    );
    this.board.hidePossibleMoves();
    const newPos = this.board.getFieldCoorByPx(e.clientX, e.clientY);
    for( let i=0 ; i<this.possMoves.length ; i++ ) {
      if( 
        this.possMoves[i].x===newPos.x && this.possMoves[i].y===newPos.y &&
        (newPos.x!==this.board.grabbedPiece.pos.x || newPos.y!==this.board.grabbedPiece.pos.y)
      ) {
        this.board.placePieceInPos(
          newPos, 
          this.board.grabbedPiece,
          this.board.grabbedPiece.pos
        );
        this.possMoves = [];
        this.board.grabbedPiece = null;
        return;
      }
    }
    this.board.placePieceInPos(
      this.board.grabbedPiece.pos, 
      this.board.grabbedPiece,
      null    
    );
    this.board.grabbedPiece = null;
  }

  substracktAbsPinsFromPossMoves(possMoves: Pos[], absPins: Pin[], pos: Pos) {
    for( let p=0 ; p<absPins.length ; p++ ) {
      if( absPins[p].pinnedPiecePos.x===pos.x && absPins[p].pinnedPiecePos.y===pos.y ) {
        for( let m=0 ; m<possMoves.length ; m++ ) {
          const simplifyXAndY = (this.num===knightNum) ? false : true; // simplify means make 1 if >1 and -1 if <-1
          const moveDir = new Dir(possMoves[m].y-pos.y, possMoves[m].x-pos.x, simplifyXAndY);
          if( 
            ( moveDir.x===0 && moveDir.y===0 ) ||
            ( moveDir.x    === absPins[p].pinDir.x && moveDir.y    === absPins[p].pinDir.y ) ||
            ( moveDir.x*-1 === absPins[p].pinDir.x && moveDir.y*-1 === absPins[p].pinDir.y )
          ) {
            continue; 
          }
          possMoves.splice(m, 1);
          m--;
        }
      }
    }
    return possMoves;
  }
}

class Pawn extends Piece {
  haventMovedYet: boolean;
  anotherPawnPassed: (Pos|null);
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 1;
    this.value = 1;
    this.haventMovedYet = true;
    this.anotherPawnPassed = null;
    this.direction = (this.team===whiteNum) ? new Dir(-1, 0) : new Dir(1, 0);
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];

    let takesPos = [new Pos(pos.y+this.direction.y, pos.x+1), new Pos(pos.y+this.direction.y, pos.x-1)];
    for( let i=0 ; i<takesPos.length ; i++ ) {
      if( takesPos[i].x<0 || takesPos[i].x>7 || takesPos[i].y<0 || takesPos[i].y>7 ) {
        takesPos.splice(i, 1);
        continue;
      }
      possibleMoves.push(takesPos[i]);
    }
    return possibleMoves;
  }

  
  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();

    let possibleMovesFromPosForKing = this.getPossibleMovesFromPosForKing(pos);
    for( let i=0 ; i<possibleMovesFromPosForKing.length ; i++ ) {
      if( 
        this.board.el[possibleMovesFromPosForKing[i].y][possibleMovesFromPosForKing[i].x].piece.team===this.team ||
        this.board.el[possibleMovesFromPosForKing[i].y][possibleMovesFromPosForKing[i].x].piece.team===null 
      ) {
        possibleMovesFromPosForKing.splice(i, 1);
        i--;
      }
    }
    let possibleMoves: Pos[] = [pos, ...possibleMovesFromPosForKing];
    if( !board.el[pos.y+this.direction.y][pos.x].piece.num ) {
      possibleMoves.push(new Pos(pos.y+this.direction.y, pos.x));
      if( this.haventMovedYet && !board.el[pos.y+(this.direction.y*2)][pos.x].piece.num ) {
        possibleMoves.push(new Pos(pos.y+(this.direction.y*2), pos.x));
      }
    }

    possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);

    return possibleMoves;
  }
}

class Rook extends Piece {
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 2;
    this.value = 5;

  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    let tempPos: Pos;
    let directions = [new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)];
    directions.forEach(dir => {
      tempPos = new Pos(pos.y, pos.x);
      while(true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece.team===this.enemyTeamNum(this.team) && 
          this.board.el[tempPos.y][tempPos.x].piece.num!==kingNum
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( tempPos.x<0 || tempPos.x>7 || tempPos.y<0 || tempPos.y>7 ) {
          break;
        }
        possibleMoves.push( new Pos(tempPos.y, tempPos.x) );
        if( this.board.el[tempPos.y][tempPos.x].piece.team===this.team ) {
          break;
        }
      }
    });
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMoves = [pos];
    let tempPos: Pos;
    let directions = [new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)];
    directions.forEach(dir => {
      tempPos = new Pos(pos.y,pos.x);
      while(true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece.team!==null && 
          this.board.el[tempPos.y][tempPos.x].piece.team!==this.team 
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( 
          (tempPos.x<0 || tempPos.x>7 || tempPos.y<0 || tempPos.y>7) ||
          this.board.el[tempPos.y][tempPos.x].piece.team===this.team
        ) {
          break;
        }
        possibleMoves.push( new Pos(tempPos.y, tempPos.x) );
      }
    });

    possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);

    return possibleMoves;
  }
}

class Knight extends Piece {
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 3;
    this.value = 3;

  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    let directions = [
      new Dir(1,2), new Dir(1,-2), new Dir(-1,2), new Dir(-1,-2), 
      new Dir(2,1), new Dir(2,-1), new Dir(-2,1), new Dir(-2,-1)
    ];
    directions.forEach( dir => {
      if( pos.x+dir.x>=0 && pos.x+dir.x<=7 && pos.y+dir.y>=0 && pos.y+dir.y<=7 ) {
        possibleMoves.push(new Pos(pos.y+dir.y, pos.x+dir.x));
      }
    });
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMovesFromPosForKnight = this.getPossibleMovesFromPosForKing(pos);
    for( let i=0 ; i<possibleMovesFromPosForKnight.length ; i++ ) {
      if( board.el[possibleMovesFromPosForKnight[i].y][possibleMovesFromPosForKnight[i].x].piece.team===this.team ) {
        possibleMovesFromPosForKnight.splice(i, 1);
        i--;
      }
    }
    let possibleMoves = [pos, ...possibleMovesFromPosForKnight];

    possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);

    return possibleMoves;
  }
}

class Bishop extends Piece {
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 4;
    this.value = 3;
  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    let tempPos: Pos;
    let directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    directions.forEach( dir => {
      tempPos = new Pos(pos.y,pos.x);
      while(true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece.team===this.enemyTeamNum(this.team) && 
          this.board.el[tempPos.y][tempPos.x].piece.num!==kingNum
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if(tempPos.x<0 || tempPos.x>7 || tempPos.y<0 || tempPos.y>7) {
          break;
        }
        possibleMoves.push( new Pos(tempPos.y, tempPos.x) );
        if( this.board.el[tempPos.y][tempPos.x].piece.team===this.team ) {
          break;
        }
      }
    });
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMoves = [pos];
    let tempPos: Pos;
    let directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    directions.forEach(dir => {
      tempPos = new Pos(pos.y,pos.x);
      while(true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece.team!==null && 
          this.board.el[tempPos.y][tempPos.x].piece.team!==this.team 
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( 
          (tempPos.x<0 || tempPos.x>7 || tempPos.y<0 || tempPos.y>7) ||
          this.board.el[tempPos.y][tempPos.x].piece.team===this.team
        ) {
          break;
        }
        possibleMoves.push( new Pos(tempPos.y, tempPos.x) );
      }
    });

    possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);

    return possibleMoves;
  }
}

class Queen extends Piece {
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 5;
    this.value = 9;

  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    let tempPos: Pos;
    let directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)
    ];
    directions.forEach(dir => {
      tempPos = new Pos(pos.y,pos.x);
      while(true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece.team===this.enemyTeamNum(this.team) && 
          this.board.el[tempPos.y][tempPos.x].piece.num!==kingNum
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( tempPos.x<0 || tempPos.x>7 || tempPos.y<0 || tempPos.y>7 ) {
          break;
        }
        possibleMoves.push( new Pos(tempPos.y, tempPos.x) );
        if( this.board.el[tempPos.y][tempPos.x].piece.team===this.team ) {
          break;
        }
      }
    });
    return possibleMoves;

  }
  getPossibleMovesFromPos(pos: Pos) {
    let possibleMoves = [pos];
    let tempPos: Pos;
    let directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)
    ];
    directions.forEach(dir => {
      tempPos = new Pos(pos.y,pos.x);
      while(true) {
        if( 
          this.board.el[tempPos.y][tempPos.x].piece.team!==null && 
          this.board.el[tempPos.y][tempPos.x].piece.team!==this.team 
        ) {
          break;
        }
        tempPos.x += dir.x;
        tempPos.y += dir.y;
        if( 
          (tempPos.x<0 || tempPos.x>7 || tempPos.y<0 || tempPos.y>7) ||
          this.board.el[tempPos.y][tempPos.x].piece.team===this.team
        ) {
          break;
        }
        possibleMoves.push( new Pos(tempPos.y, tempPos.x) );
      }
    });

    const myKing = (this.team===whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    possibleMoves = this.substracktAbsPinsFromPossMoves(possibleMoves, absPins, pos);

    return possibleMoves;
  }
}

class King extends Piece {
  haventMovedYet: Boolean;
  constructor(team: number, html: HTMLElement, board: Board) {
    super(team, html, board);
    this.num = 6;
    this.haventMovedYet = true;

  }

  getPossibleMovesFromPos(pos: Pos) {
    let possibleMoves = [pos];
    let directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)
    ];
    directions.forEach(dir => {
      if(
        pos.x+dir.x>=0 && pos.x+dir.x<=7 && pos.y+dir.y>=0 && pos.y+dir.y<=7 &&
        this.board.el[pos.y+dir.y][pos.x+dir.x].piece.team!==this.team 
      ) {
        possibleMoves.push( new Pos(pos.y+dir.y, pos.x+dir.x) );
      }
    });

    const enemyTeamNum = this.enemyTeamNum(this.team);
    for( let r=0 ; r<this.board.el.length ; r++ ) {
      for( let c=0 ; c<this.board.el[r].length ; c++ ) {
        if( this.board.el[r][c].piece.team!==enemyTeamNum ) {
          continue;
        }
        const enemyPiecePossMoves = this.board.el[r][c].piece.getPossibleMovesFromPosForKing( new Pos(r, c) );
        for( let e=0 ; e<enemyPiecePossMoves.length ; e++ ) {
          for( let m=1 ; m<possibleMoves.length ; m++ ) { // m=1 becouse possibleMoves[0] is kings pos
            if( 
              enemyPiecePossMoves[e].x===possibleMoves[m].x && enemyPiecePossMoves[e].y===possibleMoves[m].y &&
              (enemyPiecePossMoves[e].x!==c || enemyPiecePossMoves[e].y!==r)
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

  getPossitionsOfAbsolutePins(kingPosition?: Pos): Pin[] {
    const kingPos =  ( () => {
      if( kingPosition ) {
        return kingPosition;
      }
      return (this.team===whiteNum) ? this.board.kings.white.pos : this.board.kings.black.pos;
    }) ();
    let absPins: Pin[] = [];

    let directions = [
      new Dir( 1, 0 ), new Dir(-1, 0 ), new Dir( 0, 1 ), new Dir( 0, -1 ), 
      new Dir( 1, 1 ), new Dir(-1, 1 ), new Dir( 1,-1 ), new Dir(-1, -1 )
    ];
  
    for( let d=0 ; d<directions.length ; d++ ) {
      const kingIsInlineVerticallyOrHorizontally = (directions[d].x===0 || directions[d].y===0);
      let tempPos = new Pos(kingPos.y, kingPos.x);

      let pinInThisDir: Pin;

      tempPos.x += directions[d].x;
      tempPos.y += directions[d].y;
      while( tempPos.x>=0 && tempPos.x<=7 && tempPos.y>=0 && tempPos.y<=7 ) {
        if( this.board.el[tempPos.y][tempPos.x].piece.num ) {
          if( !pinInThisDir ) {
            if( this.board.el[tempPos.y][tempPos.x].piece.team!==this.team ) {
              break;
            }
            pinInThisDir = new Pin(new Pos(tempPos.y, tempPos.x), directions[d]);
            tempPos.x += directions[d].x;
            tempPos.y += directions[d].y;
            continue;
          }

          if(   
            (
              this.board.el[tempPos.y][tempPos.x].piece.num!==bishopNum &&
              this.board.el[tempPos.y][tempPos.x].piece.num!==rookNum &&
              this.board.el[tempPos.y][tempPos.x].piece.num!==queenNum
            ) ||
            this.board.el[tempPos.y][tempPos.x].piece.team===this.team
            ) {
            break;
          }

          if( 
            (
              kingIsInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece.num!==bishopNum
            ) 
            ||
            (
              !kingIsInlineVerticallyOrHorizontally &&
              this.board.el[tempPos.y][tempPos.x].piece.num!==rookNum
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
}

class Board {
  el: Field[][];
  html: HTMLElement;
  fieldsHtml: HTMLElement;
  piecesHtml: HTMLElement;
  htmlPageContainer: HTMLElement;
  fieldsInOneRow: number;
  grabbedPiece: Piece;
  kings: {
    white: King,
    black: King
  };
  constructor(htmlElQuerySelector: string, htmlPageContainerQuerySelector: string) {
    this.el = [];
    this.html = document.querySelector(htmlElQuerySelector);
    this.htmlPageContainer = document.querySelector(htmlPageContainerQuerySelector);
    this.fieldsInOneRow = 8;
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--fieldSize", `${this.html.offsetWidth/this.fieldsInOneRow}px`);

    this.createContainersForFieldsAndPieces();
    this.createFields();
    
    this.kings = this.getKings();

  }

  createContainersForFieldsAndPieces() {
    this.fieldsHtml = document.createElement("div");
    this.fieldsHtml.classList.add("boardFieldsContainer");
    this.html.append(this.fieldsHtml);
    this.piecesHtml = document.createElement("div");
    this.piecesHtml.classList.add("boardPiecesContainer");
    this.html.append(this.piecesHtml);

  }

  getProperPieceByDeafultPosition(row: number, col: number) {
    const emptyFiledsPosAtBeginning = this.getEmptyFieldsPosAtBeginning();
    for( let i=0 ; i<emptyFiledsPosAtBeginning.length ; i++ ) {
      if( emptyFiledsPosAtBeginning[i].y===row && emptyFiledsPosAtBeginning[i].x===col ) {
        return this.getNewPieceObj(0, null);
      }
    }
    const pieceNum = this.getPieceNumByPos(row, col);
    const team = (row<4) ? blackNum : whiteNum;
    return this.getNewPieceObj(pieceNum, team);
  }

  getNewPieceObj(num: number, team: number) {
    switch(num) {
      case pawnNum:   return new Pawn(team, this.getNewHtmlPiece(num, team), this);
      case rookNum:   return new Rook(team, this.getNewHtmlPiece(num, team), this);
      case knightNum: return new Knight(team, this.getNewHtmlPiece(num, team), this);
      case bishopNum: return new Bishop(team, this.getNewHtmlPiece(num, team), this);
      case queenNum:  return new Queen(team, this.getNewHtmlPiece(num, team), this);
      case kingNum:   return new King(team, this.getNewHtmlPiece(num, team), this);
      default:        return new Piece(null, null, this);
    }
  }

  getNewHtmlPiece(num: number, team: number) {
    let piece = document.createElement("div");
    piece.classList.add("piece");
    piece.style.backgroundImage = `url(./images/${this.getPieceNameByNum(num, team)}.png)`;
    return piece;
  }

  getPieceNumByPos( row: number, col: number) {
    const begRookPos = [new Pos(0, 0), new Pos(0, 7)];
    for( let i=0 ; i<begRookPos.length ; i++ ) {
      if( 
        (begRookPos[i].y===row && begRookPos[i].x===col) ||
        (this.fieldsInOneRow-1-begRookPos[i].y===row && begRookPos[i].x===col)
      ) {
        return rookNum;
      }
    }
    const begKnightPos = [new Pos(0, 1), new Pos(0, 6)];
    for( let i=0 ; i<begKnightPos.length ; i++ ) {
      if( 
        (begKnightPos[i].y===row && begKnightPos[i].x===col) ||
        (this.fieldsInOneRow-1-begKnightPos[i].y===row && begKnightPos[i].x===col)
      ) {
        return knightNum;
      }
    }
    const begBishopPos = [new Pos(0, 2), new Pos(0, 5)];
    for( let i=0 ; i<begBishopPos.length ; i++ ) {
      if( 
        (begBishopPos[i].y===row && begBishopPos[i].x===col) ||
        (this.fieldsInOneRow-1-begBishopPos[i].y===row && begBishopPos[i].x===col)
      ) {
        return bishopNum;
      }
    }
    const begQueenPos = new Pos(0, 3);
    if( 
      (begQueenPos.y===row && begQueenPos.x===col) ||
      (this.fieldsInOneRow-1-begQueenPos.y===row && begQueenPos.x===col)
    ) {
      return queenNum;
    }
    const begKingPos = new Pos(0, 4);
    if( 
      (begKingPos.y===row && begKingPos.x===col) ||
      (this.fieldsInOneRow-1-begKingPos.y===row && begKingPos.x===col)
    ) {
      return kingNum;
    }
    return pawnNum;
  }

  createFields() {
    this.el = [];
    let fieldNr = 0;
    for( let r=0 ; r<this.fieldsInOneRow ; r++ ) {
      this.el[r] = [];
      for( let c=0 ; c<this.fieldsInOneRow ; c++ ) {
        if( c!==0 ) {
          fieldNr = ( fieldNr===0 ) ? 1 : 0;
        }
        let field = document.createElement("div");
        field.classList.add(`field`);
        field.classList.add(`field${fieldNr}`);
        this.fieldsHtml.append(field);
        this.el[r][c] = new Field(field, this.getProperPieceByDeafultPosition(r, c));
        if( this.el[r][c].piece.num===kingNum ) {
          this.el[r][c].piece.pos = new Pos(r, c);
        }
        if( this.el[r][c].piece.html ) {
          this.piecesHtml.append(this.el[r][c].piece.html);
          this.el[r][c].piece.html.style.transform = 
            `translate(
              ${c*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px, 
              ${r*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px
            )`;
        }
      }
    }
  }

  getFieldCoorByPx(leftPx: number, topPx: number) {
    const boardStartLeft = (this.htmlPageContainer.offsetWidth -this.html.offsetWidth) /2;
    const boardStartTop =  (this.htmlPageContainer.offsetHeight-this.html.offsetHeight)/2;

    const posOnBoardLeft = leftPx-boardStartLeft;
    const posOnBoardTop = topPx-boardStartTop;

    let fieldC = Math.ceil(posOnBoardLeft/this.html.offsetWidth *this.fieldsInOneRow)-1;
    let fieldR = Math.ceil(posOnBoardTop /this.html.offsetHeight*this.fieldsInOneRow)-1;
    if( fieldC<0 || fieldC+1>this.fieldsInOneRow ) {
      fieldC = -1;
    }
    if( fieldR<0 || fieldR+1>this.fieldsInOneRow ) {
      fieldR = -1;
    }
    return new Pos(fieldR, fieldC);
  }
  highlightHtmlField(pos: Pos) {
    if( Boolean(document.getElementById("fieldHighlighted")) ) {
      document.getElementById("fieldHighlighted").id = "";
    }
    if(pos.y!==-1 && pos.x!==-1) {
      this.el[pos.y][pos.x].html.id = "fieldHighlighted";
    }
  }

  getPieceNameByNum( pieceNum: number, pieceTeam: number ) {
    let name: string;
    switch(pieceNum) {
      case pawnNum: name = "pawn"; break;
      case rookNum: name = "rook"; break;
      case knightNum: name = "knight"; break;
      case bishopNum: name = "bishop"; break;
      case queenNum: name = "queen"; break;
      case kingNum: name = "king"; break;
    }
    let teamChar = (pieceTeam===blackNum) ? "B" : "W";
    return name + teamChar;
  }

  placePieceInPos( pos: Pos, piece: Piece, from: Pos ) {
    if( this.el[pos.y][pos.x].piece.html!==null ) {
      this.removePieceInPos(pos, true);
    }
    if( piece.html ) {
      piece.html.
      addEventListener(
        "mousedown",
        piece.startFollowingCursor,
        {once: true}
      );
    }
    piece.pos = (piece.num===kingNum) ? new Pos(pos.y, pos.x) : null;
    piece.html.style.transform = 
    `translate(
      ${pos.x*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px, 
      ${pos.y*this.piecesHtml.offsetWidth/this.fieldsInOneRow}px
    )`;
    this.el[pos.y][pos.x].piece = piece;

    if( from ) {
      moves.push(new Move(piece, from, pos));
      currTeam = (currTeam===whiteNum) ? blackNum : whiteNum;
    }
  }

  getEmptyFieldsPosAtBeginning() {
    let fieldsPos: Pos[] = [];
    for( let r=2 ; r<6 ; r++ ) {
      for( let c=0 ; c<this.fieldsInOneRow ; c++ ) {
        fieldsPos.push(new Pos(r, c));
      }
    }
    return fieldsPos;
  }

  removePieceInPos(pos: Pos, html?: boolean) {
    if( html ) {
      this.el[pos.y][pos.x].piece.html.remove();
    }
    this.el[pos.y][pos.x].piece = this.getNewPieceObj(0, null);
  }

  getKings() {
    let kings: {
      white: King,
      black: King
    } = {
      white: null,
      black: null
    };
    for( let r=0 ; r<this.el.length ; r++ ) {
      for( let c=0 ; c<this.el[r].length ; c++ ) {
        if( this.el[r][c].piece.num===kingNum ) {
          switch(this.el[r][c].piece.team) {
            case whiteNum: kings.white = this.el[r][c].piece as King; break;
            case blackNum: kings.black = this.el[r][c].piece as King; break;
          }
        }
        if( kings.white && kings.black ) {
          return kings;
        }
      }
    }
    return kings;
  }

  showPossibleMoves(possMoves: Pos[], enemyTeamNum: number) {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--possMoveSize", `${this.html.offsetWidth/this.fieldsInOneRow/3}px`);
    for( let i=0 ; i<possMoves.length ; i++ ) {
      const move = possMoves[i];
      const div = document.createElement("div");
      div.classList.add("possMove");
      if( this.el[possMoves[i].y][possMoves[i].x].piece.team===enemyTeamNum ) {
        div.classList.add("possMoveTake");
      }
      div.dataset.possMove = "";
      this.el[move.y][move.x].html.append(div);
    }
  }

  hidePossibleMoves() {
    document.querySelectorAll("[data-poss-move]").forEach( move => {
      move.remove();
    });
  }
}

class Move {
  piece: Piece;
  from: Pos;
  to: Pos;
  constructor(piece: Piece, from: Pos, to: Pos) {
    this.piece = piece;
    this.from = from;
    this.to = to;
  }
}

function startGame() {
  board = new Board("[data-board-container]", "[data-container]");
}

startGame();

function getRandomColor() {
  switch(Math.floor(Math.random()*9)) {
    case 0: return "red";
    case 1: return "blue";
    case 2: return "green";
    case 3: return "yellow";
    case 4: return "black";
    case 5: return "pink";
    case 6: return "orange";
    case 6: return "brown";
    case 7: return "purple";
    case 8: return "gray";

  }
}