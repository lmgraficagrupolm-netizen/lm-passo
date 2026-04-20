const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getServiceAccount() {
    // 1. Prioridade para a Variável de Ambiente em texto puro (se o usuário preencher lá)
    if (process.env.FIREBASE_CREDENTIALS) {
        try {
            return JSON.parse(process.env.FIREBASE_CREDENTIALS);
        } catch (e) {
            console.error('❌ Erro: FIREBASE_CREDENTIALS em texto é inválido.');
        }
    }

    // 2. Se não tem a variável, tenta ler o arquivo criptografado (Render Environment)
    const encPath = path.resolve(process.cwd(), 'firebase-credentials.enc');
    if (fs.existsSync(encPath) && process.env.GEMINI_API_KEY) {
        try {
            const secretKey = process.env.GEMINI_API_KEY;
            const content = fs.readFileSync(encPath, 'utf8');
            const parts = content.split(':');
            const iv = Buffer.from(parts.shift(), 'hex');
            const encryptedText = Buffer.from(parts.join(':'), 'hex');
            
            const key = crypto.createHash('sha256').update(String(secretKey)).digest('base64').substr(0, 32);
            const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
            
            const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
            return JSON.parse(decrypted.toString());
        } catch (e) {
            console.error('❌ Erro ao decriptar firebase-credentials.enc:', e.message);
        }
    }

    // 3. Fallback: ler do arquivo .json local (Ambiente de Desenvolvimento)
    const credPath = path.resolve(process.cwd(), 'firebase-credentials.json');
    if (fs.existsSync(credPath)) {
        return require(credPath);
    }

    return null;
}

module.exports = { getServiceAccount };
