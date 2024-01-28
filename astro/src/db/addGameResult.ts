import { queryDB } from "./connect";

export type EndGameData = {
  resultId: number;
  endReasonId: number;
};

export default async function addGameResult(endGameData: EndGameData, gameId: string) {
  await queryDB(
    `
    UPDATE game
    SET 
      is_finished = true,
      result_id = $1,
      end_reason_id = $2
    WHERE id = $3
    `,
    [endGameData.resultId, endGameData.endReasonId, gameId]
  )
}