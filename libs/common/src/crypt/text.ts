import * as CryptoJS from 'crypto-js';

export function encryptText(text: string): string {
    return CryptoJS.AES.encrypt(text, process.env.CRYPT_SECRET_KEY).toString();
}

export function decryptText(cipherText: string): string {
    const bytes  = CryptoJS.AES.decrypt(cipherText, process.env.CRYPT_SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
}