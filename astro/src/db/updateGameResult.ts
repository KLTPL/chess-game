import { queryDB } from "./connect";

export type updateGameResultProps = {
  gameId: string;
  resultId: number;
  endReasonId: number;
};

export default async function updateGameResult({
  endReasonId,
  resultId,
  gameId,
}: updateGameResultProps) {
  await queryDB(
    `
    UPDATE game
    SET 
      is_finished = true,
      result_id = $1,
      end_reason_id = $2
    WHERE id = $3
    `,
    [resultId, endReasonId, gameId]
  );
}
