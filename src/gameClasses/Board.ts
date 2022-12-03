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
  startPositionsOfPieces?: MapOfPiecesForHuman
};

type ClassNames = {
  field: string,
  fieldColor1: string,
  fieldColor2: string,
  piece: string,
  possMove: string,
  possMoveCapture: string,
  possMoveStart: string;
  thisHtml: string,
  fieldsContainer: string,
  piecesContainer: string,
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
  fieldsInOneRow: number;
  grabbedPieceInfo: GrabbedPieceInfo | null;
  kings: {
    white: King;
    black: King;
  };
  noPieceNum: number;
  // pawnNum: number;
  // rookNum: number;
  // knightNum: number;
  // bishopNum: number;
  // queenNum: number;
  // kingNum: number;
  noTeamNum: number;
  // whiteNum: number;
  // blackNum: number;
  visualizingSystem: VisualizingSystem;
  pawnPromotionMenu: (PawnPromotionMenu|null);
  classNames: ClassNames;
  highlightedFieldIdUnderGrabbedPieceId: string;
  inverted: boolean;
  constructor(
    htmlPageContainerQSelector: string, 
    match: Match, 
    startPositionsOfPieces: MapOfPiecesForHuman | undefined
  ) {
    this.match = match;
    this.currTeam = 1;
    this.moves = [];
    this.el = [];
    this.pageContainerHtml = document.querySelector(htmlPageContainerQSelector) as HTMLDivElement;
    this.fieldsInOneRow = 8;
    this.grabbedPieceInfo = null;
    this.visualizingSystem = new VisualizingSystem(this);
    this.pawnPromotionMenu = null;
    this.inverted = false;

    this.noPieceNum = 0;
    // this.pawnNum = 1;
    // this.rookNum = 2;
    // this.knightNum = 3;
    // this.bishopNum = 4;
    // this.queenNum = 5;
    // this.kingNum = 6;

    this.noTeamNum = 0;
    // this.whiteNum = 1;
    // this.blackNum = 2;

    this.classNames = {
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
    this.highlightedFieldIdUnderGrabbedPieceId = "field-heighlighted-under-moving-piece";

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

    this.html.addEventListener("mousedown", this.visualizingSystem.actionsOnMouseDown);
  }

  createBoardContainer() { // <div class="board-container" data-board-container></div>
    const containerHtml = document.createElement("div");
    containerHtml.classList.add(this.classNames.thisHtml);
    return containerHtml;
  }

  createContainerForFields() {
    const fieldsHtml = document.createElement("div");
    fieldsHtml.classList.add(this.classNames.fieldsContainer);
    fieldsHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return fieldsHtml;
  }

  createContainerForPieces() {
    const piecesHtml = document.createElement("div");
    piecesHtml.classList.add(this.classNames.piecesContainer);
    piecesHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return piecesHtml;
  }

  setPieceTransitionDeley(htmlEl: HTMLDivElement, ms: number) {
    htmlEl.style.setProperty("--transitionDuration", `${ms}ms`);
  }

  getNewPieceObj(num: number|null, team: number) {
    switch (num) {
      case PIECES.pawn:   return new Pawn  (team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
      case PIECES.rook:   return new Rook  (team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
      case PIECES.knight: return new Knight(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
      case PIECES.bishop: return new Bishop(team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
      case PIECES.queen:  return new Queen (team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
      case PIECES.king:   return new King  (team, this.getNewHtmlPiece(num, team, this.classNames.piece), this);
      default:            return new Piece (this.noTeamNum, null, this);
    }
  }

  getNewHtmlPiece(num: number, team: number, className: string) {
    let piece = document.createElement("div");
    piece.classList.add(className);
    const specificClassName = Piece.getSpecificPieceClassName(num, team);
    if (specificClassName !== null) {
      piece.classList.add(specificClassName);
    }
    return piece;
  }

  createFields() {
    this.el = [];
    let fieldNum = 1;
    for (let r=0 ; r<this.fieldsInOneRow ; r++) {
      this.el[r] = [];
      for (let c=0 ; c<this.fieldsInOneRow ; c++) {
        if (c !== 0) {
          fieldNum = (fieldNum === 1) ? 2 : 1;
        }
        const field = this.createFieldHtml(fieldNum);
        this.fieldsHtml.append(field);
        this.el[r][c] = new Field(field, this.getNewPieceObj(this.noPieceNum, this.noTeamNum));
      }
    }
  }

  createFieldHtml(fieldNum: number) {
    const field = document.createElement("div");
    field.classList.add(this.classNames.field);
    field.classList.add(
      fieldNum === 1 ?
      this.classNames.fieldColor1 : 
      this.classNames.fieldColor2
    );
    return field;
  }

  placePieces(customPosition: MapOfPiecesForHuman | undefined) {
    const arrOfPiecesToPlaceByPieceNum = 
      (customPosition) ? 
      this.convertMapOfPiecesForHumanToMapForScript(customPosition) : 
      this.getMapOfPiecesInDeafultPos();
      
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        this.placePieceInPos(
          new Pos(r, c),
          arrOfPiecesToPlaceByPieceNum[r][c],
          0,
          Boolean(arrOfPiecesToPlaceByPieceNum[r][c].html)
        );
      }
    }
  }

  convertMapOfPiecesForHumanToMapForScript(customPositions: MapOfPiecesForHuman): Piece[][] {
    let mapForScript: Piece[][] = [];

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
    return this.getNewPieceObj(Piece.getPieceNumByName(pieceName), pieceTeam);
  }

  getPieceTeamByString(team: string) {
    switch (team) {
      case "w": return TEAMS.white;
      case "b": return TEAMS.black;
      default:  return this.noTeamNum;
    }
  }

  getMapOfPiecesInDeafultPos() {
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
    let mapOfPieces: Piece[][] = [];

    for (let r=0 ; r<this.fieldsInOneRow ; r++) {
      mapOfPieces[r] = [];
      const teamNum = (r < 4) ? TEAMS.black : TEAMS.white;
      if (r === 0 || r === this.fieldsInOneRow-1) {
        for (let pieceNum of firstAndLastRowNums) {
          mapOfPieces[r].push(this.getNewPieceObj(pieceNum, teamNum));
        }
        continue;
      }

      const pieceNum = 
        (r === 1 || r === this.fieldsInOneRow-2) ? 
        PIECES.pawn : 
        this.noPieceNum;
      for (let i=0 ; i<this.fieldsInOneRow ; i++) {
        mapOfPieces[r].push(
          this.getNewPieceObj(
            pieceNum, 
            (pieceNum === this.noPieceNum) ? this.noTeamNum : teamNum
          )
        );
      }
    }
    return mapOfPieces;
  }

  invertMap(map: Piece[][]) {
    let newMap: Piece[][] = [];

    for (let r=map.length-1 ; r>=0 ; r--) {
      newMap[newMap.length] = [];
      for (let c=map[r].length-1 ; c>=0 ; c--) {
        newMap[newMap.length-1].push(map[r][c]);
      }
    }
    return newMap;
  }

  getFieldCoorByPx(leftPx: number, topPx: number) { // pos values from 0 to 7 or -1 if not in board
    const boardStartLeft = (this.pageContainerHtml.offsetWidth -this.html.offsetWidth) /2;
    const boardStartTop =  (this.pageContainerHtml.offsetHeight-this.html.offsetHeight)/2;

    const posOnBoardLeft = leftPx-boardStartLeft;
    const posOnBoardTop =  topPx -boardStartTop;

    let fieldC = Math.ceil(posOnBoardLeft/this.html.offsetWidth *this.fieldsInOneRow)-1;
    let fieldR = Math.ceil(posOnBoardTop /this.html.offsetHeight*this.fieldsInOneRow)-1;
    if (fieldC < 0 || fieldC > this.fieldsInOneRow-1) {
      fieldC = -1;
    }
    if (fieldR < 0 || fieldR > this.fieldsInOneRow-1) {
      fieldR = -1;
    }
    return new Pos(fieldR, fieldC);
  }

  highlightFieldUnderMovingPiece(pos: Pos) {
    if (document.getElementById(this.highlightedFieldIdUnderGrabbedPieceId)) {
      (document.getElementById(this.highlightedFieldIdUnderGrabbedPieceId) as HTMLElement).id = "";
    }
    if (pos.y !== -1 && pos.x !== -1) {
      this.el[pos.y][pos.x].html.id = this.highlightedFieldIdUnderGrabbedPieceId;
    }
  }

  placePieceInPos(pos: Pos, piece: Piece, transitionDelayMs: number, appendHtml?: boolean) {
    if (!piece.html) {    
      this.el[pos.y][pos.x].piece = piece;
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
    this.el[pos.y][pos.x].piece = piece;
  }

  transformPieceHtmlToPos(pieceHtml: HTMLDivElement, pos: Pos) {
    pieceHtml.style.transform = 
      `translate(
        ${pos.x * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px,
        ${pos.y * this.piecesHtml.offsetWidth / this.fieldsInOneRow}px
      )`;
  }

  getNextCurrTeam(currTeam: number) {
    return (
      (currTeam === TEAMS.white) ? 
      TEAMS.black : 
      TEAMS.white
    );
  }

  getKingByTeamNum(team: number) {
    return (
      (team === TEAMS.white) ? 
      this.kings.white : 
      this.kings.black
    );
  }

  movePiece(from: Pos, to: Pos, piece: Piece, transitionDelayMs: number) {
    this.el[from.y][from.x].piece = new Piece(0, null, this);
    const moveIsCapture = this.el[to.y][to.x].piece.html !== null;
    if (moveIsCapture) {
      this.removePieceInPos(to, true);
    }
    this.moves.push(
      this.getNewMoveObj(piece, from, to, moveIsCapture)
    );
    this.currTeam = this.getNextCurrTeam(this.currTeam);
    this.placePieceInPos(to, piece, transitionDelayMs);
    piece.sideEffectsOfMove(to, from);
    const enemyKing = this.getKingByTeamNum(piece.enemyTeamNum());
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

  getNewMoveObj(piece: Piece, from: Pos, to: Pos, moveIsCapture: boolean) {
    const capturedPiece = (moveIsCapture) ? this.el[to.y][to.x].piece : null;
    return (
      (this.inverted) ? 
      new Move(piece, from.invert(this.fieldsInOneRow), to.invert(this.fieldsInOneRow), capturedPiece) : 
      new Move(piece, from, to, capturedPiece)
    );
  }

  getEmptyFieldsPosAtBeginning() {
    let fieldsPos: Pos[] = [];
    for (let r=2 ; r<6 ; r++) {
      for (let c=0 ; c<this.fieldsInOneRow ; c++) {
        fieldsPos.push(new Pos(r, c));
      }
    }
    return fieldsPos;
  }

  removePieceInPos(pos: Pos, html?: boolean) {
    if (html) {
      this.el[pos.y][pos.x].piece.html?.remove();
    }
    this.el[pos.y][pos.x].piece = this.getNewPieceObj(this.noTeamNum, this.noTeamNum);
  }

  getKings() {
    let whiteKing: King | null = null;
    let blackKing: King | null = null;
    let kings: {
      white: King;
      black: King;
    } = {
      white: new King(this.noPieceNum, document.createElement("div"), this),
      black: new King(this.noPieceNum, document.createElement("div"), this)
    }
    for (let r=0 ; r<this.el.length ; r++) {
      for(let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece.num === PIECES.king) {
          switch (this.el[r][c].piece.team) {
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
    for (let r=0 ; r<this.fieldsInOneRow ; r++) {
      for (let c=0 ; c<this.fieldsInOneRow ; c++) {
        if (
          this.el[r][c].piece.num === PIECES.king && 
          this.el[r][c].piece.team === team
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
      `${this.html.offsetWidth / this.fieldsInOneRow / 3}px`
    );
    root.style.setProperty(
      "--possMoveStartSize", 
      `${this.html.offsetWidth / this.fieldsInOneRow / 3.75}px`
    );
    for (let i=0 ; i<possMoves.length ; i++) {
      const move = possMoves[i];
      const div = document.createElement("div");
      div.classList.add(this.classNames.possMove);
      if (this.el[move.y][move.x].piece.team === enemyTeamNum) {
        div.classList.add(this.classNames.possMoveCapture);
      }
      if (i === 0) {
        div.classList.add(this.classNames.possMoveStart);
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
    const board: Piece[][] = [];
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
        if (boardAfter[r][c].num === PIECES.pawn) {
          const pawn = boardAfter[r][c] as Pawn;
          pawn.directionY *= -1;
        }
        this.placePieceInPos(new Pos(r, c), boardAfter[r][c], 0);
      }
    }
    
    const currKing = this.getKingByTeamNum(this.currTeam);
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
          this.el[r][c].piece.num !== this.noPieceNum && 
          this.el[r][c].piece.num !== PIECES.king
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
        if (this.el[r][c].piece.num === pieceNum) {
          if (pieceOccurrencesCounter > 0) {
            return false;
          }
          pieceOccurrencesCounter++;
          continue;
        }
        if (
          this.el[r][c].piece.num !== this.noPieceNum && 
          this.el[r][c].piece.num !== PIECES.king
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
        if (this.el[r][c].piece.num === PIECES.bishop) {
          if (bishopsPos.length >= 2) {
            return false;
          }
          bishopsPos.push(new Pos(r,c));
          continue;
        }
        if(
          this.el[r][c].piece.num !== this.noPieceNum && 
          this.el[r][c].piece.num !== PIECES.king
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
    const bishop1 = this.el[bishopsPos[0].y][bishopsPos[0].x].piece;
    const bishop2 = this.el[bishopsPos[1].y][bishopsPos[1].x].piece;

    const twoEnemyBishops = bishop1.team !== bishop2.team;
    const twoBishopsOntheSameColor = this.positionsOnTheSameColor(bishopsPos[0], bishopsPos[1]);

    return twoEnemyBishops && twoBishopsOntheSameColor;
  }

  positionsOnTheSameColor(pos1: Pos, pos2: Pos) {
    const pos1OnWhiteSquere = this.hasClass(this.el[pos1.y][pos1.x].html, this.classNames.fieldColor1);
    const pos2OnWhiteSquere = this.hasClass(this.el[pos2.y][pos2.x].html, this.classNames.fieldColor1);

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

  posIsInBoard(pos: Pos) {
    return (
      pos.x >= 0 && pos.x <= this.fieldsInOneRow-1 && 
      pos.y >= 0 && pos.y <= this.fieldsInOneRow-1
    );
  }

  updateFieldSize() {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--fieldSize", `${this.html.offsetWidth / this.fieldsInOneRow}px`);
  }
}