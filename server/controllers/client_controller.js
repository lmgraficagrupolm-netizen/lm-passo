const db = require('../database/db');
const bcrypt = require('bcryptjs');

// List helper to handle query results
const getAll = (sql, params, res) => {
    db.all(sql, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
};

exports.getAllClients = (req, res) => {
    const sql = `
        SELECT c.*, 
               u.id as access_user_id, 
               u.username as access_username
        FROM clients c
        LEFT JOIN users u ON u.client_id = c.id AND u.role = 'cliente'
        ORDER BY c.name ASC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const data = rows.map(r => ({
            ...r,
            has_access: r.access_user_id ? true : false
        }));
        res.json({ data });
    });
};

exports.createClient = (req, res) => {
    const { name, phone, origin, core_discount, cpf, address, city, state, zip_code } = req.body;
    const sql = "INSERT INTO clients (name, phone, origin, core_discount, cpf, address, city, state, zip_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const params = [name, phone, origin, core_discount ? 1 : 0, cpf || '', address || '', city || '', state || '', zip_code || ''];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cliente criado com sucesso', id: this.lastID });
    });
};

exports.updateClient = (req, res) => {
    const { name, phone, origin, core_discount, cpf, address, city, state, zip_code } = req.body;
    const sql = "UPDATE clients SET name = ?, phone = ?, origin = ?, core_discount = ?, cpf = ?, address = ?, city = ?, state = ?, zip_code = ? WHERE id = ?";
    const params = [name, phone, origin, core_discount ? 1 : 0, cpf || '', address || '', city || '', state || '', zip_code || '', req.params.id];

    db.run(sql, params, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cliente atualizado', changes: this.changes });
    });
};

exports.deleteClient = (req, res) => {
    db.run("DELETE FROM clients WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Cliente removido', changes: this.changes });
    });
};

// Toggle client financial access — create or remove user account
exports.toggleClientAccess = (req, res) => {
    const clientId = req.params.id;
    const { enable } = req.body;

    if (enable) {
        // Check if already has access
        db.get("SELECT id FROM users WHERE client_id = ? AND role = 'cliente'", [clientId], (err, existing) => {
            if (err) return res.status(500).json({ error: err.message });
            if (existing) return res.status(400).json({ error: 'Cliente já possui acesso ativo.' });

            // Get client info to generate username
            db.get("SELECT name, phone FROM clients WHERE id = ?", [clientId], (err, client) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!client) return res.status(404).json({ error: 'Cliente não encontrado.' });

                // Generate username from client name (lowercase, no spaces, no accents)
                const baseName = client.name
                    .toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-z0-9]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_|_$/g, '')
                    .substring(0, 20);
                const username = `cliente_${baseName}`;

                // Generate random 6-digit password
                const password = String(Math.floor(100000 + Math.random() * 900000));
                const hashedPassword = bcrypt.hashSync(password, 8);

                // Check if username exists, append number if needed
                db.get("SELECT id FROM users WHERE username = ?", [username], (err, existingUser) => {
                    const finalUsername = existingUser ? `${username}_${clientId}` : username;

                    db.run(
                        "INSERT INTO users (username, password, role, name, client_id) VALUES (?, ?, 'cliente', ?, ?)",
                        [finalUsername, hashedPassword, client.name, clientId],
                        function (err) {
                            if (err) return res.status(500).json({ error: err.message });

                            const link = `${req.protocol}://${req.get('host')}`;
                            res.json({
                                message: 'Acesso criado com sucesso',
                                username: finalUsername,
                                password: password,
                                link: link
                            });
                        }
                    );
                });
            });
        });
    } else {
        // Remove access — delete the user linked to this client
        db.run("DELETE FROM users WHERE client_id = ? AND role = 'cliente'", [clientId], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Acesso removido', removed: true });
        });
    }
};
