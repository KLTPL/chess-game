import { queryDB } from "../connect";
import type { APIGetAppUser, APIGetAppUserForLogin } from "../types";

async function getUsersGeneric(
  condition: string,
  conditionVals: (number | string)[]
): Promise<APIGetAppUser[]> {
  const resUser = await queryDB(
    `
    SELECT id, email, name, display_name, is_active, date_create, date_last_login 
    FROM app_user 
    WHERE ${condition} 
    ORDER BY name ASC, display_name ASC;`,
    conditionVals
  );

  return resUser.rows as APIGetAppUser[];
}

export async function getUserById(
  id: string | number
): Promise<APIGetAppUser | null> {
  const users = await getUsersGeneric("id = $1", [id]);
  if (users.length === 0) {
    return null;
  }
  return users[0];
}

export async function getUserByEmail(
  email: string
): Promise<APIGetAppUser | null> {
  const users = await getUsersGeneric("email = $1", [email]);
  if (users.length === 0) {
    return null;
  }
  return users[0];
}

export async function getUserByName(
  name: string
): Promise<APIGetAppUser | null> {
  const users = await getUsersGeneric("name = $1", [name]);
  if (users.length === 0) {
    return null;
  }
  return users[0];
}

export async function getUserByNameOrEmailForLogin(
  nameOrEmail: string
): Promise<APIGetAppUserForLogin | null> {
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

export async function getUsersByAlias(
  nameOrDisplayOrEmail: string
): Promise<APIGetAppUser[]> {
  const resUsers = await getUsersGeneric(`(name = $1 OR display_name = $1)`, [
    nameOrDisplayOrEmail,
  ]);
  return resUsers;
}
