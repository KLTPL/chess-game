import fs from "fs";
import jwt from "jsonwebtoken";

export default function verify(token: string) {
  try {
    const pubKey = fs.readFileSync(
      "./src/utils/generate-keypair/id_rsa_pub.pem",
      { encoding: "utf8", flag: "r" }
    );

    return jwt.verify(token, pubKey, { algorithms: ["RS256"] });
  } catch (err) {
    console.error(err);
    return false;
  }
}
