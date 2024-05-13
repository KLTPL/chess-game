import fs from "fs";
import jwt from "jsonwebtoken";
import type { APIGetAppUser } from "../../db/types";

export default function sign(user: APIGetAppUser) {
  const privKey = fs.readFileSync(
    "./src/scripts-server/jwt/generate-keypair/id_rsa_priv.pem",
    { encoding: "utf8", flag: "r" }
  );

  return jwt.sign(user, privKey, { algorithm: "RS256" });
}
