let moves = [];
let currTeam = 1;
let board: Board;

class Pos {
  x: number;
  y: number;
  constructor( posR: number, posC: number ) {
    this.x = posC;
    this.y = posR;
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
  value: number;
  pos: (Pos|null);
  constructor(team: number, html: HTMLElement) {
    this.team = team;
    this.html = html;
    this.pos = null;
  }
}

class Pawn extends Piece {
  haventMoved: boolean;
  anotherPawnPassed: (Pos|null);
  constructor(team: number, html: HTMLElement) {
    super(team, html);
    this.num = 1;
    this.value = 1;
    this.haventMoved = true;
    this.anotherPawnPassed = null;
  }
  getPossibleMovesFromPos(pos: Pos) {
    return [new Pos( pos.y+1, pos.x ), new Pos( pos.y+2, pos.x )];
  }
}

class Rook extends Piece {
  constructor(team: number, html: HTMLElement) {
    super(team, html);
    this.num = 2;
    this.value = 5;

  }

  getPossibleMovesFromPos(pos: Pos) {
    return [new Pos( pos.y+1, pos.x ), new Pos( pos.y+2, pos.x )];
  }
}

class Knight extends Piece {
  haventMoved: boolean;
  constructor(team: number, html: HTMLElement) {
    super(team, html);
    this.num = 3;
    this.value = 3;
    this.haventMoved = true;

  }

  getPossibleMovesFromPos(pos: Pos) {
    return [new Pos( pos.y+1, pos.x ), new Pos( pos.y+2, pos.x )];
  }
}

class Bishop extends Piece {
  constructor(team: number, html: HTMLElement) {
    super(team, html);
    this.num = 4;
    this.value = 3;

  }

  getPossibleMovesFromPos(pos: Pos) {
    return [new Pos( pos.y+1, pos.x ), new Pos( pos.y+2, pos.x )];
  }
}

class Queen extends Piece {
  constructor(team: number, html: HTMLElement) {
    super(team, html);
    this.num = 5;
    this.value = 9;

  }

  getPossibleMovesFromPos(pos: Pos) {
    return [new Pos( pos.y+1, pos.x ), new Pos( pos.y+2, pos.x )];
  }
}

class King extends Piece {
  constructor(team: number, html: HTMLElement) {
    super(team, html);
    this.num = 6;

  }

  getPossibleMovesFromPos(pos: Pos) {
    return [new Pos( pos.y+1, pos.x ), new Pos( pos.y+2, pos.x )];
  }
}

class Board {
  el: Array<Array<Field>>;
  html: HTMLElement;
  htmlPageContainer: HTMLElement;
  fieldsInOneRow: number;
  grabbedPiece: Piece;
  constructor(htmlElQuerySelector: string, htmlPageContainerQuerySelector: string) {
    this.el = [];
    this.html = document.querySelector(htmlElQuerySelector);
    this.htmlPageContainer = document.querySelector(htmlPageContainerQuerySelector);
    this.fieldsInOneRow = 8;
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--fieldSize", `${this.html.offsetWidth/this.fieldsInOneRow}px`);
    this.createFields();
  }

  getProperPieceByDeafultPosition(row: number, col: number) {
    const emptyFiledsAtBeginning = this.getEmptyFieldsAtBeginning();
    for( let i=0 ; i<emptyFiledsAtBeginning.length ; i++ ) {
      if( emptyFiledsAtBeginning[i].y===row && emptyFiledsAtBeginning[i].x===col ) {
        return this.getNewPieceObj(0, null);
      }
    }
    const pieceNum = this.getPieceNumByPos(row, col);
    const team = (row<4) ? 2 : 1;
    return this.getNewPieceObj(pieceNum, team);
  }

  getNewPieceObj(num: number, team: number) {
    switch(num) {
      case 1: return new Pawn(team, this.getNewHtmlPiece(num, team));
      case 2: return new Rook(team, this.getNewHtmlPiece(num, team));
      case 3: return new Knight(team, this.getNewHtmlPiece(num, team));
      case 4: return new Bishop(team, this.getNewHtmlPiece(num, team));
      case 5: return new Queen(team, this.getNewHtmlPiece(num, team));
      case 6: return new King(team, this.getNewHtmlPiece(num, team));
      default:return new Piece(null, null);
    }
  }

  getNewHtmlPiece(num: number, team: number) {
    let piece = document.createElement("div");
    piece.classList.add("piece");
    piece.style.backgroundImage = `url(./images/${this.getPieceNameByNum(num, team)}.png)`;
    piece.addEventListener(
      "mousedown",
      this.startFollowingCursor,
      {once: true}
    );
    return piece;
  }
  getEmptyFieldsAtBeginning() {
    let fields = [];
    for( let r=2 ; r<6 ; r++ ) {
      for( let c=0 ; c<this.fieldsInOneRow ; c++ ) {
        fields.push(new Pos(r, c));
      }
    }
    return fields;
  }

  getPieceNumByPos( row: number, col: number) {
    const begRookPos = [new Pos(0, 0), new Pos(0, 7)];
    for( let i=0 ; i<begRookPos.length ; i++ ) {
      if( 
        (begRookPos[i].y===row && begRookPos[i].x===col) ||
        (this.fieldsInOneRow-1-begRookPos[i].y===row && begRookPos[i].x===col)
      ) {
        return 2;
      }
    }
    const begKnightPos = [new Pos(0, 1), new Pos(0, 6)];
    for( let i=0 ; i<begKnightPos.length ; i++ ) {
      if( 
        (begKnightPos[i].y===row && begKnightPos[i].x===col) ||
        (this.fieldsInOneRow-1-begKnightPos[i].y===row && begKnightPos[i].x===col)
      ) {
        return 3;
      }
    }
    const begBishopPos = [new Pos(0, 2), new Pos(0, 5)];
    for( let i=0 ; i<begBishopPos.length ; i++ ) {
      if( 
        (begBishopPos[i].y===row && begBishopPos[i].x===col) ||
        (this.fieldsInOneRow-1-begBishopPos[i].y===row && begBishopPos[i].x===col)
      ) {
        return 4;
      }
    }
    const begQueenPos = new Pos(0, 3);
    if( 
      (begQueenPos.y===row && begQueenPos.x===col) ||
      (this.fieldsInOneRow-1-begQueenPos.y===row && begQueenPos.x===col)
    ) {
      return 5;
    }
    const begKingPos = new Pos(0, 4);
    if( 
      (begKingPos.y===row && begKingPos.x===col) ||
      (this.fieldsInOneRow-1-begKingPos.y===row && begKingPos.x===col)
    ) {
      return 6;
    }
    return 1;
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
        let el = document.createElement("div");
        el.classList.add(`field`);
        el.classList.add(`field${fieldNr}`);
        this.html.append(el);
        this.el[r][c] = new Field(el, this.getProperPieceByDeafultPosition(r, c));
        if( Boolean(this.el[r][c].piece.html) ) {
          this.el[r][c].html.append(this.el[r][c].piece.html);
        }
      }
    }
  }

  startFollowingCursor = (e: MouseEvent) => {
    const filedCoor = this.getFieldCoorByPx(e.clientX, e.clientY);
    if( currTeam !== board.el[filedCoor.y][filedCoor.x].piece.team ) {
      board.el[filedCoor.y][filedCoor.x].piece.html.
      addEventListener(
        "mousedown",
        this.startFollowingCursor,
        {once: true}
      );
      return;
    }
    let mauseHold = new Promise<void>((resolve, reject) => {
      let pieceHtml =
        board.el
        [filedCoor.y]
        [filedCoor.x]
        .piece.html;
      pieceHtml.addEventListener("mouseup", function() {
        reject();
      });
      setTimeout(function() {
        resolve();
      }, 150);
    });

    this.grabbedPiece = board.el
    [filedCoor.y]
    [filedCoor.x]
    .piece;
    this.grabbedPiece.pos = this.getFieldCoorByPx(e.clientX, e.clientY);
    const evTarget = e.target as HTMLElement;
    this.removePieceInPos(this.getFieldCoorByPx(e.clientX, e.clientY));
    evTarget.id = "move";
    evTarget.style.cursor = "grabbing";
    this.htmlPageContainer.append(evTarget);
    const move = document.getElementById("move");
    move.style.transform = `translate(${(e.clientX-move.offsetWidth/2)}px,${(e.clientY-move.offsetHeight/2)}px)`;
    const fieldCoor = this.getFieldCoorByPx(e.clientX, e.clientY);
    this.el[fieldCoor.y][fieldCoor.x].html.id = "fieldHighlighted";
    move.addEventListener(
      "mousemove", 
      this.moveToCursor
    );

    mauseHold.then(() => {
      move.addEventListener(
        "mouseup", 
        this.stopFollowingCursor, 
        {once: true}
      );
    }).catch(() => {
      move.addEventListener(
        "click", 
        this.stopFollowingCursor, 
        {once: true}
      );
    });

  }

  moveToCursor = (e: MouseEvent) => {
    this.highlightHtmlField(this.getFieldCoorByPx(e.clientX, e.clientY));
    const move = document.getElementById("move");
    move.style.transform = `translate(${(e.clientX-move.offsetWidth/2)}px, ${(e.clientY-move.offsetHeight/2)}px)`;
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

  stopFollowingCursor = (e: MouseEvent) => {
    const move = document.getElementById("move");
    move.id = "";
    if( Boolean(document.getElementById("fieldHighlighted")) ) {
      document.getElementById("fieldHighlighted").id = "";
    }
    move.removeEventListener(
      "mousemove", 
      this.moveToCursor
    );
    this.placePieceInPos(
      this.getFieldCoorByPx(e.clientX, e.clientY), 
      this.grabbedPiece,
      this.grabbedPiece.pos,
      true,
      this.getNewHtmlPiece(this.grabbedPiece.num, this.grabbedPiece.team)
    );
    move.remove();
    this.grabbedPiece = null;
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
      case 1: name = "pawn"; break;
      case 2: name = "rook"; break;
      case 3: name = "knight"; break;
      case 4: name = "bishop"; break;
      case 5: name = "queen"; break;
      case 6: name = "king"; break;
    }
    let teamChar = (pieceTeam===2) ? "B" : "W";
    return name + teamChar;
  }

  placePieceInPos( pos: Pos, piece: Piece, altPos: Pos, newMove: Boolean, html?: HTMLElement ) {
    const newPos = (pos.x===-1 || pos.y===-1) ? altPos : pos;
    piece.pos = null;
    if( this.el[newPos.y][newPos.x].piece.html!==null ) {
      this.removePieceInPos(newPos);
    }
    if( Boolean(html) ) {
      piece.html = html;
    }
    this.el[newPos.y][newPos.x].piece = piece;
    this.el[newPos.y][newPos.x].html.append(piece.html); 
    if( newMove && newPos===pos ) {
      moves.push(new Move(piece, altPos, pos));
      currTeam = (currTeam===1) ? 2 : 1;
    } 
  }

  removePieceInPos(pos: Pos) {
    this.el[pos.y][pos.x].piece.html.remove();
    this.el[pos.y][pos.x].piece = this.getNewPieceObj(0, null);
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