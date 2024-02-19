import { queryDB } from "./connect";
import type { GetDBAppUser } from "./types";

async function getUserGeneric(
  query: string,
  conditionVals: (number | string)[]
): Promise<GetDBAppUser | null> {
  const resUser = await queryDB(query, conditionVals);
  if (resUser.rowCount === 0) {
    return null;
  }

  return resUser.rows[0] as GetDBAppUser;
}

export async function getUserById(
  id: string | number
): Promise<GetDBAppUser | null> {
  return getUserGeneric("SELECT * FROM app_user WHERE id = $1;", [id]);
}

export async function getUserByEmail(
  email: string
): Promise<GetDBAppUser | null> {
  return getUserGeneric("SELECT * FROM app_user WHERE email = $1;", [email]);
}

export async function getUserByName(
  name: string
): Promise<GetDBAppUser | null> {
  return getUserGeneric("SELECT * FROM app_user WHERE name = $1;", [name]);
}

export async function getUserByNameOrEmail(
  nameOrEmail: string
): Promise<GetDBAppUser | null> {
  return getUserGeneric(
    `SELECT * FROM app_user 
    WHERE (name = $1 OR email = $2);`,
    [nameOrEmail, nameOrEmail]
  );
}

export async function getUsersByNameOrDisplayNameOrEmail(
  nameOrDisplayOrEmail: string
): Promise<GetDBAppUser[]> {
  const resUser = await queryDB(
    `SELECT * FROM app_user 
    WHERE (name = $1 OR display_name = $2 OR email = $3)
    ORDER BY name ASC, display_name ASC;`,
    [nameOrDisplayOrEmail, nameOrDisplayOrEmail, nameOrDisplayOrEmail]
  );
  return resUser.rows as GetDBAppUser[];
}
