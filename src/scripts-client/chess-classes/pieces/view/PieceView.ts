import Pos from "../../board/model/Pos";
import type BoardView from "../../board/view/BoardView";
import { TEAMS, PIECES } from "../model/PieceModel";

const PIECE_GRAB_CLASS_NAME = "grab";

export default class PieceView {
  private html: HTMLDivElement;
  constructor(
    id: PIECES,
    team: TEAMS,
    pos: Pos,
    boardPiecesHTML: HTMLDivElement,
    isBoardInverted: boolean
  ) {
    this.html = this.createNewHtmlPiece();
    this.addClassName(id, team);
    this.transformHtmlToPos(pos, isBoardInverted);
    // if (this.board.currTeam === this.team) {
    //   this.html.classList.add(PIECE_GRAB_CLASS_NAME);
    // }
    this.appendSelfToEl(boardPiecesHTML);
  }

  public transformHtmlToPos(pos: Pos, isBoardInverted: boolean): void {
    pos = pos.getInvProp(isBoardInverted);
    this.html.style.transform = `translate(
        ${pos.x * 100}%,
        ${pos.y * 100}%
      )`;
  }

  public setCssTransitionDeley(ms: number): void {
    this.html.style.setProperty("--transitionDuration", `${ms}ms`);
  }

  public sideEffectsOfMove(
    to: Pos,
    from: Pos,
    team: TEAMS,
    boardView: BoardView
  ): void {
    if (boardView.match.boardModel.isPawnPromotingAtMove(from, to)) {
      boardView.pawnPromotionMenu.show(team, boardView);
    }
  }

  public addCssGrab() {
    this.html.classList.add(PIECE_GRAB_CLASS_NAME);
  }

  public toggleCssGrab() {
    this.html.classList.toggle(PIECE_GRAB_CLASS_NAME);
  }

  public removeCssGrab() {
    this.html.classList.remove(PIECE_GRAB_CLASS_NAME);
  }

  private createNewHtmlPiece(): HTMLDivElement {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    return piece;
  }

  protected addClassName(pieceNum: PIECES, team: TEAMS): void {
    const specificClassName = PieceView.getClassNameByPiece(pieceNum, team);
    if (specificClassName !== null) {
      this.html.classList.add(specificClassName);
    }
  }

  public moveHTMLToPointer(
    clientX: number,
    clientY: number,
    boardView: BoardView
  ): void {
    const coor = boardView
      .calcFieldPosByPx(clientX, clientY)
      .getInvProp(boardView.isInverted);
    boardView.showEventsOnBoard.showFieldUnderMovingPiece(coor);

    const trans = this.html.style.transform; // format: 'transform(Xpx, Ypx)'
    const oldTranslateX = trans.slice(
      trans.indexOf("(") + 1,
      trans.indexOf(",")
    );
    const oldTranslateY = trans.slice(trans.indexOf(",") + 1, trans.length - 1);

    const newTranslateX = `${this.calcNewTranslateXValue(clientX, boardView)}px`;
    const newTranslateY = `${this.calcNewTranslateYValue(clientY, boardView)}px`;

    const translateX = coor.x === -1 ? oldTranslateX : newTranslateX;
    const translateY = coor.y === -1 ? oldTranslateY : newTranslateY;
    this.html.style.transform = `translate(${translateX}, ${translateY})`;
  }

  private calcNewTranslateXValue(
    clientX: number,
    boardView: BoardView
  ): number {
    return (
      clientX -
      (boardView.pageContainerHtml.offsetWidth -
        boardView.piecesHtml.offsetWidth) /
        2 -
      this.html.offsetWidth / 2
    );
  }

  private calcNewTranslateYValue(
    clientY: number,
    boardView: BoardView
  ): number {
    return (
      clientY -
      (boardView.pageContainerHtml.offsetHeight -
        boardView.piecesHtml.offsetHeight) /
        2 -
      this.html.offsetWidth / 2
    );
  }

  public setHTMLId(id: string): void {
    this.html.id = id;
  }
  public appendToHtml(el: HTMLElement) {
    this.html.append(el);
  }
  public appendSelfToEl(el: HTMLElement) {
    el.append(this.html);
  }
  public querySelector(selector: string) {
    return this.html.querySelector(selector);
  }

  public removeHtml(): void {
    this.html.remove();
  }

  public static getClassNameByPiece(
    pieceNum: PIECES,
    pieceTeam: TEAMS
  ): string | null {
    const teamChar = pieceTeam === TEAMS.BLACK ? "b" : "w";
    const name = (() => {
      switch (pieceNum) {
        case PIECES.KING:
          return "king";
        case PIECES.QUEEN:
          return "queen";
        case PIECES.BISHOP:
          return "bishop";
        case PIECES.KNIGHT:
          return "knight";
        case PIECES.ROOK:
          return "rook";
        case PIECES.PAWN:
          return "pawn";
        default:
          return null;
      }
    })();
    if (name === null) {
      console.error("Invalid piece number");
      return null;
    }
    return `${teamChar}-${name}`;
  }
}
