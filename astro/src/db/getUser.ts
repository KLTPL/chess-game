import { queryDB } from "./connect";
import type { GetDBAppUser } from "./types";

async function getUserGeneric(
  query: string,
  conditionVal: number | string
): Promise<GetDBAppUser | null> {
  const resUser = await queryDB(query, [conditionVal]);
  if (resUser.rowCount === 0) {
    return null;
  }

  return {
    ...(resUser.rows[0] as GetDBAppUser),
  };
}

export async function getUserById(
  id: string | number
): Promise<GetDBAppUser | null> {
  return getUserGeneric("SELECT * FROM app_user WHERE id = $1;", id);
}

export async function getUserByEmail(email: string): Promise<GetDBAppUser | null> {
  return getUserGeneric("SELECT * FROM app_user WHERE email = $1;", email);
}

export async function getUserByName(name: string): Promise<GetDBAppUser | null> {
  return getUserGeneric("SELECT * FROM app_user WHERE name = $1;", name);
}

export async function getUserByNameOrEmail(
  nameOrEmail: string
): Promise<GetDBAppUser | null> {
  const byEmail = await getUserByEmail(nameOrEmail);
  if (byEmail !== null) {
    return byEmail;
  }
  const byName = await getUserByName(nameOrEmail);
  if (byName !== null) {
    return byName;
  }
  return null;
}
