import { queryDB } from "../connect";
import type { GetDBAppUser, GetDBAppUserForLogin } from "../types";

async function getUsersGeneric(
  condition: string,
  conditionVals: (number | string)[]
): Promise<GetDBAppUser[]> {
  const resUser = await queryDB(
    `
    SELECT id, email, name, display_name, is_active, date_create, date_last_login 
    FROM app_user 
    WHERE ${condition} 
    ORDER BY name ASC, display_name ASC;`,
    conditionVals
  );

  return resUser.rows as GetDBAppUser[];
}

export async function getUserById(
  id: string | number
): Promise<GetDBAppUser | null> {
  const users = await getUsersGeneric("id = $1", [id]);
  if (users.length === 0) {
    return null;
  }
  return users[0];
}

export async function getUserByEmail(
  email: string
): Promise<GetDBAppUser | null> {
  const users = await getUsersGeneric("email = $1", [email]);
  if (users.length === 0) {
    return null;
  }
  return users[0];
}

export async function getUserByName(
  name: string
): Promise<GetDBAppUser | null> {
  const users = await getUsersGeneric("name = $1", [name]);
  if (users.length === 0) {
    return null;
  }
  return users[0];
}

export async function getUserByNameOrEmailForLogin(
  nameOrEmail: string
): Promise<GetDBAppUserForLogin | null> {
  const resUsers = await queryDB(
    `
    SELECT id, email, name, display_name, is_active, date_create, date_last_login, password, password_salt
    FROM app_user 
    WHERE (name = $1 OR email = $2)
    ORDER BY name ASC, display_name ASC;`,
    [nameOrEmail, nameOrEmail]
  );
  if (resUsers.rowCount === 0) {
    return null;
  }
  return resUsers.rows[0];
}

export async function getUsersByNameOrDisplayNameOrEmail(
  nameOrDisplayOrEmail: string
): Promise<GetDBAppUser[]> {
  const resUsers = await getUsersGeneric(
    `(name = $1 OR display_name = $1 OR email = $1)`,
    [nameOrDisplayOrEmail]
  );
  return resUsers;
}
