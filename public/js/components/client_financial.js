export const render = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clientId = user.client_id;
    const container = document.createElement('div');

    container.innerHTML = `
        <!-- Header -->
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem;">
            <div style="display:flex; flex-direction:column; gap:0.2rem;">
                <h2 style="font-size: 1.8rem; font-weight: 900; background: linear-gradient(135deg, var(--primary), #4c1d95); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin:0; letter-spacing: -0.03em;">💰 Meu Financeiro</h2>
                <p style="color: #64748b; margin: 0; font-size: 0.95rem; font-weight:500; white-space: nowrap;">Acompanhe o extrato das suas compras e faturamentos em aberto.</p>
            </div>
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
            <select id="cf-filter-event" style="flex:1; min-width:130px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
                <option value="">Todos os eventos</option>
            </select>
            <input type="text" id="cf-filter-search" placeholder="🔍 Buscar produto..." style="flex:2; min-width:180px; padding:0.5rem 0.75rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
            <select id="cf-filter-month" style="flex:1; min-width:130px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
                <option value="">Todos os meses</option>
            </select>
            <input type="number" id="cf-filter-min" placeholder="Valor mín" step="0.01" min="0" style="width:100px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">
            <input type="number" id="cf-filter-max" placeholder="Valor máx" step="0.01" min="0" style="width:100px; padding:0.5rem; border:1px solid var(--border); border-radius:6px; font-size:0.9rem;">

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
        const eventFilter = container.querySelector('#cf-filter-event').value;

        const filtered = allData.filter(s => {
            if (search) {
                const haystack = removeAccents(`${s.products_summary || ''} ${s.description || ''} ${s.payment_method || ''} ${s.event_name || ''}`.toLowerCase());
                if (!haystack.includes(search)) return false;
            }
            if (monthFilter) {
                const d = window.parseDBDate(s.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
                if (key !== monthFilter) return false;
            }
            if (eventFilter && s.event_name !== eventFilter) return false;
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
            const d = window.parseDBDate(s.created_at);
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
                        <td>${window.parseDBDate(s.created_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                        <td style="font-size:0.85rem">${s.products_summary || '-'}${s.event_name ? `<br><span style="background:#f3e8ff; color:#7c3aed; padding:1px 6px; border-radius:10px; font-size:0.7rem; font-weight:600; display:inline-block; margin-top:2px;">🏷️ ${s.event_name}</span>` : ''}</td>
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
                        <td colspan="3" style="text-align:right; font-size:0.9rem; color:#475569; padding:6px 12px;">
                            💳 <b>${pm}</b> <span style="color:#94a3b8">(${byMethod[pm].count} pedido${byMethod[pm].count > 1 ? 's' : ''})</span>
                        </td>
                        <td style="font-weight:bold; color:#7c3aed; font-size:0.95rem;">R$ ${byMethod[pm].total.toFixed(2)}</td>
                        <td colspan="2"></td>
                    </tr>
                `).join('');

                // Event breakdown inside the month
                const byEvent = {};
                m.items.forEach(s => {
                    if (s.event_name) {
                        if (!byEvent[s.event_name]) byEvent[s.event_name] = { count: 0, total: 0 };
                        byEvent[s.event_name].count++;
                        byEvent[s.event_name].total += (s.total_value || 0);
                    }
                });
                const eventKeys = Object.keys(byEvent).sort();
                let eventRows = '';
                if (eventKeys.length > 0) {
                    eventRows = `<tr style="background:#f3e8ff;">
                        <td colspan="6" style="padding:4px 12px; font-size:0.8rem; font-weight:bold; color:#7c3aed;">🏷️ Gastos por Evento neste mês:</td>
                    </tr>` + eventKeys.map(evt => `
                        <tr style="background:#faf5ff;">
                            <td colspan="3" style="text-align:right; font-size:0.85rem; color:#6b21a8; padding:4px 12px;">
                                ${evt} <span style="color:#a855f7">(${byEvent[evt].count} util.)</span>
                            </td>
                            <td style="font-weight:bold; color:#7c3aed; font-size:0.9rem;">R$ ${byEvent[evt].total.toFixed(2)}</td>
                            <td colspan="2"></td>
                        </tr>
                    `).join('');
                }

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
                            ${eventRows}
                            <tr style="background:linear-gradient(135deg, #f0fdf4, #dcfce7); font-weight:bold;">
                                <td colspan="3" style="text-align:right; font-size:1.05rem; color:#166534; padding:10px 12px;">${closingLabel} ${m.label}:</td>
                                <td style="font-size:1.15rem; color:#166534;">R$ ${m.total.toFixed(2)}</td>
                                <td colspan="2"></td>
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

            // Populate month and event filters
            const monthSet = new Set();
            const eventSet = new Set();
            allData.forEach(s => {
                const d = window.parseDBDate(s.created_at);
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
                monthSet.add(key);
                if (s.event_name) eventSet.add(s.event_name);
            });
            const monthSelect = container.querySelector('#cf-filter-month');
            const currentVal = monthSelect.value;
            monthSelect.innerHTML = '<option value="">Todos os meses</option>' +
                [...monthSet].sort((a, b) => b.localeCompare(a)).map(key => {
                    const [y, m] = key.split('-');
                    return `<option value="${key}" ${key === currentVal ? 'selected' : ''}>${monthNames[parseInt(m)]} ${y}</option>`;
                }).join('');
                
            const eventSelect = container.querySelector('#cf-filter-event');
            const currentEvent = eventSelect.value;
            eventSelect.innerHTML = '<option value="">Todos os eventos</option>' + 
                [...eventSet].sort().map(e => `<option value="${e}" ${e === currentEvent ? 'selected' : ''}>${e}</option>`).join('');

            applyFilters();
        } catch (e) {
            console.error('Erro ao carregar financeiro do cliente:', e);
            container.querySelector('#cf-monthly-container').innerHTML = '<p style="text-align:center; color:#ef4444; padding:2rem;">Erro ao carregar dados financeiros.</p>';
        }
    };

    // Filter event listeners
    container.querySelector('#cf-filter-event').onchange = applyFilters;
    container.querySelector('#cf-filter-search').oninput = applyFilters;
    container.querySelector('#cf-filter-month').onchange = applyFilters;
    container.querySelector('#cf-filter-min').oninput = applyFilters;
    container.querySelector('#cf-filter-max').oninput = applyFilters;


    loadFinancial();
    return container;
};
