import Board from "./Board.js";

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
    const fieldWidth = this.board.piecesHtml.offsetWidth / this.board.fieldsInOneRow;
    this.html = document.createElement("div");
    this.html.classList.add("promote-popup");
    this.html.style.setProperty("--widthOfFiveFields", `${fieldWidth*5}px`);
    this.html.style.setProperty("--widthOfThreeFields", `${fieldWidth*3}px`);
    this.html.style.setProperty("--quarterOfField", `${fieldWidth*0.25}px`);
    const promoteOptionsNum = [
      this.board.bishopNum, 
      this.board.knightNum, 
      this.board.rookNum, 
      this.board.queenNum
    ];
    for (let option of promoteOptionsNum) {
      const optionContainer = document.createElement("div");
      const optionPiece = this.board.getNewHtmlPiece(option, this.team, "promote-option");
      optionPiece.dataset.optNum = option.toString();
      this.optionsHtmls.push(optionPiece);
      optionContainer.append(optionPiece);
      this.html.append(optionContainer);
    }
    this.board.html.append(this.html);
    this.playerIsChoosing = this.askWhatPiecePlayerWants();
  }

  askWhatPiecePlayerWants() {
    return new Promise<number>((resolve) => {
      for (let optHtml of this.optionsHtmls) {
        optHtml.addEventListener("click", ev => {
          const target = ev.target as HTMLElement;
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