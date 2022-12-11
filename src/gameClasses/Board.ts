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

export type BoardArg = {
  htmlPageContainerQSelector: string, 
  whiteToPlay: boolean,
  startPositionsOfPieces: (MapOfPiecesForHuman | null),
};

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

export type MapOfPiecesForHuman = (string | number)[][];

export default class Board {
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
    whiteToPlay: boolean,
    startPositionsOfPieces: MapOfPiecesForHuman | null,
    match: Match, 
  ) {
    this.match = match;
    this.currTeam = (whiteToPlay) ? TEAMS.white : TEAMS.black;
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
    this.placePieces(startPositionsOfPieces);
    this.kings = this.getKings();
    this.updateFieldSize();
    if (this.inverted) {
      this.flipPerspective();
    }
    this.html.addEventListener("mousedown", this.visualizingSystem.handleMouseDown);
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

  createNewPieceObj(num: number|null, team: number|null) {
    if (num === null || team === null) {
      return null;
    }

    switch (num) {
      case PIECES.pawn:   return new Pawn  (team, this);
      case PIECES.rook:   return new Rook  (team, this);
      case PIECES.knight: return new Knight(team, this);
      case PIECES.bishop: return new Bishop(team, this);
      case PIECES.queen:  return new Queen (team, this);
      case PIECES.king:   return new King  (team, this);
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

  placePieces(customPosition: MapOfPiecesForHuman | null) {
    const arrOfPiecesToPlaceByPieceNum = 
      (customPosition === null) ? 
      this.createMapOfPiecesInDefaultPos() :
      this.convertMapOfPiecesForHumanToMapForScript(customPosition);
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        this.placePieceInPos(
          new Pos(r, c),
          arrOfPiecesToPlaceByPieceNum[r][c],
          0,
          Boolean(arrOfPiecesToPlaceByPieceNum[r][c]?.html)
        );
      }
    }
  }

  convertMapOfPiecesForHumanToMapForScript(customPositions: MapOfPiecesForHuman) {
    let mapForScript: (Piece|null)[][] = [];

    for (let r=0 ; r<customPositions.length ; r++) {
      mapForScript.push([]);
      for (let c=0 ; c<customPositions[r].length ; c++) {
        if (typeof customPositions[r][c] === "number") {
          const multiplayer = customPositions[r][c] as number;
          const multiplayedPiece = customPositions[r][c+1] as string;
          for (let i=0 ; i<multiplayer ; i++) {
            mapForScript[r].push(this.getNewPieceObjByString(multiplayedPiece));
          }
          c++;
          continue;
        }
        const multiplayedPiece = customPositions[r][c] as string;
        mapForScript[r].push(this.getNewPieceObjByString(multiplayedPiece));
      }
    }
    return mapForScript;
  }

  getNewPieceObjByString(piece: string) {
    const pieceTeam = this.getPieceTeamByString(piece[0]);
    const pieceName = piece.slice(1, piece.length);
    return this.createNewPieceObj(Piece.getPieceNumByName(pieceName), pieceTeam);
  }

  getPieceTeamByString(team: string) {
    switch (team) {
      case "w": return TEAMS.white;
      case "b": return TEAMS.black;
      default:  return null;
    }
  }

  createMapOfPiecesInDefaultPos(): (Piece|null)[][] {
    const firstAndLastRowNums = [
      PIECES.rook, 
      PIECES.knight, 
      PIECES.bishop, 
      PIECES.queen, 
      PIECES.king, 
      PIECES.bishop, 
      PIECES.knight, 
      PIECES.rook
    ];

    return [
      firstAndLastRowNums.map(pieceNum => this.createNewPieceObj(pieceNum, TEAMS.black)),
      [...Array(FIELDS_IN_ONE_ROW)].map(() => this.createNewPieceObj(PIECES.pawn, TEAMS.black)),
      ...Array(FIELDS_IN_ONE_ROW/2).fill(
        Array(FIELDS_IN_ONE_ROW).fill(null)
      ),
      [...Array(FIELDS_IN_ONE_ROW)].map(() => this.createNewPieceObj(PIECES.pawn, TEAMS.white)),
      firstAndLastRowNums.map(pieceNum => this.createNewPieceObj(pieceNum, TEAMS.white))
    ];
  }

  invertMap(map: (Piece|null)[][]) {
    let newMap: (Piece|null)[][] = [];

    for (let r=map.length-1 ; r>=0 ; r--) {
      newMap[newMap.length] = [];
      for (let c=map[r].length-1 ; c>=0 ; c--) {
        newMap[newMap.length-1].push(map[r][c]);
      }
    }
    return newMap;
  }

  getFieldCoorByPx(leftPx: number, topPx: number) { // pos values from 0 to 7 or -1 if not in board
    const boardStartLeft = (this.pageContainerHtml.offsetWidth-this.html.offsetWidth)/2;
    const boardStartTop =  (this.pageContainerHtml.offsetHeight-this.html.offsetHeight)/2;

    const posOnBoardLeft = leftPx-boardStartLeft+1; // +1 so the piece won't glitch into wrong field
    const posOnBoardTop =  topPx -boardStartTop +1; // +1 so the piece won't glitch into wrong field

    let fieldC = Math.ceil(posOnBoardLeft/this.html.offsetWidth* FIELDS_IN_ONE_ROW)-1;
    let fieldR = Math.ceil(posOnBoardTop/this.html.offsetHeight*FIELDS_IN_ONE_ROW)-1;
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
      (currTeam === TEAMS.white) ? 
      TEAMS.black : 
      TEAMS.white
    );
  }

  getKingByTeam(team: number) {
    const kingPos = this.findKingsPos(team);
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
    return (
      (this.inverted) ? 
      new Move(piece, from.invert(), to.invert(), capturedPiece) : 
      new Move(piece, from, to, capturedPiece)
    );
  }

  getEmptyFieldsPosAtBeginning() {
    let fieldsPos: Pos[] = [];
    for (let r=2 ; r<6 ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        fieldsPos.push(new Pos(r, c));
      }
    }
    return fieldsPos;
  }

  removePieceInPos(pos: Pos, html: boolean) {
    if (html) {
      this.el[pos.y][pos.x].piece?.html.remove();
    }
    this.el[pos.y][pos.x].setPiece(null);
  }

  getKings() {
    let whiteKing: King | null = null;
    let blackKing: King | null = null;
    let kings: {
      white: King;
      black: King;
    } = {
      white: new King(TEAMS.white, this),
      black: new King(TEAMS.black, this)
    }
    for (let r=0 ; r<this.el.length ; r++) {
      for(let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.num === PIECES.king) {
          switch ((this.el[r][c].piece as Piece).team) {
            case TEAMS.white: 
              if (whiteKing !== null) {
                this.match.end();
                alert("Too many kings");
                return kings;
              }
              whiteKing = this.el[r][c].piece as King; 
              break;
            case TEAMS.black: 
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

  findKingsPos(team: number) {
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        if (
          this.el[r][c].piece?.num === PIECES.king && 
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

  getBoardOfPiecesArr() {
    const board: (Piece|null)[][] = [];
    for (let r=0 ; r<this.el.length ; r++) {
      board[r] = [];
      for (let c=0 ; c<this.el[r].length ; c++) {
        board[r].push(this.el[r][c].piece);
      }
    }
    return board;
  }

  flipPerspective() {
    const boardBefore = this.getBoardOfPiecesArr();
    const boardAfter = this.invertMap(boardBefore);

    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (boardAfter[r][c]?.num === PIECES.pawn) {
          const pawn = boardAfter[r][c] as Pawn;
          pawn.directionY *= -1;
        }
        if (boardAfter[r][c] !== null) {
          this.placePieceInPos(new Pos(r, c), boardAfter[r][c] as Piece, 0);
        }
      }
    }
    
    const currKing = this.getKingByTeam(this.currTeam);
    if (currKing !== null) {
      currKing.invertChecksArr();
    }
    this.inverted = (this.inverted) ? false : true;
  }

  insufficientMaterialThatLeadsToDraw() {
    const kingVsKing = this.onlyTwoKingsLeft();
    const kingAndBishopVsKing = this.onlyTwoKingsAndBishopLeft();
    const kingAndKnightVsKing = this.onlyTwoKingsAndKnightLeft();
    const kingAndBishopVsKingAndBishop = this.onlyTwoKingsAndTwoBishopsLeft(); // both bishops on the same color square
    return (
      kingVsKing || 
      kingAndBishopVsKing || 
      kingAndKnightVsKing || 
      kingAndBishopVsKingAndBishop
    );
  }

  onlyTwoKingsLeft() {
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (
          this.el[r][c].piece !== null && 
          this.el[r][c].piece?.num !== PIECES.king
        ) {
          return false;
        }
      }
    }
    return true;
  }

  onlyTwoKingsAndBishopLeft() {
    return this.onlyTwoKingsAndSomePieceLeft(PIECES.bishop);
  }

  onlyTwoKingsAndKnightLeft() {
    return this.onlyTwoKingsAndSomePieceLeft(PIECES.knight);
  }

  onlyTwoKingsAndSomePieceLeft(pieceNum: number) {
    let pieceOccurrencesCounter = 0;
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.num === pieceNum) {
          if (pieceOccurrencesCounter > 0) {
            return false;
          }
          pieceOccurrencesCounter++;
          continue;
        }
        if (
          this.el[r][c].piece !== null && 
          this.el[r][c].piece?.num !== PIECES.king
        ) {
          return false;
        }
      }
    }
    return true;
  }

  onlyTwoKingsAndTwoBishopsLeft() { // both bishops on the same color square
    let bishopsPos: Pos[] = [];
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.num === PIECES.bishop) {
          if (bishopsPos.length >= 2) {
            return false;
          }
          bishopsPos.push(new Pos(r,c));
          continue;
        }
        if(
          this.el[r][c].piece !== null && 
          this.el[r][c].piece?.num !== PIECES.king
        ) {
          return false;
        }
      }
    }
    return this.twoEnemyBishopsOnTheSameColor(bishopsPos);
  }

  twoEnemyBishopsOnTheSameColor(bishopsPos: Pos[]) {
    if (bishopsPos.length !== 2) {
      return false;
    }
    const bishop1 = this.el[bishopsPos[0].y][bishopsPos[0].x].piece as Piece;
    const bishop2 = this.el[bishopsPos[1].y][bishopsPos[1].x].piece as Piece;

    const twoEnemyBishops = bishop1.team !== bishop2.team;
    const twoBishopsOntheSameColor = this.positionsOnTheSameColor(bishopsPos[0], bishopsPos[1]);

    return twoEnemyBishops && twoBishopsOntheSameColor;
  }

  positionsOnTheSameColor(pos1: Pos, pos2: Pos) {
    const pos1OnWhiteSquere = this.hasClass(this.el[pos1.y][pos1.x].html, CLASS_NAMES.fieldColor1);
    const pos2OnWhiteSquere = this.hasClass(this.el[pos2.y][pos2.x].html, CLASS_NAMES.fieldColor1);

    return pos1OnWhiteSquere === pos2OnWhiteSquere;
  }

  hasClass(element: HTMLElement, className: string) {
    return element.className.includes(className);
  }

  noCapturesOrPawnMovesIn50Moves() {
    if (this.moves.length < 50) {
      return false;
    }
    for (let i=this.moves.length-1 ; i>this.moves.length-1-50 ; i--) {
      if (
        this.moves[i].capturedPiece || 
        this.moves[i].piece.num === PIECES.pawn
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
      Piece.piecesAreEqual(p1Moves[0].piece, p1Moves[2].piece) && 
      Piece.piecesAreEqual(p2Moves[0].piece, p2Moves[2].piece) &&
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