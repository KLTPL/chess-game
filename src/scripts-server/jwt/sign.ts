import jwt from "jsonwebtoken";
import { getSecret } from "astro:env/server";
import type { APIGetAppUser } from "../../db/types";

export default function sign(user: APIGetAppUser) {
  const privKey = Buffer.from(
    getSecret("PRIVATE_KEY") as string,
    "base64"
  ).toString("utf8");

  return jwt.sign(user, privKey, { algorithm: "RS256" });
}
