import { readFile } from "fs/promises";
import { join } from "path";

const privateKeyPath = join(process.cwd(), "/generate-keypair/id_rsa_priv.pem");
const publicKeyPath = join(process.cwd(), "/generate-keypair/id_rsa_pub.pem");

const privateKey = await readFile(privateKeyPath, "utf8");
const publicKey = await readFile(publicKeyPath, "utf8");

const encodedPrivateKey = Buffer.from(privateKey).toString("base64");
const encodedPublicKey = Buffer.from(publicKey).toString("base64");

console.log("PRIVATE_KEY=" + `"` + encodedPrivateKey + `"`);
console.log("PUBLIC_KEY=" + `"` + encodedPublicKey + `"`);
