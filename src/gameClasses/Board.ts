import Pos from "./Pos.js";
import Field, { CLASS_NAMES as FIELDS_CLASS_NAMES } from "./Field.js";
import Piece, { AnyPiece, PIECES, TEAMS } from "./Pieces/Piece.js";
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

export type ArrOfPieces2d = (AnyPiece|null)[][];

export const FIELDS_IN_ONE_ROW = 8;

export const HIGHLIGHTED_FIELD_ID_UNDER_GRABBED_PIECE = "field-heighlighted-under-moving-piece";
const CLASS_NAMES = {
  piece: "piece",
  possMove: "poss-move",
  possMoveCapture: "poss-move-capture",
  possMoveStart: "poss-move-start",
  thisHtml: "board-container",
  fieldsContainer: "board-fields-container",
  piecesContainer: "board-pieces-container",
};

export default class Board {
  public startFENNotation: FENNotation;
  private match: Match;
  public currTeam: (TEAMS.WHITE|TEAMS.BLACK);
  public moves: Move[];
  public el: Field[][];
  public html: HTMLDivElement;
  private fieldsHtml: HTMLDivElement;
  public piecesHtml: HTMLDivElement;
  public pageContainerHtml: HTMLDivElement;
  public grabbedPieceInfo: GrabbedPieceInfo | null;
  public pawnPromotionMenu: (PawnPromotionMenu|null);
  public isInverted: boolean;
  constructor(
    htmlPageContainerQSelector: string, 
    customPositionFEN: string | null,
    match: Match, 
  ) {
    this.startFENNotation = new FENNotation(customPositionFEN, this);
    this.match = match;
    this.currTeam = this.startFENNotation.activeColorConverted;
    this.moves = [];
    this.el = [];
    this.pageContainerHtml = document.querySelector(htmlPageContainerQSelector) as HTMLDivElement;
    this.grabbedPieceInfo = null;
    this.pawnPromotionMenu = null;
    this.isInverted = false;

    this.html = this.createBoardContainer();
    this.fieldsHtml = this.createContainerForFields();
    this.piecesHtml = this.createContainerForPieces();
    this.pageContainerHtml.append(this.html);
    this.html.append(this.fieldsHtml);
    this.html.append(this.piecesHtml);
    this.el = this.createFieldsArr();
    this.placePieces(this.startFENNotation.piecePlacementConverted);
    this.updateFieldSize();
    if (this.isInverted) {
      this.flipPerspective();
    }
    new VisualizingSystem(this);
    // this.el[6][0].piece?.html.addEventListener("mousemove", (ev: MouseEvent) => {
    //   console.log("ev.clientX",ev.clientX)
    // });
    // this.el[6][7].piece?.html.addEventListener("mousemove", (ev: MouseEvent) => {
    //   console.log("ev.clientX",ev.clientX)
    // });
  }

  private createBoardContainer(): HTMLDivElement { // <div class="board-container"></div>
    const containerHtml = document.createElement("div");
    containerHtml.classList.add(CLASS_NAMES.thisHtml);
    return containerHtml;
  }

  private createContainerForFields(): HTMLDivElement { // <div class="board-fields-container"></div>
    const fieldsHtml = document.createElement("div");
    fieldsHtml.classList.add(CLASS_NAMES.fieldsContainer);
    fieldsHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return fieldsHtml;
  }

  private createContainerForPieces(): HTMLDivElement { // <div class="board-pieces-container"></div>
    const piecesHtml = document.createElement("div");
    piecesHtml.classList.add(CLASS_NAMES.piecesContainer);
    piecesHtml.addEventListener("contextmenu", ev => ev.preventDefault());
    return piecesHtml;
  }

  private setPieceTransitionDeley(htmlEl: HTMLDivElement, ms: number): void {
    htmlEl.style.setProperty("--transitionDuration", `${ms}ms`);
  }

  public createNewPieceObj(id: (number|null), team: (number|null))
    : (King | Pawn | Rook | Knight | Bishop | Queen | null) {
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

  private createFieldsArr(): Field[][] {
    const el: Field[][] = [];
    let isFieldWhite = true;
    for (let r=0 ; r<FIELDS_IN_ONE_ROW ; r++) {
      el[r] = [];
      for (let c=0 ; c<FIELDS_IN_ONE_ROW ; c++) {
        if (c !== 0) {
          isFieldWhite = (isFieldWhite) ? false : true;
        }
        el[r][c] = new Field(isFieldWhite);
        this.fieldsHtml.append(el[r][c].html);
      }
    }
    return el;
  }

  private placePieces(pieces: ArrOfPieces2d): void {
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        this.placePieceInPos(
          new Pos(r, c),
          pieces[r][c],
          0,
          Boolean(pieces[r][c]?.html)
        );
        // if (this.el[r][c].piece !== null) {
        //   // console.log("Pos:",r,c,);
        //   // console.log(this.el[r][c].piece?.html.style.transform)
        // }
      }
    }
  }


  public calcFieldCoorByPx(leftPx: number, topPx: number): Pos { // pos values from 0 to 7 or -1 if not in board
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

  public highlightFieldUnderMovingPiece(pos: Pos): void {
    const id = HIGHLIGHTED_FIELD_ID_UNDER_GRABBED_PIECE;
    if (document.getElementById(id)) {
      (document.getElementById(id) as HTMLElement).id = "";
    }
    if (this.isPosInBoard(pos)) {
      this.el[pos.y][pos.x].html.id = id;
    }
  }

  public placePieceInPos(pos: Pos, piece: (AnyPiece|null), transitionDelayMs: number, appendHtml?: boolean): void {
    if (piece === null || !piece.html) {    
      this.el[pos.y][pos.x].setPiece(piece);
      return;
    }
    const pieceDiv = piece.html as HTMLDivElement;
    if (appendHtml) {
      this.piecesHtml.append(pieceDiv);
    }
    this.setPieceTransitionDeley(pieceDiv, transitionDelayMs);
    this.transformPieceHtmlToPos(pieceDiv, pos);
    setTimeout(() => {
      this.setPieceTransitionDeley(pieceDiv, 0);
    }, transitionDelayMs);
    this.el[pos.y][pos.x].setPiece(piece);
  }

  private transformPieceHtmlToPos(pieceHtml: HTMLDivElement, pos: Pos): void {
    pieceHtml.style.transform = 
      `translate(
        ${pos.x * this.piecesHtml.offsetWidth  / FIELDS_IN_ONE_ROW}px,
        ${pos.y * this.piecesHtml.offsetHeight / FIELDS_IN_ONE_ROW}px
      )`;
  }

  private switchCurrTeam(): void {
    this.currTeam =
      (this.currTeam === TEAMS.WHITE) ? 
      TEAMS.BLACK : 
      TEAMS.WHITE;
  }

  public getKingByTeam(team: number) {
    const kingPos = this.findKingPos(team);
    return this.el[kingPos.y][kingPos.x].piece as King;
  }

  public movePiece(from: Pos, to: Pos, piece: AnyPiece, transitionDelayMs: number): void {
    const capturedPiece =  this.el[to.y][to.x].piece;
    if (capturedPiece !== null) {
      this.removePieceInPos(to, true);
    }
    this.moves.push(
      this.createNewMoveObj(piece, from, to, capturedPiece)
    );
    this.switchCurrTeam();
    this.placePieceInPos(to, piece, transitionDelayMs);
    piece.sideEffectsOfMove(to, from);
    const enemyKing = this.getKingByTeam(piece.enemyTeamNum);
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

  private createNewMoveObj(piece: AnyPiece, from: Pos, to: Pos, capturedPiece: (Piece|null)): Move {
    if (this.isInverted) {
      from.invert();
      to.invert();
    }
    return new Move(piece, from, to, capturedPiece);
  }

  public removePieceInPos(pos: Pos, html: boolean) {
    if (html) {
      this.el[pos.y][pos.x].piece?.html.remove();
    }
    this.el[pos.y][pos.x].setPiece(null);
  }

  // private getKings(): { white: King; black: King; } {
  //   let whiteKing: (King|null) = null;
  //   let blackKing: (King|null) = null;
  //   let kings: {
  //     white: King;
  //     black: King;
  //   } = {
  //     white: new King(TEAMS.WHITE, this),
  //     black: new King(TEAMS.BLACK, this)
  //   }
  //   for (let r=0 ; r<this.el.length ; r++) {
  //     for(let c=0 ; c<this.el[r].length ; c++) {
  //       if (this.el[r][c].piece?.id === PIECES.KING) {
  //         switch ((this.el[r][c].piece as Piece).team) {
  //           case TEAMS.WHITE: 
  //             if (whiteKing !== null) {
  //               this.match.end();
  //               alert("Too many kings");
  //               return kings;
  //             }
  //             whiteKing = this.el[r][c].piece as King; 
  //             break;
  //           case TEAMS.BLACK: 
  //             if (blackKing !== null) {
  //               this.match.end();
  //               alert("Too many kings");
  //               return kings;
  //             }
  //             blackKing = this.el[r][c].piece as King; 
  //             break;
  //         }
  //       }
  //     }
  //   }
  //   if (whiteKing === null || blackKing === null) {
  //     this.match.end();
  //     alert("Not enough kings on the board"); 
  //   } else {
  //     kings = {
  //       white: whiteKing,
  //       black: blackKing
  //     }
  //   }

  //   return kings;
  // }

  public findKingPos(team: number): Pos {
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

  public showPossibleMoves(possMoves: Pos[], enemyTeamNum: number): void {
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

  public hidePossibleMoves(): void {
    document.querySelectorAll("[data-poss-move]").forEach(possMove => {
      possMove.remove();
    });
  }

  private createArrOfPieces(): ArrOfPieces2d {
    return this.el.map(row => row.map(field => field.piece));
  }

  private flipPerspective(): void {
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
    this.isInverted = (this.isInverted) ? false : true;
  }

  private invertMap(map: ArrOfPieces2d): ArrOfPieces2d {
    return map.reverse().map(row => row.reverse());
  }

  public isDrawByInsufficientMaterial(): boolean {
    return (
      this.isPositionKingVsKing() || 
      this.isPositionKingAndBishopVsKing() || 
      this.isPositionKingAndKnightVsKing() || 
      this.isPositionKingAndBishopVsKingAndBishop() // both bishops on squeres of the same color
    );
  }

  private isPositionKingVsKing(): boolean {
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (
          this.el[r][c].piece !== null && 
          (this.el[r][c].piece as AnyPiece).id !== PIECES.KING
        ) {
          return false;
        }
      }
    }
    return true;
  }

  private isPositionKingAndBishopVsKing(): boolean {
    return this.isPositionKingAndSomePieceVsKing(PIECES.BISHOP);
  }

  private isPositionKingAndKnightVsKing(): boolean {
    return this.isPositionKingAndSomePieceVsKing(PIECES.KNIGHT);
  }

  private isPositionKingAndSomePieceVsKing(pieceId: number): boolean {
    let pieceOccurrencesCounter = 0;
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.id === pieceId) {
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

  private isPositionKingAndBishopVsKingAndBishop(): boolean { // both bishops on squeres of the same color
    const bishops: Pos[] = [];
    for (let r=0 ; r<this.el.length ; r++) {
      for (let c=0 ; c<this.el[r].length ; c++) {
        if (this.el[r][c].piece?.id === PIECES.BISHOP) {
          if (bishops.length >= 2) {
            return false;
          }
          bishops.push(new Pos(r, c));
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
    return this.isTwoEnemyBishopsOnTheSameColor(bishops);
  }

  private isTwoEnemyBishopsOnTheSameColor(bishopsPos: Pos[]): boolean {
    if (bishopsPos.length !== 2) {
      return false;
    }
    const bishop1 = this.el[bishopsPos[0].y][bishopsPos[0].x].piece as Piece;
    const bishop2 = this.el[bishopsPos[1].y][bishopsPos[1].x].piece as Piece;

    return (
      bishop1.team !== bishop2.team && 
      this.isPositionsOnTheSameColor(bishopsPos[0], bishopsPos[1])
    );
  }

  private isPositionsOnTheSameColor(pos1: Pos, pos2: Pos): boolean {
    const pos1OnWhiteSquere = 
      this.el[pos1.y][pos1.x].html.className.includes(FIELDS_CLASS_NAMES.fieldColor1);
    const pos2OnWhiteSquere = 
      this.el[pos2.y][pos2.x].html.className.includes(FIELDS_CLASS_NAMES.fieldColor1);

    return pos1OnWhiteSquere === pos2OnWhiteSquere;
  }

  public isDrawByNoCapturesOrPawnMovesIn50Moves(): boolean {
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

  public isDrawByThreeMovesRepetition(): boolean {
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
      Piece.isArrContainingEqualPieces(
        p1Moves[0].capturedPiece, 
        p1Moves[1].capturedPiece, 
        p1Moves[2].capturedPiece
      ) && // true if all captures are null since every piece can only be captured once
      Piece.isArrContainingEqualPieces(
        p2Moves[0].capturedPiece, 
        p2Moves[1].capturedPiece, 
        p2Moves[2].capturedPiece
      ) // true if all captures are null since every piece can only be captured once
    );
  }

  public isPosInBoard(pos: Pos): boolean {
    return (
      pos.x >= 0 && pos.x <= FIELDS_IN_ONE_ROW-1 && 
      pos.y >= 0 && pos.y <= FIELDS_IN_ONE_ROW-1
    );
  }

  private updateFieldSize(): void {
    const root = document.querySelector(":root") as HTMLElement;
    root.style.setProperty("--fieldSize", `${this.html.offsetWidth / FIELDS_IN_ONE_ROW}px`);
  }

  public removeEventListenersFromPieces() {
    for (const row of this.el) {
      for (const field of row) {
        field.piece?.stopListeningForClicks();
      }
    }
  }

  get startQueenPosWhite(): Pos {
    const queenDefaultXPos = 3;
    const startYPos = FIELDS_IN_ONE_ROW-1;
    return new Pos(startYPos, queenDefaultXPos, this.isInverted); 
  }

  get startKingPosWhite(): Pos {
    const kingDefaultXPos = 4;
    const startYPos = FIELDS_IN_ONE_ROW-1;
    return new Pos(startYPos, kingDefaultXPos, this.isInverted);
  }

  get startQueenPosBlack(): Pos {
    const queenDefaultXPos = 3;
    const startYPos = 0;
    return new Pos(startYPos, queenDefaultXPos, this.isInverted); 
  }

  get startKingPosBlack(): Pos {
    const kingDefaultXPos = 4;
    const startYPos = 0;
    return new Pos(startYPos, kingDefaultXPos, this.isInverted); 
  }
}