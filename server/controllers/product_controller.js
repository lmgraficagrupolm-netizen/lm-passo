const db = require('../database/db');

exports.getAllProducts = (req, res) => {
    const sql = `
        SELECT p.*,
            (SELECT group_concat(cv.id || ':' || cv.color || ':' || cv.quantity, '|||')
             FROM product_color_variants cv WHERE cv.product_id = p.id) as color_variants_raw
        FROM products p ORDER BY p.name ASC`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        const data = rows.map(r => ({
            ...r,
            color_variants: r.color_variants_raw
                ? r.color_variants_raw.split('|||').map(v => {
                    const [id, color, quantity] = v.split(':');
                    return { id: parseInt(id), color, quantity: parseInt(quantity) };
                })
                : []
        }));
        res.json({ data });
    });
};

exports.createProduct = (req, res) => {
    const { name, type, production_time, price, stock, price_1_day, price_3_days, terceirizado, unit_cost } = req.body;

    // Check if type exists to inherit stock
    const getStockSql = "SELECT stock FROM products WHERE type = ? AND type != '' LIMIT 1";
    db.get(getStockSql, [type], (err, row) => {
        const finalStock = (row && row.stock !== undefined) ? row.stock : (stock || 0);

        const sql = "INSERT INTO products (name, type, production_time, price, stock, price_1_day, price_3_days, terceirizado, unit_cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [name, type, production_time, price, finalStock, price_1_day, price_3_days, terceirizado ? 1 : 0, unit_cost || 0];

        db.run(sql, params, function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Produto criado com sucesso', id: this.lastID });
        });
    });
};

exports.updateProduct = (req, res) => {
    let { name, type, production_time, price, stock, price_1_day, price_3_days, terceirizado, unit_cost } = req.body;
    const productId = req.params.id;

    // Normalize type
    const normalizedType = type ? type.trim() : '';

    db.serialize(() => {
        // First, get the current product to see if type is changing
        db.get("SELECT type, stock FROM products WHERE id = ?", [productId], (err, currentProduct) => {
            if (err) return res.status(500).json({ error: err.message });

            const currentNormalizedType = currentProduct && currentProduct.type ? currentProduct.type.trim() : '';
            const typeChanged = currentNormalizedType.toUpperCase() !== normalizedType.toUpperCase();

            console.log(`[Sync] Updating Prod ${productId}. Type: '${currentNormalizedType}' -> '${normalizedType}'. Stock Input: ${stock}`);

            if (normalizedType !== '') {
                // Find stock of existing products of the NEW type if type was changed
                db.get("SELECT stock FROM products WHERE UPPER(TRIM(type)) = UPPER(?) AND id != ? LIMIT 1", [normalizedType, productId], (err, row) => {
                    let syncedStock = stock;
                    if (typeChanged && row && row.stock !== undefined) {
                        syncedStock = row.stock;
                        console.log(`[Sync] Type changed to existing type. Adopting stock: ${syncedStock}`);
                    }

                    // Update target product
                    const sql = "UPDATE products SET name = ?, type = ?, production_time = ?, price = ?, stock = ?, price_1_day = ?, price_3_days = ?, terceirizado = ?, unit_cost = ? WHERE id = ?";
                    const params = [name, normalizedType, production_time, price, syncedStock, price_1_day, price_3_days, terceirizado ? 1 : 0, unit_cost || 0, productId];

                    db.run(sql, params, function (err) {
                        if (err) return res.status(500).json({ error: err.message });

                        // Skip stock sync for pulseira types — stock is managed by color variants
                        const isPulseira = normalizedType.toLowerCase().includes('pulseira');
                        if (!isPulseira) {
                            const syncSql = "UPDATE products SET stock = ? WHERE UPPER(TRIM(type)) = UPPER(?) AND type != ''";
                            db.run(syncSql, [syncedStock, normalizedType], function (err) {
                                if (err) return res.status(500).json({ error: err.message });
                                console.log(`[Sync] Synchronized ${this.changes} products of type '${normalizedType}' to stock ${syncedStock}`);
                                res.json({ message: 'Produto atualizado e estoque sincronizado', changes: this.changes });
                            });
                        } else {
                            console.log(`[Pulseira] Skipping stock sync for '${normalizedType}' — managed by color variants`);
                            res.json({ message: 'Produto atualizado', changes: this.changes });
                        }
                    });
                });
            } else {
                // No type or empty type - update individual product only
                const sql = "UPDATE products SET name = ?, type = ?, production_time = ?, price = ?, stock = ?, price_1_day = ?, price_3_days = ?, terceirizado = ?, unit_cost = ? WHERE id = ?";
                const params = [name, normalizedType, production_time, price, stock, price_1_day, price_3_days, terceirizado ? 1 : 0, unit_cost || 0, productId];
                db.run(sql, params, function (err) {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: 'Produto atualizado', changes: this.changes });
                });
            }
        });
    });
};

exports.deleteProduct = (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM product_color_variants WHERE product_id = ?", [id]);
    db.run("DELETE FROM products WHERE id = ?", id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Produto removido', changes: this.changes });
    });
};

// ── Color Variants ─────────────────────────────────────────────────────────
exports.getColorVariants = (req, res) => {
    db.all("SELECT * FROM product_color_variants WHERE product_id = ? ORDER BY color ASC",
        [req.params.id], (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ data: rows });
        });
};

// Replace all color variants for a product (send full array)
exports.saveColorVariants = (req, res) => {
    const productId = req.params.id;
    const { variants } = req.body; // [{ color, quantity }]
    if (!Array.isArray(variants)) return res.status(400).json({ error: 'variants must be an array' });

    db.serialize(() => {
        db.run("DELETE FROM product_color_variants WHERE product_id = ?", [productId], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            if (variants.length === 0) return res.json({ message: 'Cores salvas', data: [] });

            const stmt = db.prepare("INSERT INTO product_color_variants (product_id, color, quantity) VALUES (?, ?, ?)");
            let done = 0;
            variants.forEach(v => {
                stmt.run([productId, v.color || '', parseInt(v.quantity) || 0], () => {
                    done++;
                    if (done === variants.length) {
                        stmt.finalize();
                        // Update product stock = sum of all color quantities
                        const totalQty = variants.reduce((acc, v) => acc + (parseInt(v.quantity) || 0), 0);
                        db.run("UPDATE products SET stock = ? WHERE id = ?", [totalQty, productId], () => {
                            res.json({ message: 'Cores salvas', count: done, total_stock: totalQty });
                        });
                    }
                });
            });
        });
    });
};

// Debit usage from a specific color variant
exports.debitColorVariant = (req, res) => {
    const variantId = req.params.id;
    const used = parseInt(req.body.used) || 0;
    if (used <= 0) return res.status(400).json({ error: 'Quantidade deve ser > 0' });

    db.get("SELECT * FROM product_color_variants WHERE id = ?", [variantId], (err, variant) => {
        if (err || !variant) return res.status(404).json({ error: 'Variante não encontrada' });

        const newQty = Math.max(0, (variant.quantity || 0) - used);
        db.run("UPDATE product_color_variants SET quantity = ? WHERE id = ?", [newQty, variantId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Recalculate product stock = sum of all color quantities
            db.get(
                "SELECT SUM(quantity) as total FROM product_color_variants WHERE product_id = ?",
                [variant.product_id],
                (err, row) => {
                    const total = (row && row.total) || 0;
                    db.run("UPDATE products SET stock = ? WHERE id = ?", [total, variant.product_id], () => {
                        res.json({ message: 'Debitado', new_quantity: newQty, total_stock: total });
                    });
                }
            );
        });
    });
};

// ── Cost History ────────────────────────────────────────────────────────────
exports.getCostHistory = (req, res) => {
    const productId = req.params.id;
    db.all(
        `SELECT mc.*, p.name as product_name
         FROM material_cost_movements mc
         JOIN products p ON mc.product_id = p.id
         WHERE mc.product_id = ?
         ORDER BY mc.created_at DESC`,
        [productId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            // Also get the accumulated cost_value
            db.get("SELECT cost_value FROM products WHERE id = ?", [productId], (err2, prod) => {
                res.json({
                    data: rows,
                    total_cost: (prod && prod.cost_value) || 0
                });
            });
        }
    );
};
