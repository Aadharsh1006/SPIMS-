const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const secretKey = process.env.AES_SECRET_KEY || crypto.randomBytes(32).toString('hex'); // 32 bytes for AES-256
const ivLength = 16; // AES block size

const encrypt = (text) => {
    // If key provided in env is hex, parse it. Otherwise use as is (if 32 char string) or hash it.
    // Ideally user provides a 32-byte hex string in .env
    // For safety, let's hash whatever secret is provided to ensuring 32 bytes
    const key = crypto.createHash('sha256').update(String(process.env.AES_SECRET_KEY || 'default_secret')).digest();

    const iv = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    const key = crypto.createHash('sha256').update(String(process.env.AES_SECRET_KEY || 'default_secret')).digest();

    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

module.exports = { encrypt, decrypt };
