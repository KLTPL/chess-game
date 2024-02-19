import { queryDB } from "../connect";

export default async function isFriend(
  idSelf: string,
  idOther: string
): Promise<boolean> {
  const resResultFriend = await queryDB(
    `
    (SELECT u1.* FROM 
    friend_connection f1
    INNER JOIN app_user u1
    ON (f1.user_1_id = $1 AND f1.user_2_id = $2 AND f1.user_2_id = u1.id)
    ) UNION ALL
    (SELECT u2.* FROM 
    friend_connection f2
    INNER JOIN app_user u2
    ON (f2.user_1_id = $2 AND f2.user_2_id = $1 AND f2.user_1_id = u2.id)
    );
  `,
    [idSelf, idOther]
  );
  return resResultFriend.rowCount !== 0;
}
