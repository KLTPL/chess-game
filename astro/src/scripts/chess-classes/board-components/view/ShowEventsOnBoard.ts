import PieceModel, { TEAMS } from "../../pieces/model/PieceModel";
import type MatchController from "../controller/MatchController";
import BoardModel, { FIELDS_IN_ONE_ROW } from "../model/BoardModel";
import Pos from "../model/Pos";
import type BoardView from "./BoardView";
import { CLASS_NAMES as CLASS_NAMES_FIELD } from "./Field";

export default class ShowEvetsOnBoard {
  public moveClassification: Pos | null = null;
  constructor(
    private boardView: BoardView,
    private match: MatchController
  ) {}

  public async showLastMoveAndCheck(): Promise<void> {
    await this.match.waitForAnalisisSystemCreation();
    const halfmovesAmount = this.match.getHalfmovesAmount();
    const analisingSystem = this.match.analisisSystem;
    if (halfmovesAmount > 0 && !analisingSystem.isUserAnalisingMove0()) {
      const currHalfMove = this.match.getHalfmoveAt(
        analisingSystem.getIndexOfHalfmoveUserIsOn()
      );
      this.showNewLastMove(currHalfMove.from, currHalfMove.to);
      if (currHalfMove.isCheck()) {
        this.showCheck(currHalfMove.posOfKingChecked);
      }
    }

    if (this.moveClassification !== null) {
      this.invertMoveClassification();
    }
  }

  public turnOnCssGrabOnPieces(team?: TEAMS): void {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c).getInvProp(this.boardView.isInverted);
        const pieceV = this.boardView.getField(pos).getPiece();
        const pieceM = this.match.boardModel.getPiece(pos);
        if (
          pieceV !== null &&
          pieceM !== null &&
          (pieceM.team === team || team === undefined)
        ) {
          pieceV.addCssGrab();
        }
      }
    }
  }
  public turnOfCssGrabOnPieces(team?: TEAMS): void {
    for (let r = 0; r < FIELDS_IN_ONE_ROW; r++) {
      for (let c = 0; c < FIELDS_IN_ONE_ROW; c++) {
        const pos = new Pos(r, c);
        const pieceV = this.boardView.getField(pos).getPiece();
        const pieceM = this.match.boardModel.getPiece(
          pos.getInvProp(this.boardView.isInverted)
        );
        if (
          pieceV !== null &&
          pieceM !== null &&
          (pieceM.team === team || team === undefined)
        ) {
          pieceV.removeCssGrab();
        }
      }
    }
  }

  public showFieldUnderMovingPiece(pos: Pos): void {
    this.stopShowingFieldUnderMovingPiece();
    if (!BoardModel.isPosInBounds(pos)) {
      return;
    }
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldUnderMovingPiece);
    this.boardView.getField(pos).appendToHtml(div);
  }

  public stopShowingFieldUnderMovingPiece() {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldUnderMovingPiece}`);
  }

  public showFieldPieceWasSelectedFrom(pos: Pos): void {
    this.stopShowingFieldPieceWasSelectedFrom();
    const div = document.createElement("div");
    div.classList.add(CLASS_NAMES_FIELD.fieldPieceWasSelectedFrom);
    this.boardView.getField(pos).appendToHtml(div);
  }

  public stopShowingFieldPieceWasSelectedFrom() {
    this.stopShowingHighlight(
      `.${CLASS_NAMES_FIELD.fieldPieceWasSelectedFrom}`
    );
  }

  public showPossibleMoves(
    possMovesToShow: Pos[],
    enemyTeamNum: number,
    from: Pos
  ): void {
    for (const possMove of possMovesToShow) {
      const div = document.createElement("div");
      const isMoveCapture =
        this.match.boardModel.getPiece(possMove)?.team === enemyTeamNum ||
        (PieceModel.isPawn(this.match.boardModel.getPiece(from)) && // en passant
          from.x !== possMove.x);
      div.classList.add(
        CLASS_NAMES_FIELD.possMove,
        isMoveCapture
          ? CLASS_NAMES_FIELD.possMoveCapture
          : CLASS_NAMES_FIELD.possMovePlain
      );

      this.boardView.getField(possMove).appendToHtml(div);
    }
  }

  public stopShowingPossibleMoves(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.possMove}`);
  }

  public stopShowingCheck() {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldInCheck}`);
  }

  public showCheck(kingPos: Pos | null): void {
    if (kingPos != null) {
      this.stopShowingCheck();
      const div = document.createElement("div");
      div.classList.add(CLASS_NAMES_FIELD.fieldInCheck);
      this.boardView.getField(kingPos).appendToHtml(div);
    }
  }

  public showNewMoveClassification(pos: Pos): void {
    this.stopShowingMoveClassification();
    const rand = Math.floor(Math.random() * 20);
    switch (
      rand // both 5% chance
    ) {
      case 0:
        this.showBrilliantMove(pos);
        break;
      case 1:
        this.showBlunderMove(pos);
        break;
    }
  }

  private showBrilliantMove(pos: Pos): void {
    const div = document.createElement("div");
    div.classList.add(
      CLASS_NAMES_FIELD.fieldMoveClassification,
      CLASS_NAMES_FIELD.fieldBrilliant
    );
    this.boardView.getField(pos).getPiece()?.appendToHtml(div);
    this.moveClassification = new Pos(pos.y, pos.x);
  }

  private showBlunderMove(pos: Pos): void {
    const div = document.createElement("div");
    div.classList.add(
      CLASS_NAMES_FIELD.fieldMoveClassification,
      CLASS_NAMES_FIELD.fieldBlunder
    );
    this.boardView.getField(pos).getPiece()?.appendToHtml(div);
    this.moveClassification = new Pos(pos.y, pos.x);
  }

  public stopShowingMoveClassification(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldBrilliant}`);
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldBlunder}`);
    this.moveClassification = null;
  }

  public showNewRowAndColUserIsTouching(touch: Pos): void {
    this.stopShowingRowAndColUserIsTouching();
    if (BoardModel.isPosInBounds(touch)) {
      this.showRowAndColUserIsTouching(touch);
    }
  }

  public showRowAndColUserIsTouching(touch: Pos): void {
    const createHighlight = (): HTMLDivElement => {
      const highlight = document.createElement("div");
      highlight.classList.add(CLASS_NAMES_FIELD.fieldRowAndColHighlight);
      return highlight;
    };
    for (let i = 0; i < FIELDS_IN_ONE_ROW; i++) {
      this.boardView
        .getField(new Pos(i, touch.x))
        ?.appendToHtml(createHighlight());
      this.boardView
        .getField(new Pos(touch.y, i))
        ?.appendToHtml(createHighlight());
    }
  }

  public stopShowingRowAndColUserIsTouching(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldRowAndColHighlight}`);
  }

  public showNewLastMove(from: Pos, to: Pos): void {
    this.stopShowingLastMove();
    this.showLastMove(from, to);
  }

  private showLastMove(from: Pos, to: Pos): void {
    const toShow = [from, to];
    for (const pos of toShow) {
      const lastMove = document.createElement("div");
      lastMove.classList.add(CLASS_NAMES_FIELD.fieldLastMove);
      this.boardView.getField(pos).appendToHtml(lastMove);
    }
  }

  public stopShowingLastMove(): void {
    this.stopShowingHighlight(`.${CLASS_NAMES_FIELD.fieldLastMove}`);
  }

  private stopShowingHighlight(querySelectorAll: string): void {
    this.boardView.html.querySelectorAll(querySelectorAll).forEach((el) => {
      el.remove();
    });
  }

  private invertMoveClassification(): void {
    const div = document.querySelector(
      `.${CLASS_NAMES_FIELD.fieldMoveClassification}`
    ) as HTMLDivElement;
    div.remove();
    const pos = (this.moveClassification as Pos).getInvProp(
      this.boardView.isInverted
    );
    this.boardView.getField(pos).getPiece()?.appendToHtml(div);
  }
}
