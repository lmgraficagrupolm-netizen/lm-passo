const db = require('../database/db');

// Lista global de conexões ativas para Server-Sent Events
let clients = [];

// Função auxiliar para enviar evento para todos os clientes ativos
const broadcast = (data) => {
    clients.forEach(c => {
        try {
            c.res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch(err) {
            console.error('Error broadcasting to client', c.id, err);
        }
    });
};

exports.stream = (req, res) => {
    // Configura os headers para manter a conexão aberta
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now() + Math.random().toString();
    const newClient = { id: clientId, res };
    clients.push(newClient);

    // Enviar mensagem inicial para confirmar a conexão
    res.write(`data: ${JSON.stringify({ type: 'connected', msg: 'SSE ativo' })}\n\n`);

    req.on('close', () => {
        clients = clients.filter(c => c.id !== clientId);
    });
};

exports.getHistory = (req, res) => {
    db.all(`SELECT * FROM team_chat ORDER BY created_at ASC LIMIT 100`, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ messages: rows || [] });
    });
};

exports.sendMessage = (req, res) => {
    const { message, user_id, user_name, user_role } = req.body;

    if (!message || !message.trim() || !user_id) {
        return res.status(400).json({ error: 'Mensagem inválida' });
    }

    db.run(
        `INSERT INTO team_chat (user_id, user_name, user_role, message) VALUES (?, ?, ?, ?)`,
        [user_id, user_name, user_role, message.trim()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            const newMsg = {
                id: this.lastID,
                type: 'message',
                user_id: user_id,
                user_name: user_name,
                user_role: user_role,
                message: message.trim(),
                created_at: new Date().toISOString()
            };

            broadcast(newMsg);
            
            res.json({ success: true });
        }
    );
};

exports.typing = (req, res) => {
    const { isTyping, user_id, user_name, user_role } = req.body;

    broadcast({
        type: 'typing',
        user_id,
        user_name,
        user_role,
        isTyping
    });

    res.json({ success: true });
};
