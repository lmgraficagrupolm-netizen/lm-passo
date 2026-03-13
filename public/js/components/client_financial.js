export const render = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clientId = user.client_id;
    const container = document.createElement('div');

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">💰 Meu Financeiro</div>
        </div>

        <!-- Summary Cards -->
        <div class="stock-cards" id="cf-cards" style="margin-bottom:1rem">
            <div class="stock-card">
                <div class="stock-card-icon" style="background:#10b98120; color:#10b981">
                    <ion-icon name="receipt-outline"></ion-icon>
                </div>
                <div class="stock-card-info">
                    <div class="stock-card-value" id="cf-total-orders">-</div>
                    <div class="stock-card-label">Total Transações</div>
                </div>
            </div>
            <div class="stock-card">
                <div class="stock-card-icon" style="background:#7c3aed20; color:#7c3aed">
                    <ion-icon name="cash-outline"></ion-icon>
                </div>
                <div class="stock-card-info">
                    <div class="stock-card-value" id="cf-total-value">R$ 0</div>
                    <div class="stock-card-label">Valor Total</div>
                </div>
            </div>
            <div class="stock-card">
                <div class="stock-card-icon" style="background:#dc262620; color:#dc2626">
                    <ion-icon name="pricetag-outline"></ion-icon>
                </div>
                <div class="stock-card-info">
                    <div class="stock-card-value" id="cf-total-discount" style="color:#dc2626">R$ 0</div>
                    <div class="stock-card-label">Total Descontos</div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:1rem; padding:0.75rem; background:white; border-radius:8px; border:1px solid var(--border);">
            <input type="text" id="cf-filter-search" placeholder="🔍 Buscar produto..." style="flex:2; min-width:180px; padding:0.5rem 0.75rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
            <select id="cf-filter-month" style="flex:1; min-width:130px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
                <option value="">Todos os meses</option>
            </select>
            <input type="number" id="cf-filter-min" placeholder="Valor mín" step="0.01" min="0" style="width:100px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
            <input type="number" id="cf-filter-max" placeholder="Valor máx" step="0.01" min="0" style="width:100px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
            <button class="btn btn-secondary" id="cf-btn-clear" style="width:auto; padding:0.5rem 0.75rem; font-size:0.85rem;">Limpar</button>
        </div>

        <div id="cf-monthly-container"></div>
    `;

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    let allData = [];

    const removeAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const applyFilters = () => {
        const search = removeAccents(container.querySelector('#cf-filter-search').value.toLowerCase().trim());
        const monthFilter = container.querySelector('#cf-filter-month').value;
        const minVal = parseFloat(container.querySelector('#cf-filter-min').value) || 0;
        const maxVal = parseFloat(container.querySelector('#cf-filter-max').value) || Infinity;

        const filtered = allData.filter(s => {
            if (search) {
                const haystack = removeAccents(`${s.products_summary || ''} ${s.description || ''} ${s.payment_method || ''}`.toLowerCase());
                if (!haystack.includes(search)) return false;
            }
            if (monthFilter) {
                const d = new Date(s.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
                if (key !== monthFilter) return false;
            }
            const val = s.total_value || 0;
            if (val < minVal || val > maxVal) return false;
            return true;
        });

        renderData(filtered);
    };

    const renderData = (data) => {
        let totalGeral = 0;
        let totalDiscount = 0;

        const months = {};
        data.forEach(s => {
            const d = new Date(s.created_at);
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
            if (!months[key]) {
                months[key] = {
                    label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
                    year: d.getFullYear(),
                    month: d.getMonth(),
                    items: [],
                    total: 0
                };
            }
            months[key].items.push(s);
            months[key].total += (s.total_value || 0);
            totalGeral += (s.total_value || 0);
            totalDiscount += (s.discount_value || 0);
        });

        const sortedKeys = Object.keys(months).sort((a, b) => b.localeCompare(a));
        const monthlyContainer = container.querySelector('#cf-monthly-container');

        if (sortedKeys.length === 0) {
            monthlyContainer.innerHTML = '<p style="text-align:center; color:#94a3b8; padding:2rem;">Nenhuma transação encontrada</p>';
        } else {
            monthlyContainer.innerHTML = sortedKeys.map(key => {
                const m = months[key];
                const rows = m.items.map(s => `
                    <tr>
                        <td>${new Date(s.created_at).toLocaleDateString('pt-BR')}</td>
                        <td style="font-size:0.85rem">${s.products_summary || '-'}</td>
                        <td style="font-size:0.85rem; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${(s.description || '').replace(/"/g, '&quot;')}">${s.description || '-'}</td>
                        <td style="font-weight:bold; color:#7c3aed">R$ ${(s.total_value || 0).toFixed(2)}</td>
                        <td style="color:${(s.discount_value || 0) > 0 ? '#dc2626' : '#94a3b8'}; font-weight:${(s.discount_value || 0) > 0 ? '600' : 'normal'}">${(s.discount_value || 0) > 0 ? `- R$ ${(s.discount_value).toFixed(2)}` : '-'}</td>
                        <td>${s.payment_method || '-'}</td>
                    </tr>`
                ).join('');

                // Payment method breakdown
                const byMethod = {};
                m.items.forEach(s => {
                    const pm = s.payment_method || 'Outros';
                    if (!byMethod[pm]) byMethod[pm] = { count: 0, total: 0 };
                    byMethod[pm].count++;
                    byMethod[pm].total += (s.total_value || 0);
                });
                const methodKeys = Object.keys(byMethod).sort();
                const methodRows = methodKeys.map(pm => `
                    <tr style="background:#f8f9fa;">
                        <td colspan="4" style="text-align:right; font-size:0.9rem; color:#475569; padding:6px 12px;">
                            💳 <b>${pm}</b> <span style="color:#94a3b8">(${byMethod[pm].count} pedido${byMethod[pm].count > 1 ? 's' : ''})</span>
                        </td>
                        <td style="font-weight:bold; color:#7c3aed; font-size:0.95rem;">R$ ${byMethod[pm].total.toFixed(2)}</td>
                        <td></td>
                    </tr>
                `).join('');

                const now = new Date();
                const isCurrentMonth = m.year === now.getFullYear() && m.month === now.getMonth();
                const closingLabel = isCurrentMonth ? '📊 Parcial' : '📊 Fechamento';

                return `
                <div style="margin-bottom:2rem;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:0.75rem 1rem; background:linear-gradient(135deg, #065f46, #047857); color:white; border-radius:8px 8px 0 0;">
                        <h3 style="margin:0; font-size:1.1rem;">📅 ${m.label}</h3>
                        <span style="font-size:0.9rem; opacity:0.9;">${m.items.length} transações</span>
                    </div>
                    <table class="data-table" style="border-radius:0 0 8px 8px; margin-top:0;">
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Produtos</th>
                                <th>Descrição</th>
                                <th>Valor Pago</th>
                                <th>Desconto</th>
                                <th>Pagamento</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                        <tfoot>
                            <tr><td colspan="6" style="padding:0"><hr style="border:none; border-top:2px dashed #a7f3d0; margin:0;"></td></tr>
                            ${methodRows}
                            <tr style="background:linear-gradient(135deg, #f0fdf4, #dcfce7); font-weight:bold;">
                                <td colspan="4" style="text-align:right; font-size:1.05rem; color:#166534; padding:10px 12px;">${closingLabel} ${m.label}:</td>
                                <td style="font-size:1.15rem; color:#166534;">R$ ${m.total.toFixed(2)}</td>
                                <td></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>`;
            }).join('');
        }

        // Summary cards
        container.querySelector('#cf-total-orders').textContent = data.length;
        container.querySelector('#cf-total-value').textContent = `R$ ${totalGeral.toFixed(2)}`;
        container.querySelector('#cf-total-discount').textContent = `R$ ${totalDiscount.toFixed(2)}`;
    };

    const loadFinancial = async () => {
        if (!clientId) {
            container.querySelector('#cf-monthly-container').innerHTML = '<p style="text-align:center; color:#ef4444; padding:2rem;">⚠️ Conta não vinculada a um cliente. Contate o administrador.</p>';
            return;
        }

        try {
            const res = await fetch(`/api/reports/client-financial/${clientId}`);
            const { data } = await res.json();
            allData = data || [];

            // Populate month filter
            const monthSet = new Set();
            allData.forEach(s => {
                const d = new Date(s.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
                monthSet.add(key);
            });
            const monthSelect = container.querySelector('#cf-filter-month');
            const currentVal = monthSelect.value;
            monthSelect.innerHTML = '<option value="">Todos os meses</option>' +
                [...monthSet].sort((a, b) => b.localeCompare(a)).map(key => {
                    const [y, m] = key.split('-');
                    return `<option value="${key}" ${key === currentVal ? 'selected' : ''}>${monthNames[parseInt(m)]} ${y}</option>`;
                }).join('');

            applyFilters();
        } catch (e) {
            console.error('Erro ao carregar financeiro do cliente:', e);
            container.querySelector('#cf-monthly-container').innerHTML = '<p style="text-align:center; color:#ef4444; padding:2rem;">Erro ao carregar dados financeiros.</p>';
        }
    };

    // Filter event listeners
    container.querySelector('#cf-filter-search').oninput = applyFilters;
    container.querySelector('#cf-filter-month').onchange = applyFilters;
    container.querySelector('#cf-filter-min').oninput = applyFilters;
    container.querySelector('#cf-filter-max').oninput = applyFilters;
    container.querySelector('#cf-btn-clear').onclick = () => {
        container.querySelector('#cf-filter-search').value = '';
        container.querySelector('#cf-filter-month').value = '';
        container.querySelector('#cf-filter-min').value = '';
        container.querySelector('#cf-filter-max').value = '';
        applyFilters();
    };

    loadFinancial();
    return container;
};
