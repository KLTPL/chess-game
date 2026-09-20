import jwt from "jsonwebtoken";
import { getSecret } from "astro:env/server";
import type { APIGetAppUser } from "../../db/types";

export default function verify(token: string): APIGetAppUser | false {
  try {
    const pubKey = Buffer.from(
      getSecret("PUBLIC_KEY") as string,
      "base64"
    ).toString("utf8");

    return jwt.verify(token, pubKey, {
      algorithms: ["RS256"],
    }) as APIGetAppUser;
  } catch (err) {
    console.error(err);
    return false;
  }
}
