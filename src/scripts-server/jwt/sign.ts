import jwt from "jsonwebtoken";
import type { APIGetAppUser } from "../../db/types";

export default function sign(user: APIGetAppUser) {
  const privKey = Buffer.from(import.meta.env.PRIVATE_KEY, "base64").toString(
    "utf8"
  );

  return jwt.sign(user, privKey, { algorithm: "RS256" });
}
