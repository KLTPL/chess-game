import fs from "fs";
import jwt from "jsonwebtoken";
import type { GetDBAppUser } from "../../db/types";

export default function verify(token: string): GetDBAppUser | false {
  try {
    const pubKey = fs.readFileSync(
      "./src/utils/generate-keypair/id_rsa_pub.pem",
      { encoding: "utf8", flag: "r" }
    );

    return jwt.verify(token, pubKey, { algorithms: ["RS256"] }) as GetDBAppUser;
  } catch (err) {
    console.error(err);
    return false;
  }
}
