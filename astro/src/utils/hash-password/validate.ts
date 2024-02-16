import crypto from "crypto";

export default function (password: string, hash: string, salt: string) {
    const newHash = crypto.pbkdf2Sync(password, salt, 1000, 64, `sha512`).toString(`hex`);
    return newHash === hash;
}
