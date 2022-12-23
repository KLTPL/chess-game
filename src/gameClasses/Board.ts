import Pos from "./Pos.js";
import Field from "./Field.js";
import Piece, { PIECES, TEAMS } from "./Pieces/Piece.js";
import Pawn from "./Pieces/Pawn.js";
import Rook from "./Pieces/Rook.js";
import Knight from "./Pieces/Knight.js";
import Bishop from "./Pieces/Bishop.js";
import Queen from "./Pieces/Queen.js";
import King from "./Pieces/King.js";
import GrabbedPieceInfo from "./Pieces/GrabbedPieceInfo.js";
import Move from "./Move.js";
import VisualizingSystem from "./VisualizingSystem.js";
import PawnPromotionMenu from "./PawnPromotionMenu.js";
import Match from "./Match.js";
import FENNotation from "./FENNotation.js";

export type BoardArg = {
  htmlPageContainerQSelector: string, 
  customPositionFEN: (string | null),
};

export type ArrOfPieces2d = (Piece|null)[][];

export const FIELDS_IN_ONE_ROW = 8;

export const HIGHLIGHTED_FIELD_ID_UNDER_GRABBED_PIECE = "field-heighlighted-under-moving-piece";
const CLASS_NAMES = {
  field: "field",
  fieldColor1: "field1",
  fieldColor2: "field2",
  piece: "piece",
  possMove: "poss-move",
  possMoveCapture: "poss-move-capture",
  possMoveStart: "poss-move-start",
  thisHtml: "board-container",
  fieldsContainer: "board-fields-container",
  piecesContainer: "board-pieces-container",
};

export default class Board {
  FENNotation: FENNotation;
  match: Match;
  currTeam: number;
  moves: Move[];
  el: Field[][];
  html: HTMLDivElement;
  fieldsHtml: HTMLDivElement;
  piecesHtml: HTMLDivElement;
  pageContainerHtml: HTMLDivElement;
  grabbedPieceInfo: GrabbedPieceInfo | null;
  kings: {
    white: King;
    black: King;
  };
  visualizingSystem: VisualizingSystem;
  pawnPromotionMenu: (PawnPromotionMenu|null);
  inverted: boolean;
  constructor(
    htmlPageContainerQSelector: string, 
    customPositionFEN: string | null,
    match: Match, 
  ) {
    this.FENNotation = new FENNotation(customPositionFEN, this);

    this.match = match;
    this.currTeam = this.FENNotation.activeColorConverted;
    this.moves = [];
    this.el = [];
    this.pageContainerHtml = document.querySelector(htmlPageContainerQSelector) as HTMLDivElement;
    this.grabbedPieceInfo = null;
    this.visualizingSystem = new VisualizingSystem(this);
    this.pawnPromotionMenu = null;
    this.inverted = false;

    this.html = this.createBoardContainer();
    this.fieldsHtml = this.createContainerForFields();
    this.piecesHtml = this.createContainerForPieces();
    this.pageContainerHtml.append(this.html);
    this.html.append(this.fieldsHtml);
    this.html.append(this.piecesHtml);
    this.createFields();
    this.placePieces(this.FENNotation.piecePlacementConverted);
    this.kings = this.getKings();
    this.updateFieldSize();
    if (this.inverted) {
      this.flipPerspective();
    }
    this.html.addEventListener("mousedown", this.visualizingSystem.handleMouseDown);
    this.el[6][0].piece?.html.addEventListener("mousemove", (ev: MouseEvent) => {
      console.log("ev.clientX",ev.clientX)
    });
    this.el[6][7].piece?.html.addEventListener("mousemove", (ev: MouseEvent) => {
      console.log("ev.clientX",ev.clientX)
    });
  }

  createBoardContainer() { // <div class="board-container" data-board-container></div>
    const containerHtml = document.createElement("div");
    containerHtml.classList.add(CLASS_NAMES.thisHtml);
    return containerHtml;
  }

  createContainerForFields() {
    const fieldsHtml = document.createElement("div");
    fieldsHtml.classList.add(CLASS_NAMES.fieldsContainer);
    fieldsHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return fieldsHtml;
  }

  createContainerForPieces() {
    const piecesHtml = document.createElement("div");
    piecesHtml.classList.add(CLASS_NAMES.piecesContainer);
    piecesHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return piecesHtml;
  }

  setPieceTransitionDeley(htmlEl: HTMLDivElement, ms: number) {
    htmlEl.style.setProperty("--transitionDuration", `${ms}ms`);
  }

  createNewPieceObj(id: (number|null), team: (number|null)) {
    if (id === null || team === null) {
      return null;
    }

    switch (id) {
      case PIECES.PAWN:   return new Pawn  (team, this);
      case PIECES.ROOK:   return new Rook  (team, this);
      case PIECES.KNIGHT: return new Knight(team, this);
      case PIECES.BISHOP: return new Bishop(team, this);
      case PIECES.QUEEN:  return new Queen (team, this);
      case PIECES.KING:   return new King  (team, this);
      default:            return null;
    }
  }

  createFields() {
    this.el = [];
    let isFieldWhite = true;
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      this.el[r] = [];
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        const field = this.createFieldHtml();
        if (c !== 0) {
          isFieldWhite = (isFieldWhite) ? false : true;
        }
        field.classList.add(
          (isFieldWhite) ?
          CLASS_NAMES.fieldColor1 : 
          CLASS_NAMES.fieldColor2
        );
        this.fieldsHtml.append(field);
        this.el[r][c] = new Field(field);
      }
    }
  }

  createFieldHtml() {
    const field = document.createElement("div");
    field.classList.add(CLASS_NAMES.field);
    return field;
  }

  placePieces(pieces: ArrOfPieces2d) {
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        this.placePieceInPos(
          new Pos(r, c),
          pieces[r][c],
          0,
          Boolean(pieces[r][c]?.html)
        );
        if (this.el[r][c].piece !== null) {
          console.log("Pos:",r,c,);
          console.log(this.el[r][c].piece?.html.style.transform)
          // const boardStartLeft = (this.pageContainerHtml.offsetWidth-this.html.offsetWidth)/2;
          // const boardStartTop =  (this.pageContainerHtml.offsetHeight-this.html.offsetHeight)/2;
          // const posOnBoardLeft = leftPx - boardStartLeft;
          // const posOnBoardTop =  topPx - boardStartTop;
          // let fieldC = Math.floor((posOnBoardLeft/this.fieldsHtml.offsetWidth)* FIELDS_IN_ONE_ROW);
          // let fieldR = Math.floor((posOnBoardTop/this.fieldsHtml.offsetHeight)*FIELDS_IN_ONE_ROW);
        }
      }
    }
  }

  // createMapOfPiecesInDefaultPos(): ArrOfPieces2d {
  //   const firstAndLastRowNums = [
  //     PIECES.ROOK, 
  //     PIECES.KNIGHT, 
  //     PIECES.BISHOP, 
  //     PIECES.QUEEN, 
  //     PIECES.KING, 
  //     PIECES.BISHOP, 
  //     PIECES.KNIGHT, 
  //     PIECES.ROOK
  //   ];

  //   return [
  //     firstAndLastRowNums.map(pieceNum => this.createNewPieceObj(pieceNum, TEAMS.BLACK)),
  //     [...Array(FIELDS_IN_ONE_ROW)].map(() => this.createNewPieceObj(PIECES.PAWN, TEAMS.BLACK)),
  //     ...Array(FIELDS_IN_ONE_ROW/2).fill(
  //       Array(FIELDS_IN_ONE_ROW).fill(null)
  //     ),
  //     [...Array(FIELDS_IN_ONE_ROW)].map(() => this.createNewPieceObj(PIECES.PAWN, TEAMS.WHITE)),
  //     firstAndLastRowNums.map(pieceNum => this.createNewPieceObj(pieceNum, TEAMS.WHITE))
  //   ];
  // }

  calcFieldCoorByPx(leftPx: number, topPx: number) { // pos values from 0 to 7 or -1 if not in board
    const boardStartLeft = (this.pageContainerHtml.offsetWidth-this.html.offsetWidth)/2;
    const boardStartTop =  (this.pageContainerHtml.offsetHeight-this.html.offsetHeight)/2;
    const posOnBoardLeft = leftPx - boardStartLeft;
    const posOnBoardTop =  topPx - boardStartTop;
    let fieldC = Math.floor((posOnBoardLeft/this.fieldsHtml.offsetWidth)* FIELDS_IN_ONE_ROW);
    let fieldR = Math.floor((posOnBoardTop/this.fieldsHtml.offsetHeight)*FIELDS_IN_ONE_ROW);
    if (fieldC < 0 || fieldC > FIELDS_IN_ONE_ROW-1) {
      fieldC = -1;
    }
    if (fieldR < 0 || fieldR > FIELDS_IN_ONE_ROW-1) {
      fieldR = -1;
    }
    return new Pos(fieldR, fieldC);
  }

  highlightFieldUnderMovingPiece(pos: Pos) {
    const id = HIGHLIGHTED_FIELD_ID_UNDER_GRABBED_PIECE;
    if (document.getElementById(id)) {
      (document.getElementById(id) as HTMLElement).id = "";
    }
    if (pos.y !== -1 && pos.x !== -1) {
      this.el[pos.y][pos.x].html.id = id;
    }
  }

  placePieceInPos(pos: Pos, piece: (Piece|null), transitionDelayMs: number, appendHtml?: boolean) {
    if (piece === null || !piece.html) {    
      this.el[pos.y][pos.x].setPiece(piece);
      return;
    }
    const pieceDiv = piece.html as HTMLDivElement;
    if (appendHtml) {
      this.piecesHtml.append(pieceDiv);
    }
    pieceDiv.
      addEventListener(
        "mousedown",
        piece.startFollowingCursor,
        {once: true}
      );
    this.setPieceTransitionDeley(pieceDiv, transitionDelayMs);
    this.transformPieceHtmlToPos(pieceDiv, pos);
    setTimeout(() => {
      this.setPieceTransitionDeley(pieceDiv, 0);
    }, transitionDelayMs);
    this.el[pos.y][pos.x].setPiece(piece);
  }

  transformPieceHtmlToPos(pieceHtml: HTMLDivElement, pos: Pos) {
    pieceHtml.style.transform = 
      `translate(
        ${pos.x * this.piecesHtml.offsetWidth  / FIELDS_IN_ONE_ROW}px,
        ${pos.y * this.piecesHtml.offsetHeight / FIELDS_IN_ONE_ROW}px
      )`;
  }

  getNextCurrTeam(currTeam: number) {
    return (
      (currTeam === TEAMS.WHITE) ? 
      TEAMS.BLACK : 
      TEAMS.WHITE
    );
  }

  getKingByTeam(team: number) {
    const kingPos = this.findKingPos(team);
    return this.el[kingPos.y][kingPos.x].piece as King;
  }

  movePiece(from: Pos, to: Pos, piece: Piece, transitionDelayMs: number) {
    const capturedPiece =  this.el[to.y][to.x].piece;
    if (capturedPiece !== null) {
      this.removePieceInPos(to, true);
    }
    this.moves.push(
      this.createNewMoveObj(piece, from, to, capturedPiece)
    );
    this.currTeam = this.getNextCurrTeam(this.currTeam);
    this.placePieceInPos(to, piece, transitionDelayMs);
    piece.sideEffectsOfMove(to, from);
    const enemyKing = this.getKingByTeam(piece.enemyTeamNum());
    enemyKing.updateChecksArr();
    this.match.checkIfGameShouldEndAfterMove(this.moves[this.moves.length-1]);
    // future TODO
    // if (this.match.gameRunning) {
    //   if (this.pawnPromotionMenu) {
    //     this.pawnPromotionMenu.playerIsChoosing.then(() => {
    //       this.flipPerspective();
    //     });
    //   } else {
    //     this.flipPerspective();
    //   }
    // }
  }

  createNewMoveObj(piece: Piece, from: Pos, to: Pos, capturedPiece: (Piece|null)) {
    if (this.inverted) {
      from.invert();
      to.invert();
    }
    return new Move(piece, from, to, capturedPiece);
  }

  removePieceInPos(pos: Pos, html: boolean) {
    if (html) {
      this.el[pos.y][pos.x].piece?.html.remove();
    }
    this.el[pos.y][pos.x].setPiece(null);
  }

  getKings() {
    let whiteKing: (King|null) = null;
    let blackKing: (King|null) = null;
    let kings: {
      white: King;
      black: King;
    } = {
      white: new King(TEAMS.WHITE, this),
      black: new King(TEAMS.BLACK, this)
    }
    for (let r=0 ; r<this.el.length ; r++) {
      for(let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.id === PIECES.KING) {
          switch ((this.el[r][c].piece as Piece).team) {
            case TEAMS.WHITE: 
              if (whiteKing !== null) {
                this.match.end();
                alert("Too many kings");
                return kings;
              }
              whiteKing = this.el[r][c].piece as King; 
              break;
            case TEAMS.BLACK: 
              if (blackKing !== null) {
                this.match.end();
                alert("Too many kings");
                return kings;
              }
              blackKing = this.el[r][c].piece as King; 
              break;
          }
        }
      }
    }
    if (whiteKing === null || blackKing === null) {
      this.match.end();
      alert("Not enough kings on the board"); 
    } else {
      kings = {
        white: whiteKing,
        black: blackKing
      }
    }

    return kings;
  }

  findKingPos(team: number) {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        if (
          this.el[r][c].piece?.id === PIECES.KING && 
          this.el[r][c].piece?.team === team
        ) {
          return new Pos(r, c);
        }
      }
    }
    return new Pos(-1, -1);
  }

  showPossibleMoves(possMoves: Pos[], enemyTeamNum: number) {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty(
      "--possMoveSize", 
      `${this.html.offsetWidth / FIELDS_IN_ONE_ROW / 3}px`
    );
    root.style.setProperty(
      "--possMoveStartSize", 
      `${this.html.offsetWidth / FIELDS_IN_ONE_ROW / 3.75}px`
    );
    for (let i=0 ; i<possMoves.length ; i++) {
      const move = possMoves[i];
      const div = document.createElement("div");
      div.classList.add(CLASS_NAMES.possMove);
      if (this.el[move.y][move.x].piece?.team === enemyTeamNum) {
        div.classList.add(CLASS_NAMES.possMoveCapture);
      }
      if (i === 0) {
        div.classList.add(CLASS_NAMES.possMoveStart);
      }
      div.dataset.possMove = "";
      this.el[move.y][move.x].html.append(div);
    }
  }

  hidePossibleMoves() {
    document.querySelectorAll("[data-poss-move]").forEach(possMove => {
      possMove.remove();
    });
  }

  createArrOfPieces() {
    return this.el.map(row => row.map(field => field.piece));
  }

  flipPerspective() {
    const boardBefore = this.createArrOfPieces();
    const boardAfter = this.invertMap(boardBefore);
    for (let r=0 ; r<boardAfter.length ; r++) {
      for (let c=0 ; c<boardAfter[r].length ; c++) {
        // console.log("pos",r,c,boardAfter[r][c])
        if (boardAfter[r][c]?.id === PIECES.PAWN) {
          (boardAfter[r][c] as Pawn).directionY *= -1;
        }
        this.placePieceInPos(new Pos(r, c), boardAfter[r][c], 0, true);
      }
    }
    
    const currKing = this.getKingByTeam(this.currTeam);
    if (currKing !== null) {
      currKing.invertChecksArr();
    }
    this.inverted = (this.inverted) ? false : true;
  }

  invertMap(map: (Piece|null)[][]) {
    return map.reverse().map(row => row.reverse());
  }

  insufficientMaterialThatLeadsToDraw() {
    return (
      this.isPositionKingVsKing() || 
      this.isPositionKingAndBishopVsKing() || 
      this.isPositionKingAndKnightVsKing() || 
      this.isPositionKingAndBishopVsKingAndBishop() // both bishops on squeres of the same color
    );
  }

  isPositionKingVsKing() {
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (
          this.el[r][c].piece !== null && 
          (this.el[r][c].piece as Piece).id !== PIECES.KING
        ) {
          return false;
        }
      }
    }
    return true;
  }

  isPositionKingAndBishopVsKing() {
    return this.onlyTwoKingsAndSomePieceLeft(PIECES.BISHOP);
  }

  isPositionKingAndKnightVsKing() {
    return this.onlyTwoKingsAndSomePieceLeft(PIECES.KNIGHT);
  }

  onlyTwoKingsAndSomePieceLeft(pieceNum: number) {
    let pieceOccurrencesCounter = 0;
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.id === pieceNum) {
          if (pieceOccurrencesCounter > 0) {
            return false;
          }
          pieceOccurrencesCounter++;
          continue;
        }
        if (
          this.el[r][c].piece !== null && 
          this.el[r][c].piece?.id !== PIECES.KING
        ) {
          return false;
        }
      }
    }
    return true;
  }

  isPositionKingAndBishopVsKingAndBishop() { // both bishops on squeres of the same color
    let bishopsPos: Pos[] = [];
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.id === PIECES.BISHOP) {
          if (bishopsPos.length >= 2) {
            return false;
          }
          bishopsPos.push(new Pos(r,c));
          continue;
        }
        if(
          this.el[r][c].piece !== null && 
          this.el[r][c].piece?.id !== PIECES.KING
        ) {
          return false;
        }
      }
    }
    return this.isTwoEnemyBishopsOnTheSameColor(bishopsPos);
  }

  isTwoEnemyBishopsOnTheSameColor(bishopsPos: Pos[]) {
    if (bishopsPos.length !== 2) {
      return false;
    }
    const bishop1 = this.el[bishopsPos[0].y][bishopsPos[0].x].piece as Piece;
    const bishop2 = this.el[bishopsPos[1].y][bishopsPos[1].x].piece as Piece;

    const twoEnemyBishops = bishop1.team !== bishop2.team;
    const twoBishopsOntheSameColor = this.isPositionsOnTheSameColor(bishopsPos[0], bishopsPos[1]);

    return twoEnemyBishops && twoBishopsOntheSameColor;
  }

  isPositionsOnTheSameColor(pos1: Pos, pos2: Pos) {
    const pos1OnWhiteSquere = 
      this.el[pos1.y][pos1.x].html.className.includes(CLASS_NAMES.fieldColor1);
    const pos2OnWhiteSquere = 
      this.el[pos2.y][pos2.x].html.className.includes(CLASS_NAMES.fieldColor1);

    return pos1OnWhiteSquere === pos2OnWhiteSquere;
  }

  noCapturesOrPawnMovesIn50Moves() {
    if (this.moves.length < 50) {
      return false;
    }
    for (let i=this.moves.length-1 ; i>this.moves.length-1-50 ; i--) {
      if (
        this.moves[i].capturedPiece !== null || 
        this.moves[i].piece.id === PIECES.PAWN
      ) {
        return false;
      }
    }
    return true;
  }

  threeMovesRepetition() {
    if (this.moves.length < 6) {
      return false;
    }
    const lastMoveNum = this.moves.length-1;
    const p1Moves = [this.moves[lastMoveNum-4], this.moves[lastMoveNum-2], this.moves[lastMoveNum]];
    const p2Moves = [this.moves[lastMoveNum-5], this.moves[lastMoveNum-3], this.moves[lastMoveNum-1]];

    return ( // trust, it works
      p1Moves[0].from.isEqualTo(p1Moves[1].to) && 
      p1Moves[1].from.isEqualTo(p1Moves[2].to) && 
      p2Moves[0].from.isEqualTo(p2Moves[1].to) && 
      p2Moves[1].from.isEqualTo(p2Moves[2].to) &&
      p1Moves[0].piece === p1Moves[2].piece && 
      p2Moves[0].piece === p2Moves[2].piece &&
      Move.capturesAreEqual(p1Moves[0].capturedPiece, p1Moves[1].capturedPiece, p1Moves[2].capturedPiece) &&
      Move.capturesAreEqual(p2Moves[0].capturedPiece, p2Moves[1].capturedPiece, p2Moves[2].capturedPiece)
    );
  }

  isPosInBoard(pos: Pos) {
    return (
      pos.x >= 0 && pos.x <= FIELDS_IN_ONE_ROW-1 && 
      pos.y >= 0 && pos.y <= FIELDS_IN_ONE_ROW-1
    );
  }

  updateFieldSize() {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--fieldSize", `${this.html.offsetWidth / FIELDS_IN_ONE_ROW}px`);
  }
}