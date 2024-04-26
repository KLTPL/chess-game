import type { RegisterBody } from "../../components/sign-up/Form";
import encrpt from "../../utils/hash-password/encrypt";
import { queryDB } from "../connect";

export default async function addNewUser({
  email,
  username,
  displayName,
  password,
}: RegisterBody): Promise<void> {
  const { hash, salt } = encrpt(password);
  if (displayName.length === 0) {
    displayName = username;
  }
  await queryDB(
    `
    INSERT INTO app_user
    (email, name, display_name, password, password_salt)
    VALUES ($1, $2, $3, $4, $5);`,
    [email, username, displayName, hash, salt]
  );
}
