export const render = () => {
    const container = document.createElement('div');
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const canEdit = !['producao', 'vendedor'].includes(currentUser.role);

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">Produtos</div>
            ${canEdit ? '<button class="btn btn-primary" style="width: auto;" id="btn-new-product">Adicionar Produto</button>' : ''}
        </div>
        <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:0.75rem 1rem; margin-bottom:1rem; display:flex; align-items:center; gap:0.5rem; font-size:0.9rem; color:#1e40af;">
            <span>📦</span>
            <span>Cadastre os produtos aqui. Controle de estoque e cores de pulseiras na aba <a href="#" id="link-estoque" style="font-weight:bold; color:#2563eb; text-decoration:underline;">Estoque</a>.</span>
        </div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem; padding:0.75rem; background:white; border-radius:8px; border:1px solid var(--border);">
            <input type="text" id="product-filter-search" placeholder="🔍 Buscar produto..." style="flex:2; min-width:180px; padding:0.5rem 0.75rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
            <select id="product-filter-type" style="flex:1; min-width:130px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
                <option value="">Todos os tipos</option>
            </select>
            <select id="product-filter-prazo" style="flex:1; min-width:150px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
                <option value="">Todos os prazos</option>
                <option value="1d">⚡ 1 Dia (Urgente)</option>
                <option value="3d">📅 3 Dias</option>
                <option value="terc">🏭 Terceirizado</option>
            </select>
            <select id="product-filter-produto" style="flex:1; min-width:160px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
                <option value="">Todos os produtos</option>
            </select>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Produto</th>
                    <th>Tipo</th>
                    <th>Preço 3D</th>
                    <th>Preço 1D / Prazo</th>
                    <th>Estoque</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="products-list">
                <tr><td colspan="6">Carregando...</td></tr>
            </tbody>
        </table>

        <!-- Modal -->
        <div class="modal-overlay" id="product-modal">
            <div class="modal" style="max-width:560px">
                <div class="modal-header">
                    <h3 id="modal-title">Adicionar Produto</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <!-- Tabs -->
                <div id="product-tabs" style="display:none; border-bottom:2px solid #e2e8f0; margin:0 1.5rem; display:flex; gap:0;">
                    <button type="button" class="product-tab active" data-tab="dados" style="padding:0.6rem 1.2rem; border:none; background:transparent; cursor:pointer; font-weight:600; font-size:0.9rem; color:#64748b; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s;">📋 Dados</button>
                    <button type="button" class="product-tab" data-tab="custo" style="padding:0.6rem 1.2rem; border:none; background:transparent; cursor:pointer; font-weight:600; font-size:0.9rem; color:#64748b; border-bottom:2px solid transparent; margin-bottom:-2px; transition:all 0.2s;">💰 Valor de Custo</button>
                </div>
                <!-- Tab: Dados -->
                <div id="tab-dados">
                <form id="product-form">
                    <input type="hidden" name="id" id="product-id">
                    <div class="form-group">
                        <label>Nome do Produto</label>
                        <input type="text" name="name" id="product-name" placeholder="Ex: Adesivo Vinil, Banner Lona" required>
                    </div>
                    <div class="form-group">
                        <label>Tipo de Produto</label>
                        <input type="text" name="type" id="product-type" placeholder="Ex: Papelaria, Banner, Adesivo">
                    </div>
                    <div class="form-group" style="display:flex; gap:1rem">
                        <div style="flex:1">
                            <label>Valor 3 Dias (R$)</label>
                            <input type="number" step="0.01" min="0" name="price_3_days" id="product-price-3" value="0" required>
                        </div>
                        <div style="flex:1">
                            <label>Valor 1 Dia - Urgente (R$)</label>
                            <input type="number" step="0.01" min="0" name="price_1_day" id="product-price-1" value="0" required>
                        </div>
                        <div style="flex:1">
                            <label style="color:#dc2626; font-weight:600;">💰 Custo Unit. (R$)</label>
                            <input type="number" step="0.01" min="0" name="unit_cost" id="product-unit-cost" value="0" style="border-color:#fca5a5;">
                        </div>
                    </div>
                    <div class="form-group" style="display:flex; gap:1rem; align-items:end">
                        <div style="flex:1" id="stock-field">
                            <label>Quantidade em Estoque</label>
                            <input type="number" name="stock" id="product-stock" value="0" min="0" required>
                        </div>
                        <div style="flex:1">
                            <label id="time-label">Tempo de Produção (min)</label>
                            <input type="number" name="production_time" id="product-time" value="0" min="0">
                        </div>
                        <div style="display:flex; align-items:center; gap:0.4rem; padding-bottom:0.35rem;">
                            <input type="checkbox" id="product-terceirizado" name="terceirizado" value="1" style="width:18px; height:18px; cursor:pointer;">
                            <label for="product-terceirizado" style="cursor:pointer; white-space:nowrap; font-size:0.85rem;">🏭 Terceirizado</label>
                        </div>
                    </div>
                    <!-- Color variants editor (pulseiras) -->
                    <div id="color-variants-section" style="display:none; margin-top:1rem; padding-top:1rem; border-top:2px dashed #e2e8f0">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem">
                            <label style="font-weight:700; font-size:0.9rem; color:#1e293b">🎨 Cores e Quantidades em Estoque</label>
                            <button type="button" id="btn-add-color" class="btn btn-secondary btn-sm" style="width:auto">+ Adicionar Cor</button>
                        </div>
                        <div id="color-variants-list" style="display:flex; flex-direction:column; gap:0.5rem; max-height:220px; overflow-y:auto">
                            <!-- rows injected dynamically -->
                        </div>
                        <p style="font-size:0.78rem; color:#64748b; margin-top:0.4rem">O estoque total é calculado automaticamente pela soma das cores.</p>
                    </div>
                    <div style="display:flex; justify-content:flex-end; gap:0.5rem; margin-top:1rem">
                        <button type="button" class="btn btn-secondary modal-close-btn">Cancelar</button>
                        <button type="submit" class="btn btn-primary">Salvar</button>
                    </div>
                </form>
                </div>
                <!-- Tab: Valor de Custo -->
                <div id="tab-custo" style="display:none; padding:1.5rem;">
                    <div style="text-align:center; margin-bottom:1.2rem;">
                        <div style="font-size:0.85rem; color:#64748b; margin-bottom:0.25rem;">Custo Total Acumulado</div>
                        <div id="cost-total-value" style="font-size:2rem; font-weight:800; color:#dc2626;">R$ 0,00</div>
                        <div style="font-size:0.78rem; color:#94a3b8; margin-top:0.25rem;">Soma de todos os pedidos internos que usaram este material</div>
                    </div>
                    <div style="border-top:1px solid #e2e8f0; padding-top:1rem;">
                        <h4 style="font-size:0.9rem; color:#1e293b; margin-bottom:0.5rem;">📜 Histórico de Custos</h4>
                        <div id="cost-history-list" style="max-height:250px; overflow-y:auto;">
                            <p style="color:#94a3b8; text-align:center; padding:1rem;">Nenhum custo registrado</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.querySelector('#link-estoque').onclick = (e) => {
        e.preventDefault();
        document.querySelector('[data-view="estoque"]')?.click();
    };

    let allProducts = [];

    const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const renderProducts = () => {
        const search = removeAccents(container.querySelector('#product-filter-search').value.toLowerCase().trim());
        const typeFilter = container.querySelector('#product-filter-type').value;
        const prazoFilter = container.querySelector('#product-filter-prazo').value;
        const produtoFilter = container.querySelector('#product-filter-produto').value;
        const filtered = allProducts.filter(p => {
            if (search && !removeAccents(`${p.name} ${p.type || ''}`.toLowerCase()).includes(search)) return false;
            if (typeFilter && (p.type || '') !== typeFilter) return false;
            if (prazoFilter === '1d' && (p.terceirizado || !parseFloat(p.price_1_day))) return false;
            if (prazoFilter === '3d' && (p.terceirizado || !parseFloat(p.price_3_days))) return false;
            if (prazoFilter === 'terc' && !p.terceirizado) return false;
            if (produtoFilter && String(p.id) !== produtoFilter) return false;
            return true;
        });

        const tbody = container.querySelector('#products-list');
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8; padding:2rem;">Nenhum produto encontrado</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(p => {
            const stock = p.stock || 0;
            const minStock = p.min_stock || 5;
            let stockBadge = stock <= 0
                ? '<span style="background:#fee2e2; color:#b91c1c; padding:2px 8px; border-radius:10px; font-size:0.8em; font-weight:bold;">Zerado</span>'
                : stock <= minStock
                    ? '<span style="background:#fef3c7; color:#92400e; padding:2px 8px; border-radius:10px; font-size:0.8em; font-weight:bold;">Baixo</span>'
                    : '<span style="background:#d1fae5; color:#065f46; padding:2px 8px; border-radius:10px; font-size:0.8em; font-weight:bold;">OK</span>';

            return `
            <tr>
                <td><b>${p.name}</b>${p.terceirizado ? ' <span style="background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:8px; font-size:0.75em;">🏭 Terc.</span>' : ''}</td>
                <td>${p.type || '-'}</td>
                <td>R$ ${parseFloat(p.price_3_days || p.price || 0).toFixed(2)}</td>
                <td>${p.terceirizado
                    ? (p.production_time ? `<span style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:10px; padding:2px 10px; font-size:0.8em; color:#1d4ed8; font-weight:600; display:inline-block;">📅 ${p.production_time} dia${p.production_time == 1 ? '' : 's'}</span>` : '<span style="color:#94a3b8">—</span>')
                    : `<span style="color:#dc2626; font-weight:600">R$ ${parseFloat(p.price_1_day || 0).toFixed(2)}</span>`
                }</td>
                <td>${p.terceirizado ? '<span style="color:#94a3b8;">—</span>' : `<b>${stock}</b> ${stockBadge}`}</td>
                <td>
                    ${canEdit ? `<button class="btn btn-secondary btn-sm edit-btn" data-id="${p.id}">Editar</button>
                    <button class="btn btn-sm delete-btn" style="background:#fee2e2; color:#b91c1c; border:none; margin-left:4px;" data-id="${p.id}">🗑️</button>` : '<span style="color:#94a3b8; font-size:0.85rem;">Somente leitura</span>'}
                </td>
            </tr>`;
        }).join('');

        const productMap = Object.fromEntries(allProducts.map(p => [p.id, p]));
        tbody.querySelectorAll('.edit-btn').forEach(btn => btn.onclick = () => openEditModal(productMap[parseInt(btn.dataset.id)]));
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async () => {
                if (!confirm('Excluir este produto?')) return;
                await fetch(`/api/products/${btn.dataset.id}`, { method: 'DELETE' });
                loadProducts();
            };
        });
    };

    const loadProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const { data } = await res.json();
            allProducts = data;
            const stockByType = data.reduce((acc, p) => { if (p.type) acc[p.type] = p.stock || 0; return acc; }, {});
            const types = [...new Set(data.map(p => p.type || '').filter(t => t))].sort();
            const typeSelect = container.querySelector('#product-filter-type');
            const cur = typeSelect.value;
            typeSelect.innerHTML = '<option value="">Todos os tipos</option>' + types.map(t => `<option value="${t}" ${t === cur ? 'selected' : ''}>${t} (${stockByType[t] || 0})</option>`).join('');

            // Populate product select
            const produtoSelect = container.querySelector('#product-filter-produto');
            const curProd = produtoSelect.value;
            produtoSelect.innerHTML = '<option value="">Todos os produtos</option>' + data.map(p => `<option value="${p.id}" ${String(p.id) === curProd ? 'selected' : ''}>${p.name}${p.type ? ' (' + p.type + ')' : ''}</option>`).join('');

            renderProducts();
        } catch (e) { console.error(e); }
    };

    const modal = container.querySelector('#product-modal');
    const form = container.querySelector('#product-form');
    const closeModal = () => modal.classList.remove('open');

    const updateTerceirizadoUI = (checked) => {
        container.querySelector('#stock-field').style.display = checked ? 'none' : '';
        container.querySelector('#time-label').textContent = checked ? 'Prazo de Entrega (dias)' : 'Tempo de Produção (min)';
    };
    container.querySelector('#product-terceirizado').addEventListener('change', function () { updateTerceirizadoUI(this.checked); });

    const isBraceletType = (val) => (val || '').toLowerCase().includes('pulseira');

    // Color variants state
    let colorRows = []; // [{color, quantity}]

    const colorSection = container.querySelector('#color-variants-section');
    const colorList = container.querySelector('#color-variants-list');

    const renderColorRows = () => {
        colorList.innerHTML = colorRows.map((row, i) => `
            <div style="display:grid; grid-template-columns:1fr 90px auto; gap:6px; align-items:center" data-row="${i}">
                <input type="text" class="color-row-name" placeholder="Nome da cor (ex: Vermelho, #FF0000)" value="${row.color}" style="padding:5px 8px; border:1px solid #cbd5e1; border-radius:6px; font-size:0.9rem">
                <input type="number" class="color-row-qty" min="0" placeholder="Qtd" value="${row.quantity}" style="padding:5px 8px; border:1px solid #cbd5e1; border-radius:6px; text-align:center; font-size:0.9rem">
                <button type="button" class="remove-color-row" data-index="${i}" style="background:#fee2e2; color:#b91c1c; border:none; border-radius:6px; padding:4px 8px; cursor:pointer; font-size:1rem">&times;</button>
            </div>
        `).join('');

        colorList.querySelectorAll('.color-row-name').forEach((inp, i) => {
            inp.oninput = () => { colorRows[i].color = inp.value; };
        });
        colorList.querySelectorAll('.color-row-qty').forEach((inp, i) => {
            inp.oninput = () => { colorRows[i].quantity = parseInt(inp.value) || 0; };
        });
        colorList.querySelectorAll('.remove-color-row').forEach(btn => {
            btn.onclick = () => {
                colorRows.splice(parseInt(btn.dataset.index), 1);
                renderColorRows();
            };
        });
    };

    container.querySelector('#btn-add-color').onclick = () => {
        colorRows.push({ color: '', quantity: 0 });
        renderColorRows();
    };

    // Show/hide color section based on product type field
    container.querySelector('#product-type').addEventListener('input', function () {
        if (isBraceletType(this.value)) {
            colorSection.style.display = 'block';
        } else {
            colorSection.style.display = 'none';
            colorRows = [];
            renderColorRows();
        }
    });

    const openModal = () => {
        form.reset();
        container.querySelector('#product-id').value = '';
        container.querySelector('#product-stock').value = '0';
        container.querySelector('#product-terceirizado').checked = false;
        updateTerceirizadoUI(false);
        container.querySelector('#modal-title').innerText = 'Adicionar Produto';
        colorSection.style.display = 'none';
        colorRows = [];
        renderColorRows();
        // Hide tabs and cost tab when adding new product
        container.querySelector('#product-tabs').style.display = 'none';
        container.querySelector('#tab-dados').style.display = '';
        container.querySelector('#tab-custo').style.display = 'none';
        modal.classList.add('open');
    };

    const openEditModal = async (p) => {
        container.querySelector('#product-id').value = p.id;
        container.querySelector('#product-name').value = p.name;
        container.querySelector('#product-type').value = p.type || '';
        container.querySelector('#product-price-3').value = p.price_3_days || p.price || 0;
        container.querySelector('#product-price-1').value = p.price_1_day || 0;
        container.querySelector('#product-unit-cost').value = p.unit_cost || 0;
        container.querySelector('#product-stock').value = p.stock || 0;
        container.querySelector('#product-time').value = p.production_time || 0;
        container.querySelector('#product-terceirizado').checked = !!p.terceirizado;
        updateTerceirizadoUI(!!p.terceirizado);
        container.querySelector('#modal-title').innerText = 'Editar Produto';

        // Load color variants if bracelet
        colorRows = [];
        if (isBraceletType(p.type) || isBraceletType(p.name)) {
            colorSection.style.display = 'block';
            try {
                const res = await fetch(`/api/products/${p.id}/colors`);
                const { data } = await res.json();
                colorRows = data.map(v => ({ color: v.color, quantity: v.quantity }));
            } catch (e) { colorRows = []; }
        } else {
            colorSection.style.display = 'none';
        }
        renderColorRows();

        // Show tabs and load cost data
        const tabsEl = container.querySelector('#product-tabs');
        tabsEl.style.display = 'flex';
        switchTab('dados');
        loadCostHistory(p.id);

        modal.classList.add('open');
    };

    // Tab switching logic
    const switchTab = (tabName) => {
        container.querySelectorAll('.product-tab').forEach(t => {
            const isActive = t.dataset.tab === tabName;
            t.style.color = isActive ? '#7c3aed' : '#64748b';
            t.style.borderBottomColor = isActive ? '#7c3aed' : 'transparent';
            t.classList.toggle('active', isActive);
        });
        container.querySelector('#tab-dados').style.display = tabName === 'dados' ? '' : 'none';
        container.querySelector('#tab-custo').style.display = tabName === 'custo' ? '' : 'none';
    };

    container.querySelectorAll('.product-tab').forEach(tab => {
        tab.onclick = () => switchTab(tab.dataset.tab);
    });

    // Load cost history for a product
    const loadCostHistory = async (productId) => {
        try {
            const res = await fetch(`/api/products/${productId}/costs`);
            const { data, total_cost } = await res.json();
            container.querySelector('#cost-total-value').textContent = `R$ ${(total_cost || 0).toFixed(2).replace('.', ',')}`;

            const histList = container.querySelector('#cost-history-list');
            if (!data || data.length === 0) {
                histList.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:1rem;">Nenhum custo registrado para este produto</p>';
            } else {
                histList.innerHTML = `
                    <table style="width:100%; border-collapse:collapse; font-size:0.85rem;">
                        <thead>
                            <tr style="background:#f8fafc;">
                                <th style="padding:6px 8px; text-align:left; border-bottom:1px solid #e2e8f0;">Data</th>
                                <th style="padding:6px 8px; text-align:left; border-bottom:1px solid #e2e8f0;">Descrição</th>
                                <th style="padding:6px 8px; text-align:center; border-bottom:1px solid #e2e8f0;">Qtd</th>
                                <th style="padding:6px 8px; text-align:right; border-bottom:1px solid #e2e8f0;">Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${data.map(c => `
                                <tr style="border-bottom:1px solid #f1f5f9;">
                                    <td style="padding:6px 8px; white-space:nowrap;">${new Date(c.created_at).toLocaleDateString('pt-BR')}</td>
                                    <td style="padding:6px 8px; color:#475569;">${c.description || '-'}</td>
                                    <td style="padding:6px 8px; text-align:center;">${c.quantity || 1}</td>
                                    <td style="padding:6px 8px; text-align:right; font-weight:600; color:#dc2626;">R$ ${(c.cost_amount || 0).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        } catch (e) {
            console.error('Error loading cost history:', e);
        }
    };

    const newBtn = container.querySelector('#btn-new-product');
    if (newBtn) newBtn.onclick = openModal;
    container.querySelector('.modal-close').onclick = closeModal;
    container.querySelector('.modal-close-btn').onclick = closeModal;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const body = Object.fromEntries(new FormData(e.target));
        body.terceirizado = container.querySelector('#product-terceirizado').checked ? 1 : 0;
        const id = body.id;
        const url = id ? `/api/products/${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';
        if (!id) delete body.id;
        const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const json = await res.json();

        // Save color variants if bracelet type
        const productId = id || json.id;
        const typeVal = container.querySelector('#product-type').value;
        const nameVal = container.querySelector('#product-name').value;
        if (productId && (isBraceletType(typeVal) || isBraceletType(nameVal)) && colorRows.length > 0) {
            const variants = colorRows.filter(r => r.color.trim());
            await fetch(`/api/products/${productId}/colors`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variants })
            });
        }

        closeModal();
        loadProducts();
    };

    container.querySelector('#product-filter-search').addEventListener('input', renderProducts);
    container.querySelector('#product-filter-type').addEventListener('change', renderProducts);
    container.querySelector('#product-filter-prazo').addEventListener('change', renderProducts);
    container.querySelector('#product-filter-produto').addEventListener('change', renderProducts);
    loadProducts();
    return container;
};
