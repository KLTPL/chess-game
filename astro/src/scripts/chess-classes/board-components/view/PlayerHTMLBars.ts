import BoardHTMLFactory from "./BoardHTMLFactory";
import type BoardView from "./BoardView";

export default class PlayerHTMLBars {
  private top: HTMLElement | null = null;
  private bottom: HTMLElement | null = null;
  constructor(private boardView: BoardView) {
    this.appendNewBars();
  }

  public appendNewBars() {
    if (this.top !== null) {
      this.top.remove();
    }
    if (this.bottom !== null) {
      this.bottom.remove();
    }
    const { top, bottom } = BoardHTMLFactory.createPlayerContainers(
      this.boardView.match.players,
      this.boardView.isInverted,
      this.boardView.match.isGameOnline
    );
    this.boardView.html.append(top);
    this.boardView.html.append(bottom);
    this.top = top;
    this.bottom = bottom;
  }
}
