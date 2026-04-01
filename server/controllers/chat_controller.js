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
    const { message } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;
    const userRole = req.user.role;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Mensagem inválida' });
    }

    db.run(
        `INSERT INTO team_chat (user_id, user_name, user_role, message) VALUES (?, ?, ?, ?)`,
        [userId, userName, userRole, message.trim()],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });

            const newMsg = {
                id: this.lastID,
                type: 'message',
                user_id: userId,
                user_name: userName,
                user_role: userRole,
                message: message.trim(),
                created_at: new Date().toISOString()
            };

            // Notifica todo mundo em tempo real (incluindo o próprio remetente para confirmar)
            broadcast(newMsg);
            
            res.json({ success: true });
        }
    );
};

exports.typing = (req, res) => {
    const { isTyping } = req.body;
    const userName = req.user.name;
    const userRole = req.user.role;
    const userId = req.user.id;

    broadcast({
        type: 'typing',
        user_id: userId,
        user_name: userName,
        user_role: userRole,
        isTyping
    });

    res.json({ success: true });
};
