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
  constructor( y: number, x: number, simplifyDir?: boolean ) {
    super(y, x);
    if( simplifyDir ) {
      this.y = this.simplifyDir(y);
      this.x = this.simplifyDir(x);
    }
  }

  simplifyDir(dir: number) {
    if( dir>1 ) {
      return 1;
    }
    if( dir<-1 ) {
      return -1;
    }
    return dir;
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

  startFollowingCursor = (ev: MouseEvent) => {
    const leftClickNum = 0;
    if( ev.button!==leftClickNum ) {
      return;
    }
    const fieldCoor = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
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
    this.moveToCursor(ev);
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

  moveToCursor = (ev: MouseEvent) => {
    this.board.highlightFieldUnderMovingPiece(this.board.getFieldCoorByPx(ev.clientX, ev.clientY));
    this.html.style.transform = 
      `translate(
        ${ev.clientX-((this.board.htmlPageContainer.offsetWidth-this.board.piecesHtml.offsetWidth)/2)-this.html.offsetWidth/2}px, 
        ${ev.clientY-((this.board.htmlPageContainer.offsetHeight-this.board.piecesHtml.offsetHeight)/2)-this.html.offsetWidth/2}px
      )`;
  }

  stopFollowingCursor = (ev: MouseEvent) => {
    this.html.id = "";
    if( document.getElementById("fieldHighlightedUnderMovingPiece") ) {
      document.getElementById("fieldHighlightedUnderMovingPiece").id = "";
    }
    document.removeEventListener(
      "mousemove", 
      this.moveToCursor
    );
    this.board.hidePossibleMoves();
    const newPos = this.board.getFieldCoorByPx(ev.clientX, ev.clientY);
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
    for( let dir of directions ) {
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
    };
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMoves = [pos];
    let tempPos: Pos;
    let directions = [new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)];
    for( let dir of directions ) {
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
    };

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
    for( let dir of directions ) {
      if( pos.x+dir.x>=0 && pos.x+dir.x<=7 && pos.y+dir.y>=0 && pos.y+dir.y<=7 ) {
        possibleMoves.push(new Pos(pos.y+dir.y, pos.x+dir.x));
      }
    };
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
    for( let dir of directions ) {
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
    };
    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    const myKing = (this.team===whiteNum) ? this.board.kings.white : this.board.kings.black;
    const absPins = myKing.getPossitionsOfAbsolutePins();
    let possibleMoves = [pos];
    let tempPos: Pos;
    let directions = [new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1)];
    for( let dir of directions ) {
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
    };

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
    for( let dir of directions ) {
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
    };
    return possibleMoves;

  }
  getPossibleMovesFromPos(pos: Pos) {
    let possibleMoves = [pos];
    let tempPos: Pos;
    let directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)
    ];
    for( let dir of directions ) {
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
    };

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
    this.value = 0;
    this.haventMovedYet = true;

  }

  getPossibleMovesFromPosForKing(pos: Pos) {
    let possibleMoves: Pos[] = [];
    let directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)
    ];
    for( let dir of directions ) {
      if( pos.x+dir.x>=0 && pos.x+dir.x<=7 && pos.y+dir.y>=0 && pos.y+dir.y<=7 ) {
        possibleMoves.push( new Pos(pos.y+dir.y, pos.x+dir.x) );
      }
    };

    return possibleMoves;
  }

  getPossibleMovesFromPos(pos: Pos) {
    let possibleMoves = [pos];
    let directions = [
      new Dir(1,1), new Dir(-1,-1), new Dir(-1,1), new Dir(1,-1),
      new Dir(1,0), new Dir(-1,0), new Dir(0,1), new Dir(0,-1)
    ];
    for( let dir of directions ) {
      if(
        pos.x+dir.x>=0 && pos.x+dir.x<=7 && pos.y+dir.y>=0 && pos.y+dir.y<=7 &&
        this.board.el[pos.y+dir.y][pos.x+dir.x].piece.team!==this.team 
      ) {
        possibleMoves.push( new Pos(pos.y+dir.y, pos.x+dir.x) );
      }
    };

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

class VisualizingArrow {
  // arr = arrow ||  arr = arrows
  board: Board;
  startPos: Pos;
  endPos: Pos;
  arrContainer: HTMLDivElement;
  constructor(board: Board, startPos: Pos, endPos: Pos) {
    this.board = board;
    this.startPos = startPos;
    this.endPos = endPos;
    const arrDir = new Dir(this.endPos.y-this.startPos.y, this.endPos.x-this.startPos.x);
    const arrLengthFields = Math.sqrt(Math.abs( Math.pow(Math.abs(arrDir.x), 2) + Math.pow(Math.abs(arrDir.y), 2) ));
    const fieldWidth = this.board.html.offsetWidth/this.board.fieldsInOneRow;
    const arrLengthPx = arrLengthFields*fieldWidth;
    const arrHeadLengthPx = fieldWidth/2;
    const arrTailLengthPx = arrLengthPx-arrHeadLengthPx;

    const rotationDegOfVector = this.getRotationDegOfVector(arrDir);
    this.arrContainer = document.createElement("div");
    this.arrContainer.style.setProperty("--rotationDeg", `${-rotationDegOfVector}deg`);
    this.arrContainer.classList.add("arrowContainer");
    this.arrContainer.style.width = `${fieldWidth*0.8}px`;
    this.arrContainer.style.height = `${fieldWidth*0.8}px`;

    const arrowHead = document.createElement("div");
    arrowHead.style.setProperty("--headHeight", `${fieldWidth/2+arrTailLengthPx}px`);
    arrowHead.classList.add("arrowHead");
    arrowHead.style.width = `${fieldWidth}px`;
    arrowHead.style.height = `${fieldWidth}px`;

    const arrowTail = document.createElement("div");
    arrowTail.style.setProperty("--haldOfFieldSize", `${fieldWidth/2}px`);
    arrowTail.classList.add("arrowTail");
    arrowTail.style.width = `${arrTailLengthPx}px`;
    arrowTail.style.height = `${fieldWidth*0.5}px`;
  
    this.arrContainer.append(arrowTail);
    this.arrContainer.append(arrowHead);
    this.board.el[this.startPos.y][this.startPos.x].html.append(this.arrContainer);

  }

  getRotationDegOfVector(vecDir: Dir,) {
    const fromRadtoDegMultiplier = 180 / Math.PI;
    const rotationAngleDeg = Math.atan(Math.abs(vecDir.y)/Math.abs(vecDir.x)) * fromRadtoDegMultiplier;

    if( vecDir.y===0 ) {
      if( vecDir.simplifyDir(vecDir.x)===1 ) {
        return 0;
      } else { // dir.simplifyDir(dir.x)===-1
        return 180;
      }
    }

    if( vecDir.x===0 ) {
      if( vecDir.simplifyDir(vecDir.y*-1)===1 ) {
        return 90;
      } else { // dir.simplifyDir(dir.y*-1)===-1
        return 270;
      }
    }

    const quadrantNum = ( () => {
      const simDir = new Dir( vecDir.simplifyDir(vecDir.y), vecDir.simplifyDir(vecDir.x) ); //simeplified direction
      if( simDir.x===1 ) {
        if( simDir.y*-1===1 ) {
          return 1;
        } else { // simDir.y*-1===-1
          return 4;
        }
      }
      if( simDir.y*-1===1 ) {
        return 2;
      }
      return 3;
      
    }) ();
    switch(quadrantNum) {
      case 1: return rotationAngleDeg;
      case 2: return 180 - rotationAngleDeg;
      case 3: return 180 + rotationAngleDeg;
      case 4: return 360 - rotationAngleDeg;
    }
  }
}

class VisualizingArrowsArr {
  // arr = arrow ||  arr = arrows
  arr: VisualizingArrow[];
  constructor() {
    this.arr = [];
  }

  getMatchingArrowNum(startPos: Pos, endPos: Pos) {
    for( let i=0 ; i<this.arr.length ; i++ ) {
      const arrSPos = this.arr[i].startPos;
      const arrEPos = this.arr[i].endPos;
      if( 
        startPos.x===arrSPos.x && startPos.y===arrSPos.y &&
        endPos  .x===arrEPos.x && endPos  .y===arrEPos.y
      ) {
        return i;
      }
    }
    return -1;
  }

  removeArrow(arrNum: number) {
    this.arr[arrNum].arrContainer.remove();
    this.arr.splice(arrNum, 1);
  }

  removeAllArrows() {
    while( this.arr.length>0 ) {
      this.removeArrow(0);
    }
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
  visualizingArrows: VisualizingArrowsArr;
  constructor(htmlElQuerySelector: string, htmlPageContainerQuerySelector: string) {
    this.el = [];
    this.html = document.querySelector(htmlElQuerySelector);
    this.htmlPageContainer = document.querySelector(htmlPageContainerQuerySelector);
    this.fieldsInOneRow = 8;
    this.visualizingArrows = new VisualizingArrowsArr();
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--fieldSize", `${this.html.offsetWidth/this.fieldsInOneRow}px`);

    this.createContainersForFieldsAndPieces();
    this.createFields();
    this.kings = this.getKings();

    this.html.addEventListener("mousedown", ev => {
      const rightClickNum = 2;
      if( ev.button!==rightClickNum ) {
        return;
      }

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
      mouseHold.then( () => {
        this.html.addEventListener("mouseup", endEv => {
          const startPos = this.getFieldCoorByPx(ev.clientX, ev.clientY);
          const endPos = this.getFieldCoorByPx(endEv.clientX, endEv.clientY);
          if( startPos.x===endPos.x && startPos.y===endPos.y ) {
            return;
          }
          const matchingArrowNum = this.visualizingArrows.getMatchingArrowNum(startPos, endPos);
          if( matchingArrowNum!==-1 ) {
            this.visualizingArrows.removeArrow(matchingArrowNum);
            return;
          }
          this.visualizingArrows.arr.push(new VisualizingArrow(this, startPos, endPos));
        },
        {once: true});
      }).catch( () => {
        this.toggleHighlightOnFieldOnPos(this.getFieldCoorByPx(ev.clientX, ev.clientY));
      });
    });
  }

  createContainersForFieldsAndPieces() {
    this.fieldsHtml = document.createElement("div");
    this.fieldsHtml.classList.add("boardFieldsContainer");
    this.fieldsHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    this.html.append(this.fieldsHtml);
    this.piecesHtml = document.createElement("div");
    this.piecesHtml.classList.add("boardPiecesContainer");
    this.piecesHtml.addEventListener("contextmenu", ev => ev.preventDefault());
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

  highlightFieldUnderMovingPiece(pos: Pos) {
    if( document.getElementById("fieldHighlightedUnderMovingPiece") ) {
      document.getElementById("fieldHighlightedUnderMovingPiece").id = "";
    }
    if(pos.y!==-1 && pos.x!==-1) {
      this.el[pos.y][pos.x].html.id = "fieldHighlightedUnderMovingPiece";
    }
  }

  toggleHighlightOnFieldOnPos(pos: Pos) {
    this.el[pos.y][pos.x].html.classList.toggle("highlighted");
  }

  turnOfHighlightOnAllFields() {
    const fields = document.getElementsByClassName("highlighted");
    for( let i=0 ; i<fields.length ; i++ ) {
      fields[i].classList.remove("highlighted");
      i--;
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
      this.turnOfHighlightOnAllFields();
      this.visualizingArrows.removeAllArrows();
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