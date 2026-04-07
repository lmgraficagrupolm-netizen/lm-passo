/**
 * keepalive.js — Mantém o servidor Railway sempre acordado
 * Faz ping no /api/health a cada 4 minutos para evitar o sleep do plano gratuito
 * 
 * Rodando localmente: node scripts/keepalive.js
 * No Railway: é chamado automaticamente pelo server.js
 */

const https = require('https');

const RAILWAY_URL = 'https://lm-passo-production.up.railway.app';
const PING_INTERVAL_MS = 4 * 60 * 1000; // 4 minutos

function ping() {
    const url = new URL('/api/health', RAILWAY_URL);
    const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: 'GET',
        headers: { 'User-Agent': 'LM-Passo-Keepalive/1.0' },
        timeout: 15000,
    };

    const req = https.request(options, (res) => {
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        if (res.statusCode === 200) {
            console.log(`[${timestamp}] ✅ Railway online (${res.statusCode})`);
        } else if (res.statusCode === 502 || res.statusCode === 503) {
            console.log(`[${timestamp}] ⚠️  Railway acordando... (${res.statusCode}) - próximo ping em 4min`);
        } else {
            console.log(`[${timestamp}] ℹ️  Railway respondeu: ${res.statusCode}`);
        }
        // Drena a resposta
        res.resume();
    });

    req.on('error', (e) => {
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        console.log(`[${timestamp}] ❌ Erro ao contatar Railway: ${e.message}`);
    });

    req.on('timeout', () => {
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        console.log(`[${timestamp}] ⏱️  Timeout - Railway pode estar acordando`);
        req.destroy();
    });

    req.end();
}

// Ping imediato ao iniciar
console.log(`\n🚀 Keep-alive iniciado para: ${RAILWAY_URL}`);
console.log(`   Ping a cada 4 minutos para manter o Railway acordado\n`);
ping();

// Ping a cada 4 minutos
setInterval(ping, PING_INTERVAL_MS);
