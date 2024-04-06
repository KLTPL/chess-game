import type { Players } from "../controller/MatchController";
import type Player from "../controller/Player";
import type BoardView from "./BoardView";

export const CLASS_NAMES = {
  piece: "piece",
  thisHtml: "board-container",
  thisHtmlDefaultWidth: "board-container-default-width",
  fieldsContainer: "board-fields-container",
  piecesContainer: "board-pieces-container",
  buttonsContainer: "buttons-container",
  playerContainerTop: "player-container-top",
  playerContainerBottom: "player-container-bottom",
  buttonArrow: "arrow-button",
  playerContainer: "player-container",
  playerImageNameContainer: "player-image-name-container",
  playerImage: "player-image",
  playerImageWhite: "player-image-white",
  playerImageBlack: "player-image-black",
  playerName: "player-name",
  playerNameName: "player-name-name",
  playerNameDisplay: "player-name-display",
  playerFill: "player-fill",
  playerPiece: "player-piece",
  playerTime: "player-time",
};

export const BUTTON_ID_BACK = "back";
export const BUTTON_ID_FORWARD = "forward";

export default class BoardHTMLFactory {
  public static createBoardContainer(): HTMLDivElement {
    // <div class="board-container"></div>
    const containerHtml = document.createElement("div");
    containerHtml.classList.add(CLASS_NAMES.thisHtml);
    return containerHtml;
  }

  public static createContainerForFields(): HTMLDivElement {
    // <div class="board-fields-container"></div>
    const fieldsHtml = document.createElement("div");
    fieldsHtml.classList.add(CLASS_NAMES.fieldsContainer);
    fieldsHtml.addEventListener("contextmenu", (ev) => ev.preventDefault());
    return fieldsHtml;
  }

  public static createContainerForPieces(): HTMLDivElement {
    // <div class="board-pieces-container"></div>
    const piecesHtml = document.createElement("div");
    piecesHtml.classList.add(CLASS_NAMES.piecesContainer);
    piecesHtml.addEventListener("contextmenu", (ev) => ev.preventDefault());
    return piecesHtml;
  }

  public static createContainerForButtons(
    boardView: BoardView
  ): HTMLDivElement {
    const container = document.createElement("div");
    container.classList.add(CLASS_NAMES.buttonsContainer);
    const buttonBack = createButtonBack();
    const buttonForward = createButtonForward();
    const buttonInvert = createButtonInvert(boardView);
    container.append(buttonBack, buttonInvert, buttonForward);
    return container;
  }

  public static createPlayerContainers(
    players: Players,
    isInverted: boolean,
    isOnlineGame: boolean
  ): { top: HTMLDivElement; bottom: HTMLDivElement } {
    if (isInverted) {
      return {
        top: createPlayerContainer(players.white, true, isOnlineGame),
        bottom: createPlayerContainer(players.black, false, isOnlineGame),
      };
    }
    return {
      top: createPlayerContainer(players.black, true, isOnlineGame),
      bottom: createPlayerContainer(players.white, false, isOnlineGame),
    };
  }
}

function createButtonBack(): HTMLButtonElement {
  const buttonBack = document.createElement("button");
  const innerDiv = document.createElement("div");
  innerDiv.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg"  fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>';
  buttonBack.id = BUTTON_ID_BACK;
  buttonBack.classList.add(CLASS_NAMES.buttonArrow);
  buttonBack.append(innerDiv);
  return buttonBack;
}

function createButtonForward(): HTMLButtonElement {
  const buttonFroward = document.createElement("button");
  const innerDiv = document.createElement("div");
  innerDiv.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"/></svg>';
  buttonFroward.id = BUTTON_ID_FORWARD;
  buttonFroward.classList.add(CLASS_NAMES.buttonArrow);
  buttonFroward.append(innerDiv);
  return buttonFroward;
}

function createButtonInvert(boardView: BoardView): HTMLButtonElement {
  const buttonInvert = document.createElement("button");
  buttonInvert.addEventListener("click", () => boardView.invert());
  buttonInvert.innerText = "obróć";
  return buttonInvert;
}

function createPlayerContainer(
  player: Player,
  isTop: boolean,
  isOnlineGame: boolean
): HTMLDivElement {
  const div = document.createElement("div");
  div.classList.add(CLASS_NAMES.playerContainer);
  div.classList.add(
    isTop ? CLASS_NAMES.playerContainerTop : CLASS_NAMES.playerContainerBottom
  );
  div.append(createPlayerImageNameContainer(player, isOnlineGame));
  div.append(createPlayerFill());
  div.append(createPlayerTime(isOnlineGame));

  return div;
}

function createPlayerImageNameContainer(player: Player, isOnlineGame: boolean) {
  const container = document.createElement("a");
  container.classList.add(CLASS_NAMES.playerImageNameContainer);
  if (isOnlineGame) {
    container.href = `/friends#search=@${player.getName()};`;
  }

  container.append(
    createPlayerImage(player),
    createPlayerName(player, isOnlineGame)
  );
  return container;
}

function createPlayerImage(player: Player) {
  const container = document.createElement("div");
  container.classList.add(CLASS_NAMES.playerImage);
  container.classList.add(
    player.isWhite()
      ? CLASS_NAMES.playerImageWhite
      : CLASS_NAMES.playerImageBlack
  );

  const points = player.countCapturedPoints();
  if (points > 0) {
    const div = document.createElement("div");
    div.innerText = String(points);
    container.append(div);
  }
  return container;
}

function createPlayerName(player: Player, isOnlineGame: boolean) {
  const container = document.createElement("div");
  container.classList.add(CLASS_NAMES.playerName);

  const displayName = document.createElement("div");
  displayName.classList.add(CLASS_NAMES.playerNameDisplay);
  displayName.innerText = player.getDisplayName();

  const name = document.createElement("a");
  name.classList.add(CLASS_NAMES.playerNameName);
  name.innerText = `@${player.getName()}`;

  container.append(displayName);

  if (isOnlineGame) {
    container.append(name);
  }

  return container;
}

function createPlayerFill() {
  const div = document.createElement("div");
  div.classList.add(CLASS_NAMES.playerFill);
  return div;
}

function createPlayerTime(isOnlineGame: boolean) {
  const container = document.createElement("div");
  container.classList.add(CLASS_NAMES.playerTime);
  container.innerText = isOnlineGame ? "Online" : "Lokalna";
  return container;
}
