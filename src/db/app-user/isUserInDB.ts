import { getUserById } from "./getUser";

export default async function isUserInDB(id: string) {
  const user = await getUserById(id);
  return user !== null;
}
