import { PIECES, type TEAMS } from "../../pieces/model/PieceModel";
import PieceView from "../../pieces/view/PieceView";
import BoardView from "./BoardView";
import { CLASS_NAMES as CLASS_NAMES_FIELD } from "./Field";

const CLASS_NAMES = {
  promotePopup: "promote-popup",
  promoteOption: "promote-option",
};

export default class PawnPromotionMenu {
  private html: HTMLElement;
  readonly playerIsChoosing: Promise<number>;
  constructor(team: TEAMS, board: BoardView) {
    const promotionOptions = this.createArrOfPromoteOptionsHtml(team);
    this.showOptionClassification(promotionOptions);
    this.html = this.createContainerHtml(promotionOptions);
    board.html.append(this.html);
    this.playerIsChoosing = this.waitForPlayersDecision(promotionOptions);
    this.playerIsChoosing.then(() => {
      this.removeMenu();
    });
  }

  private createContainerHtml(
    promoteOptions: HTMLDivElement[]
  ): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add(CLASS_NAMES.promotePopup);

    for (const option of promoteOptions) {
      container.append(option);
    }
    return container;
  }

  private createArrOfPromoteOptionsHtml(team: TEAMS): HTMLDivElement[] {
    const promoteOptionIds = [
      PIECES.BISHOP,
      PIECES.KNIGHT,
      PIECES.ROOK,
      PIECES.QUEEN,
    ];

    return promoteOptionIds.map((id) => {
      const optionContainer = document.createElement("div");
      const optionPiece = this.createPromoteOptionHtml(id, team);
      optionPiece.dataset.optId = id.toString();
      optionContainer.append(optionPiece);
      return optionContainer;
    });
  }

  private createPromoteOptionHtml(piece: number, team: TEAMS): HTMLDivElement {
    const option = document.createElement("div");
    option.classList.add(CLASS_NAMES.promoteOption);

    const specificClassName = PieceView.getClassNameByPiece(piece, team);
    if (specificClassName !== null) {
      option.classList.add(specificClassName);
    }
    return option;
  }

  private showOptionClassification(promotionOptions: HTMLDivElement[]) {
    const isBlunder = Math.floor(Math.random() * 2) === 0;
    const classification = document.createElement("div");
    classification.classList.add(
      CLASS_NAMES_FIELD.fieldMoveClassification,
      isBlunder
        ? CLASS_NAMES_FIELD.fieldBlunder
        : CLASS_NAMES_FIELD.fieldBrilliant
    );
    (
      promotionOptions[
        Math.floor(Math.random() * promotionOptions.length)
      ].querySelector(`.${CLASS_NAMES.promoteOption}`) as HTMLDivElement
    ).append(classification);
  }

  private waitForPlayersDecision(
    promoteOptionsHtml: HTMLDivElement[]
  ): Promise<PIECES> {
    return new Promise<PIECES>((resolve) => {
      for (const optHtml of promoteOptionsHtml) {
        optHtml.addEventListener(
          "click",
          (ev) => {
            const target = ev.target as HTMLDivElement;
            const chosenPieceNum = parseInt(target.dataset.optId as string);
            resolve(chosenPieceNum);
          },
          { once: true }
        );
      }
    });
  }

  private removeMenu(): void {
    this.html.remove();
  }
}
