import { queryDB } from "../connect";
import createTimestampNow from "../createTimestamp";

export async function setUserLastLogin(id: number | string): Promise<void> {
  await queryDB(
    `UPDATE app_user
      SET date_last_login = $1
      WHERE id = $2`,
    [createTimestampNow(), id]
  );
}
