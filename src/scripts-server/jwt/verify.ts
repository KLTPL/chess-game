import jwt from "jsonwebtoken";
import type { APIGetAppUser } from "../../db/types";

export default function verify(token: string): APIGetAppUser | false {
  try {
    const pubKey = Buffer.from(import.meta.env.PUBLIC_KEY, "base64").toString(
      "utf8"
    );

    return jwt.verify(token, pubKey, {
      algorithms: ["RS256"],
    }) as APIGetAppUser;
  } catch (err) {
    console.error(err);
    return false;
  }
}
