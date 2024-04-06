import type { QueryResult } from "pg";
import { queryDB } from "../connect";
import type { GetDBAppUser } from "../types";
import { getUserById } from "./getUser";

export default async function getAllInvitedUsers(
  idSelf: string
): Promise<GetDBAppUser[]> {
  const resUserTo: QueryResult<{ user_to_id: string }> = await queryDB(
    `SELECT user_to_id 
    FROM friend_invite 
    WHERE user_from_id = $1;
    `,
    [idSelf]
  );
  const users: GetDBAppUser[] = [];
  for (const { user_to_id } of resUserTo.rows) {
    const user = await getUserById(user_to_id);
    if (user !== null) {
      users.push(user);
    }
  }

  return users;
}
