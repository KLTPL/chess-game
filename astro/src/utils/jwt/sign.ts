import fs from "fs";
import jwt from "jsonwebtoken";
import type { GetDBAppUser } from "../../db/types";

export default function sign(user: GetDBAppUser) {
  const privKey = fs.readFileSync(
    "./src/utils/generate-keypair/id_rsa_priv.pem",
    { encoding: "utf8", flag: "r" }
  );

  return jwt.sign(user, privKey, { algorithm: "RS256" });
}