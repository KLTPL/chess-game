import type { APIGetPostHalfmove } from "../../../../db/types";
import type Halfmove from "./Halfmove";
import FENNotation from "./FENNotation";
import type { getResultNameProps } from "../../../../db/dict-game-result/getResultName";
import type { getEndReasonNameProps } from "../../../../db/dict-game-end-reason/getEndReasonName";

export default class FetchToDB {
  constructor(public gameDisplayId: string) {}

  public async postHalfmove(
    halfmove: Halfmove,
    halfmoveNum: number
  ): Promise<boolean> {
    const promotedTo = halfmove.getPromotedTo();

    const GetDBHalfmove: APIGetPostHalfmove = {
      halfmove_number: halfmoveNum,
      is_castling: halfmove.isCastling,
      king_checked_pos_x:
        halfmove.posOfKingChecked === null ? null : halfmove.posOfKingChecked.x,
      king_checked_pos_y:
        halfmove.posOfKingChecked === null ? null : halfmove.posOfKingChecked.y,
      piece_symbol_fen: FENNotation.convertPieceIdToFEN(halfmove.piece.id),
      pos_start_x: halfmove.from.x,
      pos_start_y: halfmove.from.y,
      pos_end_x: halfmove.to.x,
      pos_end_y: halfmove.to.y,
      promoted_to_piece_symbol_fen:
        promotedTo === null
          ? null
          : FENNotation.convertPieceIdToFEN(promotedTo.id),
    };
    const res = await fetch(`/api/online-game/${this.gameDisplayId}`, {
      method: "POST",
      body: JSON.stringify(GetDBHalfmove),
    });
    return res.ok;
  }

  public static async getResultName(
    resultId: string | number
  ): Promise<string | null> {
    const response: Response = await fetch(`/api/game-result/${resultId}`);
    if (response.status !== 200) {
      return null;
    }
    const resultNameObj: getResultNameProps = await response.json();
    return resultNameObj.resultName;
  }

  public static async getEndReasonName(
    resultId: string | number
  ): Promise<string | null> {
    const response: Response = await fetch(`/api/game-end-reason/${resultId}`);

    if (response.status !== 200) {
      return null;
    }
    const resultNameObj: getEndReasonNameProps = await response.json();
    return resultNameObj.endReason;
  }
}
