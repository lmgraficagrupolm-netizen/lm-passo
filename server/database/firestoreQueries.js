/**
 * QUERIES AVANÇADAS DO FIRESTORE
 * Traduz os SELECTs complexos dos controllers para chamadas Firestore.
 */

async function handleGet(sql, params, db) {
    const s = sql.trim();
    const up = s.toUpperCase();

    // COUNT
    if (up.includes('COUNT(*)')) {
        const table = extractFrom(s);
        let q = db.collection(table);
        if (up.includes('WHERE')) q = applySimpleWhere(q, s, params);
        const snap = await q.get();
        return { count: snap.size };
    }

    // SELECT com WHERE id = ?
    if (/WHERE\s+\w+\.?id\s*=\s*\?/i.test(s) || /WHERE\s+id\s*=\s*\?/i.test(s)) {
        const id = params[0];
        const table = extractFrom(s);
        const doc = await db.collection(table).doc(String(id)).get();
        if (!doc.exists) return null;
        const row = { id: parseInt(doc.id), ...doc.data() };
        return await enrichRow(row, s, db);
    }

    // SELECT com WHERE campo = ? (sem JOIN)
    if (/WHERE\s+\w+\s*=\s*\?/i.test(s) && !up.includes('JOIN')) {
        const table = extractFrom(s);
        const field = extractSimpleWhereField(s);
        const snap = await db.collection(table).where(field, '==', params[0]).limit(1).get();
        if (snap.empty) return null;
        return { id: parseInt(snap.docs[0].id), ...snap.docs[0].data() };
    }

    // SELECT com múltiplos WHERE e possível JOIN (fallback: busca tudo em memória)
    const rows = await handleAll(sql, params, db);
    return rows.length > 0 ? rows[0] : null;
}

async function handleAll(sql, params, db) {
    const s = sql.trim();
    const up = s.toUpperCase();
    const table = extractFrom(s);

    let snap;
    if (up.includes('WHERE') && !up.includes('JOIN')) {
        // Query simples com WHERE
        let q = db.collection(table);
        q = applySimpleWhere(q, s, params);
        snap = await q.get();
    } else {
        snap = await db.collection(table).get();
    }

    let rows = snap.docs.map(d => ({ id: parseInt(d.id), ...d.data() }));

    // Aplicar JOINs em memória
    if (up.includes('LEFT JOIN') || up.includes('JOIN')) {
        rows = await applyJoins(rows, s, db);
    }

    // Filtro WHERE em memória (para queries com JOIN)
    if (up.includes('WHERE') && (up.includes('JOIN') || params.length > 1)) {
        rows = applyWhereInMemory(rows, s, params);
    }

    // ORDER BY em memória
    rows = applyOrderBy(rows, s);

    // LIMIT
    const limitMatch = s.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) rows = rows.slice(0, parseInt(limitMatch[1]));

    // Agregar campos calculados (GROUP BY / SUM / COALESCE)
    rows = applyAggregations(rows, s);

    return rows;
}

// ── JOINs em memória ───────────────────────────────────────────────────────

async function applyJoins(rows, sql, db) {
    const joins = [];
    const joinRegex = /(?:LEFT\s+)?JOIN\s+(\w+)\s+(\w+)\s+ON\s+([\w.]+)\s*=\s*([\w.]+)/gi;
    let m;
    while ((m = joinRegex.exec(sql)) !== null) {
        joins.push({ table: m[1], alias: m[2], on: [m[3], m[4]] });
    }

    for (const join of joins) {
        const snap = await db.collection(join.table).get();
        const lookupMap = {};
        snap.docs.forEach(d => {
            const data = { id: parseInt(d.id), ...d.data() };
            lookupMap[d.id] = data;
        });

        rows = rows.map(row => {
            // Determinar qual campo do row fazer o join
            const leftField = join.on.find(f => f.includes('.') ? f.split('.')[0] !== join.alias : false) || join.on[0];
            const rightField = join.on.find(f => f.includes('.') ? f.split('.')[0] === join.alias : false) || join.on[1];

            const leftKey = leftField.includes('.') ? leftField.split('.')[1] : leftField;
            const rightKey = rightField.includes('.') ? rightField.split('.')[1] : rightField;

            const foreignId = row[rightKey] || row[leftKey];
            const joined = lookupMap[String(foreignId)];

            if (joined) {
                // Prefixar campos do join com alias para evitar conflito
                const prefixed = {};
                Object.keys(joined).forEach(k => {
                    if (k !== 'id') prefixed[`${join.alias}_${k}`] = joined[k];
                });
                return { ...row, ...prefixed, [`${join.alias}_id`]: joined.id };
            }
            return row;
        });
    }

    return rows;
}

// ── WHERE em memória ───────────────────────────────────────────────────────

function applyWhereInMemory(rows, sql, params) {
    const whereMatch = sql.match(/WHERE\s+(.*?)(?:ORDER|GROUP|LIMIT|$)/is);
    if (!whereMatch) return rows;
    
    const clause = whereMatch[1].trim();
    let pi = 0;

    // Condições simples separadas por AND/OR
    const parts = clause.split(/\s+AND\s+/i);
    
    return rows.filter(row => {
        return parts.every(part => {
            const p = part.trim();
            
            // campo = ?
            const eq = p.match(/^[\w.]+\s*=\s*\?$/);
            if (eq && pi < params.length) {
                const field = p.split(/\s*=\s*/)[0].trim().replace(/\w+\./, '');
                return String(row[field]) === String(params[pi++]);
            }

            // campo != ?
            const neq = p.match(/^[\w.]+\s*!=\s*\?$/);
            if (neq && pi < params.length) {
                const field = p.split(/\s*!=\s*/)[0].trim().replace(/\w+\./, '');
                return String(row[field]) !== String(params[pi++]);
            }

            // campo IN (...)
            const inMatch = p.match(/^[\w.]+\s+IN\s*\(([^)]+)\)/i);
            if (inMatch) {
                const field = p.split(/\s+IN\s+/i)[0].trim().replace(/\w+\./, '');
                const values = inMatch[1].split(',').map(v => v.trim().replace(/['"]/g, ''));
                return values.includes(String(row[field]));
            }

            // campo NOT IN (...)
            const notInMatch = p.match(/^[\w.]+\s+NOT\s+IN\s*\(([^)]+)\)/i);
            if (notInMatch) {
                const field = p.split(/\s+NOT\s+IN\s+/i)[0].trim().replace(/\w+\./, '');
                const values = notInMatch[1].split(',').map(v => v.trim().replace(/['"]/g, ''));
                return !values.includes(String(row[field]));
            }

            return true;
        });
    });
}

// ── ORDER BY em memória ────────────────────────────────────────────────────

function applyOrderBy(rows, sql) {
    const orderMatch = sql.match(/ORDER\s+BY\s+(.*?)(?:LIMIT|$)/is);
    if (!orderMatch) return rows;

    const clauses = orderMatch[1].split(',').map(c => {
        const parts = c.trim().split(/\s+/);
        return { field: parts[0].replace(/\w+\./, ''), dir: (parts[1] || 'ASC').toUpperCase() };
    });

    return rows.sort((a, b) => {
        for (const cl of clauses) {
            const av = a[cl.field], bv = b[cl.field];
            if (av == null && bv != null) return cl.dir === 'ASC' ? -1 : 1;
            if (av != null && bv == null) return cl.dir === 'ASC' ? 1 : -1;
            if (av < bv) return cl.dir === 'ASC' ? -1 : 1;
            if (av > bv) return cl.dir === 'ASC' ? 1 : -1;
        }
        return 0;
    });
}

// ── Agregações simples ─────────────────────────────────────────────────────

function applyAggregations(rows, sql) {
    const up = sql.toUpperCase();
    if (!up.includes('SUM(') && !up.includes('COUNT(') && !up.includes('MAX(')) return rows;

    const sumMatch = sql.match(/SUM\((\w+)\)\s+as\s+(\w+)/gi);
    const maxMatch = sql.match(/MAX\((\w+)\)\s+as\s+(\w+)/gi);

    rows = rows.map(row => {
        const r = { ...row };
        if (sumMatch) {
            sumMatch.forEach(expr => {
                const [, field, alias] = expr.match(/SUM\((\w+)\)\s+as\s+(\w+)/i);
                r[alias] = parseFloat(row[field]) || 0;
            });
        }
        if (maxMatch) {
            maxMatch.forEach(expr => {
                const [, field, alias] = expr.match(/MAX\((\w+)\)\s+as\s+(\w+)/i);
                r[alias] = row[field] || 0;
            });
        }
        return r;
    });

    return rows;
}

// ── Enriquecer row com dados de outras coleções (para GET by ID) ────────────

async function enrichRow(row, sql, db) {
    return row; // JOINs já tratados em handleAll se necessário
}

// ── Helpers de parsing SQL ─────────────────────────────────────────────────

function extractFrom(sql) {
    const m = sql.match(/FROM\s+(\w+)/i);
    return m ? m[1].toLowerCase() : '';
}

function extractSimpleWhereField(sql) {
    const m = sql.match(/WHERE\s+(\w+)\s*=\s*\?/i);
    return m ? m[1] : 'id';
}

function applySimpleWhere(q, sql, params) {
    const whereMatch = sql.match(/WHERE\s+([\w.]+)\s*(=|!=|>|<|>=|<=)\s*\?/i);
    if (!whereMatch || params.length === 0) return q;
    const field = whereMatch[1].replace(/\w+\./, '');
    const op = whereMatch[2];
    const opMap = { '=': '==', '!=': '!=', '>': '>', '<': '<', '>=': '>=', '<=': '<=' };
    return q.where(field, opMap[op] || '==', params[0]);
}

module.exports = { handleGet, handleAll };
