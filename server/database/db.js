/**
 * db.js — Ponto de entrada do banco de dados
 *
 * LOCAL  (USE_SQLITE=true no .env): usa SQLite — funciona sem internet e sem cota
 * RENDER (FIREBASE_CREDENTIALS set): usa Firestore — modo 24h online
 *
 * Se sqlite3 não estiver instalado, usa Firestore automaticamente.
 */

const useLocal = process.env.USE_SQLITE === 'true';

if (useLocal) {
    try {
        const sqlite3 = require('sqlite3').verbose();
        const path = require('path');
        const dbPath = path.resolve(process.cwd(), 'database.sqlite');
        const db = new sqlite3.Database(dbPath);
        console.log('🗄️  Modo LOCAL: usando SQLite (database.sqlite)');
        module.exports = db;
    } catch (e) {
        console.log('⚠️  SQLite indisponível, usando Firebase...');
        module.exports = require('./firestore');
    }
} else {
    module.exports = require('./firestore');
}
