const db = require('../database/db');
const fs = require('fs');
const path = require('path');

exports.getAllItems = (req, res) => {
    db.all(`SELECT * FROM catalogue_items ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ data: rows });
    });
};

exports.createItem = (req, res) => {
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'A imagem é obrigatória.' });
    }

    const image_url = `/uploads/${file.filename}`;

    db.run(`INSERT INTO catalogue_items (title, description, image_url) VALUES (?, ?, ?)`, 
    [title || '', description || '', image_url], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID, title, description, image_url });
    });
};

exports.updateItem = (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    
    // update only texts
    db.run(`UPDATE catalogue_items SET title = ?, description = ? WHERE id = ?`,
        [title, description, id],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: 'Item não encontrado.' });
            res.json({ success: true });
        }
    );
};

exports.deleteItem = (req, res) => {
    const { id } = req.params;
    
    // First, fetch the item to find the image URL
    db.get(`SELECT image_url FROM catalogue_items WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Item não encontrado.' });

        const image_url = row.image_url;

        db.run(`DELETE FROM catalogue_items WHERE id = ?`, [id], function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // delete the physical file securely
            if (image_url) {
                const filename = path.basename(image_url);
                const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                fs.unlink(filePath, (unlinkErr) => {
                    if (unlinkErr) console.error('Erro ao excluir imagem física do catálogo', unlinkErr);
                });
            }

            res.json({ success: true });
        });
    });
};
