import PieceModel from "../../pieces/model/PieceModel";
import PieceView from "../../pieces/view/PieceView";
import BoardModel from "../model/BoardModel";
import type Pos from "../model/Pos";
import type BoardView from "./BoardView";

const ID_SELECTED_PIECE_MOUSE = "move-mouse";
const ID_SELECTED_PIECE_TOUCH = "move-touch";
export const HOLD_MOUSE_TIME_MS = 150;
const HOLD_TOUCH_TIME_MS = 125;
export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT = 30;
export const CSS_PIECE_TRANSITION_DELAY_MS_MOVE_NONE = 0;

export const hold = (
  element: HTMLElement,
  rejectEventType: string,
  timeMs: number
) => {
  return new Promise<void>((resolve, reject) => {
    element.addEventListener(
      rejectEventType,
      () => {
        reject();
      },
      { once: true }
    );
    setTimeout(() => {
      resolve();
    }, timeMs);
  });
};

type SelectedPieceData = {
  piece: PieceView;
  grabbedFrom: Pos;
  possMoves: Pos[];
  isHold: boolean | null; // null if not set yet
} | null;

export default class DragAndDropPieces {
  private selectedPieceData: SelectedPieceData = null;
  constructor(private boardView: BoardView) {
    this.startListeningForClicks();
  }
  private startListeningForClicks(): void {
    window.addEventListener("mousedown", (ev) => this.handleEventStart(ev));
    window.addEventListener("mouseup", (ev) => this.handleEventEnd(ev));
    window.addEventListener(
      "touchstart",
      (ev) => {
        this.handleEventStart(ev);
        if (
          BoardModel.isPosInBounds(
            this.boardView.calcFieldPosByPx(
              ev.changedTouches[0].clientX,
              ev.changedTouches[0].clientY
            )
          )
        ) {
          ev.preventDefault(); // so the mouse events are canceled (mousedown)
        }
      },
      { passive: false } // passive so the ev.preventDefault() function works
    );
    window.addEventListener("touchend", (ev) => this.handleEventEnd(ev));
    window.addEventListener("mousemove", (ev) => this.handleMouseMove(ev));
    window.addEventListener("touchmove", (ev) => this.hanldeTouchMove(ev));
  }

  private isEventValid(ev: MouseEvent | TouchEvent, pos: Pos): boolean {
    const isMouse = DragAndDropPieces.isEventMouseEvent(ev);
    const m = this.boardView.match;
    if (
      !BoardModel.isPosInBounds(pos) ||
      !m.isGameRunning ||
      this.boardView.pawnPromotionMenu.getPlayerChoosingPromise() !== null ||
      this.boardView.match.analisisSystem.isUserAnalising()
    ) {
      return false;
    }
    if (isMouse) {
      const leftClickNum = 0;
      if (ev.button !== leftClickNum) {
        return false;
      }
    } else {
      const touch = ev.changedTouches[0];
      if (touch.identifier > 0) {
        return false;
      }
    }
    return true;
  }
  private handleEventStart(ev: MouseEvent | TouchEvent) {
    const c = this.boardView.match;
    const isMouse = DragAndDropPieces.isEventMouseEvent(ev);
    const posFixed = this.getPosByEv(ev).getInvProp(this.boardView.isInverted);
    if (!this.isEventValid(ev, posFixed)) {
      if (this.selectedPieceData !== null) {
        this.stopFollowing(ev);
      }
      return;
    }
    if (this.selectedPieceData !== null) {
      this.stopFollowing(ev);
      return;
    }
    if (
      !c.boardModel.isPosOccupied(posFixed) ||
      c.getTeamOfUserToMove(c.getCurrTeam()) !==
        c.boardModel.getPiece(posFixed)?.team
    ) {
      return;
    }
    const possMoves = c.getPossMovesFromPos(posFixed);
    const team = c.getPieceTeamAtPos(posFixed);
    const pieceView = this.boardView.getField(posFixed).getPiece();
    if (pieceView === null) {
      throw new Error(
        `There is no piece (PieceView) at provided position (x = ${posFixed.x}, y = ${posFixed.y})`
      );
    }
    this.boardView.showEventsOnBoard.showFieldPieceWasSelectedFrom(posFixed);
    this.boardView.showEventsOnBoard.showPossibleMoves(
      possMoves.filter((move) => !move.isEqualTo(posFixed)),
      PieceModel.getEnemyTeam(team),
      posFixed
    );
    this.selectedPieceData = {
      piece: pieceView,
      grabbedFrom: posFixed,
      possMoves,
      isHold: null,
    };
    if (isMouse) {
      this.startFollowingMouse(ev, pieceView);
    } else {
      this.startFollowingTouch(ev, pieceView);
    }
  }

  private startFollowingMouse(ev: MouseEvent, pieceView: PieceView): void {
    pieceView.setHTMLId(ID_SELECTED_PIECE_MOUSE);
    this.handleMouseMove(ev);
    hold(window.document.body, "mouseup", HOLD_MOUSE_TIME_MS)
      .then(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = true;
        }
      })
      .catch(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = false;
        }
      });
  }
  private startFollowingTouch(ev: TouchEvent, pieceView: PieceView): void {
    hold(window.document.body, "touchend", HOLD_TOUCH_TIME_MS)
      .then(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = true;
          pieceView.setHTMLId(ID_SELECTED_PIECE_TOUCH);
          this.hanldeTouchMove(ev);
        }
      })
      .catch(() => {
        if (this.selectedPieceData !== null) {
          this.selectedPieceData.isHold = false;
          this.boardView.showEventsOnBoard.showFieldUnderMovingPiece(
            this.boardView.calcFieldPosByPx(
              ev.changedTouches[0].clientX,
              ev.changedTouches[0].clientY
            )
          );
        }
      });
  }
  private handleEventEnd(ev: MouseEvent | TouchEvent) {
    if (
      this.selectedPieceData !== null &&
      this.selectedPieceData.isHold === true
    ) {
      this.boardView.showEventsOnBoard.stopShowingRowAndColUserIsTouching();
      this.stopFollowing(ev);
    }
  }
  private async stopFollowing(ev: MouseEvent | TouchEvent) {
    if (this.selectedPieceData === null) {
      throw new Error(
        "Can not stop following becouse selected piece data is null"
      );
    }
    const s = this.selectedPieceData;
    s.piece.setHTMLId(""); // remove the ID_SELECTED_PIECE_MOUSE
    this.boardView.showEventsOnBoard.stopShowingFieldPieceWasSelectedFrom();
    this.boardView.showEventsOnBoard.stopShowingFieldUnderMovingPiece();
    this.boardView.showEventsOnBoard.stopShowingPossibleMoves();
    const newPosFixed = this.getPosByEv(ev).getInvProp(
      this.boardView.isInverted
    );
    const oldPos = s.grabbedFrom;
    for (const possMove of s.possMoves) {
      if (possMove.isEqualTo(newPosFixed) && !newPosFixed.isEqualTo(oldPos)) {
        this.selectedPieceData = null;
        await this.boardView.match.movePiece(oldPos, newPosFixed);
        return;
      }
    }
    this.boardView.placePieceInPos(
      oldPos,
      s.piece,
      this.calcTransitionDelay(oldPos, newPosFixed),
      false
    );
    this.selectedPieceData = null;
  }

  private handleMouseMove(ev: MouseEvent): void {
    if (this.selectedPieceData === null) {
      return;
    }
    const pos = this.boardView
      .calcFieldPosByPx(ev.clientX, ev.clientY)
      .getInvProp(this.boardView.isInverted);
    this.boardView.showEventsOnBoard.showFieldUnderMovingPiece(pos);
    this.selectedPieceData.piece.moveHTMLToPointer(
      ev.clientX,
      ev.clientY,
      this.boardView
    );
  }

  private hanldeTouchMove(ev: TouchEvent): void {
    if (this.selectedPieceData === null) {
      return;
    }
    const pos = this.boardView
      .calcFieldPosByPx(
        ev.changedTouches[0].clientX,
        ev.changedTouches[0].clientY
      )
      .getInvProp(this.boardView.isInverted);
    this.boardView.showEventsOnBoard.showFieldUnderMovingPiece(pos);
    if (this.selectedPieceData.isHold === true) {
      this.boardView.showEventsOnBoard.showNewRowAndColUserIsTouching(
        this.boardView.calcFieldPosByPx(
          ev.changedTouches[0].clientX,
          ev.changedTouches[0].clientY
        )
      );
    }
    this.selectedPieceData.piece.moveHTMLToPointer(
      ev.changedTouches[0].clientX,
      ev.changedTouches[0].clientY,
      this.boardView
    );
  }

  private calcTransitionDelay(oldPos: Pos, newPos: Pos): number {
    const distanceX = Math.abs(newPos.x - oldPos.x);
    const distanceY = Math.abs(newPos.y - oldPos.y);
    const distance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));
    return distance * CSS_PIECE_TRANSITION_DELAY_MS_MOVE_DEFAULT * 0.666;
  }

  public getPosByEv(ev: MouseEvent | TouchEvent) {
    const isMouse = DragAndDropPieces.isEventMouseEvent(ev);
    const pos = isMouse
      ? this.boardView.calcFieldPosByPx(ev.clientX, ev.clientY)
      : this.boardView.calcFieldPosByPx(
          ev.changedTouches[0].clientX,
          ev.changedTouches[0].clientY
        );
    return pos;
  }

  public getSelectedPieceData() {
    return this.selectedPieceData;
  }

  public static isEventMouseEvent(
    ev: MouseEvent | TouchEvent
  ): ev is MouseEvent {
    return ev.type.includes("mouse");
  }
}
