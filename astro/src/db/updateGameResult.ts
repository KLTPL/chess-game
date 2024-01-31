import { queryDB } from "./connect";
import type { PutDBGame } from "./types";

export default async function updateGameResult({
  end_reason_id,
  id,
  result_id,
}: PutDBGame) {
  await queryDB(
    `
    UPDATE game
    SET 
      is_finished = true,
      result_id = $1,
      end_reason_id = $2
    WHERE id = $3
    `,
    [result_id, end_reason_id, id]
  );
}
