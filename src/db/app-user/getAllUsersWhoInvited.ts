import type { QueryResult } from "pg";
import { queryDB } from "../connect";
import type { APIGetAppUser } from "../types";
import { getUserById } from "./getUser";

export default async function getAllUsersWhoInvited(
  idSelf: string
): Promise<APIGetAppUser[]> {
  const resUserTo: QueryResult<{ user_from_id: string }> = await queryDB(
    `SELECT user_from_id 
    FROM friend_invite 
    WHERE user_to_id = $1;
    `,
    [idSelf]
  );
  const users: APIGetAppUser[] = [];
  for (const { user_from_id } of resUserTo.rows) {
    const user = await getUserById(user_from_id);
    if (user !== null) {
      users.push(user);
    }
  }

  return users;
}
