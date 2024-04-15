import { queryDB } from "../connect";
import type { EndInfo } from "../types";

export default async function updateGameResult(
  { end_reason_id, result_id }: EndInfo,
  displayId: string
) {
  await queryDB(
    `
    UPDATE game
    SET 
      is_finished = true,
      result_id = $1,
      end_reason_id = $2
    WHERE display_id = $3
    `,
    [result_id, end_reason_id, displayId]
  );
}
