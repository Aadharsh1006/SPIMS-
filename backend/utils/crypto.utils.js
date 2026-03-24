// backend/utils/crypto.utils.js
const crypto = require('crypto');
const ALGO = 'aes-256-gcm';
const IV_LENGTH = 12;

const encryptMessage = (plaintext, key) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGO, key, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return {
        ciphertext: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64')
    };
};

const decryptMessage = (ciphertext, iv, authTag, key) => {
    const decipher = crypto.createDecipheriv(ALGO, key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(ciphertext, 'base64')),
        decipher.final()
    ]);
    return decrypted.toString('utf8');
};

module.exports = { encryptMessage, decryptMessage };
