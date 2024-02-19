import { queryDB } from "../connect";
import type { GetDBAppUser } from "../types";

export default async function getFriends(
  userId: string
): Promise<GetDBAppUser[]> {
  const response = await queryDB(
    `SELECT u.* FROM 
      ((SELECT user_2_id AS user_id FROM friend_connection WHERE user_1_id = $1)
      UNION ALL
      (SELECT user_1_id AS user_id FROM friend_connection WHERE user_2_id = $1)) f
      INNER JOIN app_user u
      ON f.user_id = u.id
      `,
    [userId]
  );
  return response.rows;
}
