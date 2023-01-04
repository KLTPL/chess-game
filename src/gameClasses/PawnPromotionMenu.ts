import Board, { FIELDS_IN_ONE_ROW } from "./Board.js";
import Piece, { PIECES, TEAMS } from "./Pieces/Piece.js";

export default class PawnPromotionMenu {
  private html: HTMLElement;
  public playerIsChoosing: Promise<number>;
  constructor(private team: TEAMS, private board: Board) {
    const promotionOptions = this.createArrOfPromoteOptionsHtml();
    this.html = this.createContainerHtml(promotionOptions);
    this.board.html.append(this.html);
    this.playerIsChoosing = this.waitForPlayersDecision(promotionOptions);
  }

  private createContainerHtml(promoteOptions: HTMLDivElement[]): HTMLDivElement {
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

  private createArrOfPromoteOptionsHtml(): HTMLDivElement[] {
    const promoteOptionNums = [
      PIECES.BISHOP, 
      PIECES.KNIGHT, 
      PIECES.ROOK, 
      PIECES.QUEEN
    ];

    return promoteOptionNums.map(num => {
      const optionContainer = document.createElement("div");
      const optionPiece = Piece.createPromoteOptionHtml(num, this.team);
      optionPiece.dataset.optNum = num.toString();
      optionContainer.append(optionPiece);
      return optionContainer;
    });
  }

  private waitForPlayersDecision(promoteOptionsHtml: HTMLDivElement[]): Promise<number> {
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

  public removeMenu(): void {
    this.html.remove();
  }
}