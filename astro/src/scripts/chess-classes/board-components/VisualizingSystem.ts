import Board, { hold } from "./Board";
import { HOLD_MOUSE_TIME_MS } from "../pieces/Piece";
import Pos from "../Pos";
import VisualizingArrow from "./VisualizingArrow";

const HIGHLIGHT_FIELD_CLASS_NAME = "highlighted-field";

export default class VisualizingSystem {
  private arrows: VisualizingArrow[] = [];
  constructor(private board: Board) {
    this.board.html.addEventListener("mousedown", (ev) =>
      this.handleMouseDown(ev)
    );
    window.addEventListener("resize", () => this.resizeArrowsHtmls());
  }

  private resizeArrowsHtmls(): void {
    for (const arrow of this.arrows) {
      arrow.resize();
    }
  }

  private handleMouseDown(ev: MouseEvent): void {
    const leftMouse = 0;
    const rightMouse = 2;
    if (ev.button === leftMouse) {
      // mouse left click
      this.removeAllArrows();
      this.removeHighlightFromAllFields();
      return;
    }
    if (ev.button !== rightMouse || this.board.selectedPieceInfo !== null) {
      // mouse right click
      return;
    }

    const startPos = this.board.calcFieldPosByPx(ev.clientX, ev.clientY);
    hold(this.board.html, "mouseup", HOLD_MOUSE_TIME_MS)
      .then(() => {
        this.board.html.addEventListener(
          "mouseup",
          (endEv) => {
            const endPos = this.board.calcFieldPosByPx(
              endEv.clientX,
              endEv.clientY
            );
            if (startPos.isEqualTo(endPos)) {
              this.toggleHighlightOnFieldOnPos(startPos);
              return;
            }
            const matchingArrowNum = this.indexOfEqualArrow(startPos, endPos);
            if (matchingArrowNum !== null) {
              this.removeArrow(matchingArrowNum);
              return;
            }
            this.arrows.push(
              new VisualizingArrow(this.board, startPos, endPos)
            );
          },
          { once: true }
        );
      })
      .catch(() => {
        this.toggleHighlightOnFieldOnPos(startPos);
      });
  }

  private indexOfEqualArrow(startPos: Pos, endPos: Pos): number | null {
    for (let i = 0; i < this.arrows.length; i++) {
      const arrSPos = this.arrows[i].getStartPos();
      const arrEPos = this.arrows[i].getEndPos();
      if (startPos.isEqualTo(arrSPos) && endPos.isEqualTo(arrEPos)) {
        return i;
      }
    }
    return null;
  }

  private removeAllArrows(): void {
    while (this.arrows.length > 0) {
      this.removeArrow(0);
    }
  }

  private removeArrow(arrNum: number): void {
    this.arrows[arrNum].removeHtml();
    this.arrows.splice(arrNum, 1);
  }

  private toggleHighlightOnFieldOnPos(pos: Pos): void {
    const el = this.board
      .getFieldHtmlEl(pos)
      .querySelector(`.${HIGHLIGHT_FIELD_CLASS_NAME}`);
    if (el !== null) {
      el.remove();
    } else {
      const div = document.createElement("div");
      div.classList.add(HIGHLIGHT_FIELD_CLASS_NAME);
      this.board.getFieldHtmlEl(pos).append(div);
    }
  }

  private removeHighlightFromAllFields(): void {
    const fields = document.getElementsByClassName(HIGHLIGHT_FIELD_CLASS_NAME);
    for (let i = 0; i < fields.length; i++) {
      fields[i]?.remove();
      i--;
    }
  }
}
