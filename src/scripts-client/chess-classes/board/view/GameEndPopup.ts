import { END_REASONS_ID_DB, GAME_RESULTS_ID_DB } from "../../../../db/types";
import type Player from "../controller/Player";
import type BoardView from "./BoardView";

const CLASS_NAMES = {
  resultContainer: "end-popup-container",
  closeBtnContainer: "close-btn-container",
  resultHeader: "end-popup-header",
  endPopupReason: "end-popup-reason",
  playersDataContainer: "players-data-container",
  playerData: "player-data",
  playerDataDisplay: "player-data-display",
  playerDataName: "player-data-name",
  playerDataWhite: "player-data-white",
  playerDataBlack: "player-data-black",
  playerDataWon: "player-data-won",
};

type ShowData = {
  resultId: GAME_RESULTS_ID_DB;
  reasonId: END_REASONS_ID_DB;
  playerW: Player;
  playerB: Player;
  isGameOnline: boolean;
};

export default class GameEndPopup {
  private html: HTMLDialogElement | null = null;
  constructor(private langData: Record<string, string>) {}

  public show(data: ShowData, boardView: BoardView) {
    this.stopShowing();
    this.html = this.createHTML(data);
    boardView.html.append(this.html);
    this.html.show();
  }

  private stopShowing() {
    this.html?.remove();
    this.html = null;
  }

  private createHTML({
    resultId,
    reasonId,
    playerW,
    playerB,
    isGameOnline,
  }: ShowData) {
    const container = document.createElement("dialog");
    container.classList.add(CLASS_NAMES.resultContainer);

    container.append(this.createCloseBtn());
    container.append(this.createHeader(this.getEndResultName(resultId)));
    container.append(this.createReason(this.getEndReasonName(reasonId)));
    container.append(
      this.createPlayersDataContainer(playerW, playerB, resultId, isGameOnline)
    );

    return container;
  }
  private createCloseBtn() {
    const div = document.createElement("button");
    div.classList.add(CLASS_NAMES.closeBtnContainer);
    div.onclick = () => {
      this.stopShowing();
    };
    return div;
  }
  private createHeader(resultName: string) {
    const header = document.createElement("h5");
    header.classList.add(CLASS_NAMES.resultHeader);
    header.innerText =
      resultName.slice(0, 1).toUpperCase() + resultName.slice(1);

    return header;
  }
  private createReason(endReasonName: string) {
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES.endPopupReason);

    div.innerText = `${this.langData["reason"]} ${endReasonName}`;

    return div;
  }
  private createPlayersDataContainer(
    playerW: Player,
    playerB: Player,
    resultId: GAME_RESULTS_ID_DB,
    isGameOnline: boolean
  ) {
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES.playersDataContainer);

    div.append(
      this.createPlayerData(
        playerW,
        resultId === GAME_RESULTS_ID_DB.WHITE,
        isGameOnline
      )
    );
    div.append(
      this.createPlayerData(
        playerB,
        resultId === GAME_RESULTS_ID_DB.BLACK,
        isGameOnline
      )
    );

    return div;
  }
  private createPlayerData(
    player: Player,
    isWon: boolean,
    isGameOnline: boolean
  ) {
    const container = this.createPlayerDataContainer(
      player,
      isWon,
      isGameOnline
    );

    const displayName = document.createElement("span");
    displayName.classList.add(CLASS_NAMES.playerDataDisplay);
    displayName.innerText = player.getDisplayName();
    container.append(displayName);

    if (isGameOnline) {
      const name = document.createElement("span");
      name.classList.add(CLASS_NAMES.playerDataName);
      name.innerText = `@${player.getName()}`;
      container.append(name);
    }

    return container;
  }

  private createPlayerDataContainer(
    player: Player,
    isWon: boolean,
    isGameOnline: boolean
  ) {
    let container: HTMLAnchorElement | HTMLDivElement;
    if (isGameOnline) {
      const a = document.createElement("a");
      a.href = `/friends#search=@${player.getName()};`;
      container = a;
    } else {
      container = document.createElement("div");
    }

    container.classList.add(CLASS_NAMES.playerData);
    container.classList.add(
      player.isWhite()
        ? CLASS_NAMES.playerDataWhite
        : CLASS_NAMES.playerDataBlack
    );
    if (isWon) {
      container.classList.add(CLASS_NAMES.playerDataWon);
    }
    return container;
  }

  private getEndResultName(resultId: GAME_RESULTS_ID_DB) {
    switch (resultId) {
      case GAME_RESULTS_ID_DB.WHITE:
        return this.langData["result-white_win"];
      case GAME_RESULTS_ID_DB.BLACK:
        return this.langData["result-black_win"];
      case GAME_RESULTS_ID_DB.DRAW:
        return this.langData["result-draw"];
    }
  }
  private getEndReasonName(reasonId: END_REASONS_ID_DB) {
    switch (reasonId) {
      case END_REASONS_ID_DB.CHECKMATE:
        return this.langData["reason-checkmate"];
      case END_REASONS_ID_DB.RESIGNATION:
        return this.langData["reason-resignation"];
      case END_REASONS_ID_DB.TIMEOUT:
        return this.langData["reason-timeout"];
      case END_REASONS_ID_DB.STALEMATE:
        return this.langData["reason-stalemate"];
      case END_REASONS_ID_DB.INSUFFICENT:
        return this.langData["reason-insufficient_material"];
      case END_REASONS_ID_DB.MOVE_RULE_50:
        return this.langData["reason-50_move_rule"];
      case END_REASONS_ID_DB.REPETITION:
        return this.langData["reason-repetition"];
      case END_REASONS_ID_DB.AGREEMENT:
        return this.langData["reason-agreement"];
      case END_REASONS_ID_DB.DATA_ERROR:
        return "ERROR";
    }
  }
}
