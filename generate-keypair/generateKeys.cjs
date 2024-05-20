import { generateKeyPairSync } from 'crypto';
import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function genKeyPair() {
    // Generates an object where the keys are stored in properties `privateKey` and `publicKey`
    const keyPair = generateKeyPairSync('rsa', {
        modulusLength: 4096, // bits - standard for RSA keys
        publicKeyEncoding: {
            type: 'pkcs1', // "Public Key Cryptography Standards 1"
            format: 'pem' // Most common formatting choice
        },
        privateKeyEncoding: {
            type: 'pkcs1', // "Public Key Cryptography Standards 1"
            format: 'pem' // Most common formatting choice
        }
    });

    // Paths to save the keys
    const publicKeyPath = join(__dirname, 'id_rsa_pub.pem');
    const privateKeyPath = join(__dirname, 'id_rsa_priv.pem');

    // Write the public key to a file
    await writeFile(publicKeyPath, keyPair.publicKey);

    // Write the private key to a file
    await writeFile(privateKeyPath, keyPair.privateKey);
}

// Generate the keypair
genKeyPair().catch(error => {
    console.error('Error generating key pair:', error);
});