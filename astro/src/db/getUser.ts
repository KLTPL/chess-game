import { queryDB } from "./connect";
import type { GetDBAppUser } from "./types";

export default async function getUser(
  id: string | number
): Promise<GetDBAppUser | null> {
  const resUser = await queryDB(
    `
    SELECT * FROM app_user WHERE id = $1;
  `,
    [id]
  );

  if (resUser.rowCount === 0) {
    return null;
  }

  return {
    ...(resUser.rows[0] as GetDBAppUser),
  };
}
