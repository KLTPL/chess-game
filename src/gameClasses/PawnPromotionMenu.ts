import Board, { FIELDS_IN_ONE_ROW } from "./Board.js";
import Piece, { PIECES } from "./Pieces/Piece.js";

export default class PawnPromotionMenu {
  team: number;
  board: Board;
  optionsHtmls: HTMLElement[];
  html: HTMLElement;
  playerIsChoosing: Promise<number>;
  constructor(team: number, board: Board) {
    this.team = team;
    this.board = board;
    this.optionsHtmls = [];

    const promotionOptions = this.createArrOfPromoteOptionsHtml();
    this.html = this.createContainerHtml(promotionOptions);
    this.board.html.append(this.html);
    this.playerIsChoosing = this.waitForPlayersDecision(promotionOptions);
  }

  createContainerHtml(promoteOptions: HTMLDivElement[]) {
    const fieldWidth = this.board.piecesHtml.offsetWidth / FIELDS_IN_ONE_ROW;
    const container = document.createElement("div");
    container.classList.add("promote-popup");
    container.style.setProperty("--widthOfFiveFields", `${fieldWidth*5}px`);
    container.style.setProperty("--widthOfThreeFields", `${fieldWidth*3}px`);
    container.style.setProperty("--quarterOfField", `${fieldWidth*0.25}px`);

    for (let option of promoteOptions) {
      container.append(option);
    }
    return container;
  }

  createArrOfPromoteOptionsHtml() {
    const promoteOptionNums = [
      PIECES.bishop, 
      PIECES.knight, 
      PIECES.rook, 
      PIECES.queen
    ];

    return promoteOptionNums.map(num => {
      const optionContainer = document.createElement("div");
      const optionPiece = Piece.createPromoteOptionHtml(num, this.team);
      optionPiece.dataset.optNum = num.toString();
      optionContainer.append(optionPiece);
      return optionContainer;
    });
  }

  waitForPlayersDecision(promoteOptionsHtml: HTMLDivElement[]) {
    return new Promise<number>((resolve) => {
      for (const optHtml of promoteOptionsHtml) {
        optHtml.addEventListener("click", ev => {
          const target = ev.target as HTMLDivElement;
          const chosenPieceNum = parseInt(target.dataset.optNum as string)
          resolve(chosenPieceNum);
        }, {once: true});
      }
    });
  }

  removeMenu() {
    this.html.remove();
  }
}