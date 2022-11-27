import Board from "./Board.js";

export default class PawnPromotionMenu {
  team: number;
  board: Board;
  optionsHtmls: HTMLElement[];
  html: HTMLElement;
  waitingForDecision: Promise<number>;
  constructor(team: number, board: Board) {
    this.team = team;
    this.board = board;
    this.optionsHtmls = [];
    const fieldWidth = this.board.piecesHtml.offsetWidth/this.board.fieldsInOneRow;
    this.html = document.createElement("div");
    this.html.classList.add("promotePopup");
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
      const optionPiece = this.board.getNewHtmlPiece(option, this.team, "promoteOption");
      optionPiece.dataset.optNum = option.toString();
      this.optionsHtmls.push(optionPiece);
      optionContainer.append(optionPiece);
      this.html.append(optionContainer);
    }
    this.board.html.append(this.html);
    this.waitingForDecision = this.askWhatPiecePlayerWants();
  }

  askWhatPiecePlayerWants(): Promise<number> {
    return new Promise( (resolve) => {
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