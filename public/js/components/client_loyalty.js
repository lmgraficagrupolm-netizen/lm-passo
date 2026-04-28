export const render = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const clientId = user.client_id;
    const container = document.createElement('div');

    container.innerHTML = `
        <style>
            .loyalty-tab-btn {
                display: flex; align-items: center; gap: 0.5rem;
                padding: 0.75rem 1.5rem; border: none; background: transparent;
                border-radius: 12px; font-size: 0.9rem; font-weight: 700;
                color: #64748b; cursor: pointer; transition: all 0.2s; white-space: nowrap;
            }
            .loyalty-tab-btn.active {
                background: white; color: #b45309;
                box-shadow: 0 2px 12px rgba(180,83,9,0.15);
            }
            .loyalty-tab-btn:hover:not(.active) { background: rgba(255,255,255,0.5); color: #92400e; }
            .loyalty-panel { display: none; }
            .loyalty-panel.active { display: block; }
            .mov-row {
                display: flex; align-items: center; gap: 1rem;
                padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9;
                transition: background 0.15s;
            }
            .mov-row:hover { background: #fafafa; }
            .mov-row:last-child { border-bottom: none; }
            .order-card {
                background: white; border-radius: 14px; border: 1px solid #e2e8f0;
                padding: 1.25rem 1.5rem; margin-bottom: 1rem;
                box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                transition: box-shadow 0.2s;
            }
            .order-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        </style>

        <!-- Top Header -->
        <div style="margin-bottom:2rem; position:relative;">
            <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
                <div id="cl-tier-icon" style="width:52px; height:52px; background:linear-gradient(135deg,#b45309,#f59e0b); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; box-shadow:0 6px 20px rgba(180,83,9,0.35); flex-shrink:0; transition:all 0.3s;">⭐</div>
                <div style="flex:1;">
                    <h2 id="cl-tier-title" style="font-size:1.75rem; font-weight:900; background:linear-gradient(135deg,#92400e,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0; letter-spacing:-0.03em;">Minha Conta Fidelidade</h2>
                    <p style="color:#64748b; margin:0; font-size:0.9rem; font-weight:500;">Bem-vindo, ${user.name}. <span id="cl-tier-desc"></span></p>
                </div>
            </div>
        </div>

        <!-- Animated Level-Up Modal -->
        <div id="levelup-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); z-index:9999; justify-content:center; align-items:center; flex-direction:column; text-align:center;">
            <div style="background:linear-gradient(135deg, #1e293b, #0f172a); border-radius:24px; padding:3rem; max-width:400px; width:90%; position:relative; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0, 0, 0, 0.5); border:2px solid rgba(255,255,255,0.1); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <style>
                    @keyframes popIn { 0% { transform:scale(0.8); opacity:0; } 100% { transform:scale(1); opacity:1; } }
                    @keyframes float { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-10px); } }
                    @keyframes glow { 0%, 100% { box-shadow:0 0 20px rgba(245, 158, 11, 0.5); } 50% { box-shadow:0 0 40px rgba(245, 158, 11, 0.8); } }
                </style>
                <div id="levelup-icon" style="font-size:5rem; animation:float 3s ease-in-out infinite;">🏆</div>
                <h1 id="levelup-title" style="color:white; font-size:2rem; font-weight:900; margin:1.5rem 0 0.5rem; letter-spacing:0.05em; background:linear-gradient(to right, #fcd34d, #f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">VOCÊ SUBIU DE NÍVEL!</h1>
                <p id="levelup-message" style="color:#cbd5e1; font-size:1.1rem; line-height:1.5; margin-bottom:2rem;">Parabéns! Agora você é VIP Ouro e tem 15% de desconto em tudo, além de prioridade máxima!</p>
                <button id="btn-ack-levelup" style="background:linear-gradient(to right, #f59e0b, #d97706); border:none; color:white; font-size:1.1rem; font-weight:800; padding:1rem 2rem; border-radius:12px; cursor:pointer; width:100%; transition:transform 0.2s; box-shadow:0 10px 15px -3px rgba(245,158,11,0.4);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">MUITO OBRIGADO!</button>
            </div>
            <!-- Confetti (basic CSS boxes) -->
            <div id="confetti-container" style="position:absolute; width:100%; height:100%; pointer-events:none; overflow:hidden;"></div>
        </div>

        <!-- Balance Cards -->
        <div class="stock-cards" style="margin-bottom:2rem;">
            <div class="stock-card" style="border:2px solid #fcd34d; background:linear-gradient(135deg,#fffbeb,#fef3c7); flex:1; min-width:180px;">
                <div class="stock-card-icon" style="background:#f59e0b20; color:#b45309;">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><line x1="12" y1="1" x2="12" y2="23"/><path stroke-linecap="round" stroke-linejoin="round" d="M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6"/></svg>
                </div>
                <div class="stock-card-info">
                    <div class="stock-card-value" id="cl-balance" style="color:#b45309; font-size:1.5rem;">R$ 0,00</div>
                    <div class="stock-card-label">Saldo Atual</div>
                </div>
            </div>
            <div class="stock-card" style="flex:1; min-width:180px;">
                <div class="stock-card-icon" style="background:#dc262620; color:#dc2626;">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                </div>
                <div class="stock-card-info">
                    <div class="stock-card-value" id="cl-total-orders" style="color:#dc2626;">0</div>
                    <div class="stock-card-label">Compras (mês)</div>
                </div>
            </div>
            <div class="stock-card" style="flex:1; min-width:180px;">
                <div class="stock-card-icon" style="background:#10b98120; color:#10b981;">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div class="stock-card-info">
                    <div class="stock-card-value" id="cl-total-debits" style="color:#10b981;">R$ 0,00</div>
                    <div class="stock-card-label">Total Gasto (mês)</div>
                </div>
            </div>
            <div class="stock-card" id="cl-billing-card" style="display:none; flex:1; min-width:180px; border:1px solid #c7d2fe;">
                <div class="stock-card-icon" style="background:#6366f120; color:#6366f1;">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div class="stock-card-info">
                    <div class="stock-card-value" id="cl-billing-date" style="color:#6366f1;">Dia --</div>
                    <div class="stock-card-label">Vencimento da Fatura</div>
                </div>
            </div>
        </div>

        <!-- Tabs -->
        <div style="background:rgba(180,83,9,0.06); border-radius:16px; padding:0.4rem; display:flex; gap:0.25rem; margin-bottom:1.5rem; flex-wrap:wrap;">
            <button class="loyalty-tab-btn active" data-tab="orders" id="tab-btn-orders">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                Minhas Compras
            </button>
            <button class="loyalty-tab-btn" data-tab="statement" id="tab-btn-statement">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17v-2m3 2v-4m3 4v-6M11 3H5a2 2 0 00-2 2v16a2 2 0 002 2h14a2 2 0 002-2v-5"/></svg>
                Extrato da Conta
            </button>
        </div>

        <!-- Month filter (shared) -->
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:1.25rem; flex-wrap:wrap;">
            <select id="cl-filter-month" style="padding:0.5rem 1rem; border:1px solid #e2e8f0; border-radius:8px; font-size:0.9rem; font-weight:600; background:white; color:#334155;">
                <option value="">Todos os meses</option>
            </select>
            <span id="cl-period-label" style="font-size:0.85rem; color:#64748b;"></span>
        </div>

        <!-- ── TAB: MINHAS COMPRAS ──────────────────────────────────────── -->
        <div class="loyalty-panel active" id="panel-orders">
            <div style="background:white; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.04);">
                <div style="background:linear-gradient(135deg,#b45309,#f59e0b); padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:white; font-weight:700;">🛍️ Histórico de Compras</span>
                    <span id="cl-orders-count" style="color:rgba(255,255,255,0.8); font-size:0.85rem;"></span>
                </div>
                <div id="cl-orders-list" style="padding:0.5rem;">
                    <div style="padding:3rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1rem;">
                        <div style="font-size:3rem; opacity:0.3;">🛍️</div>
                        <div style="font-weight:700; color:#94a3b8; font-size:1rem;">Nenhuma compra registrada</div>
                        <div style="color:#cbd5e1; font-size:0.85rem; max-width:300px;">Suas compras realizadas via Conta Fidelidade aparecerão aqui.</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- ── TAB: EXTRATO ───────────────────────────────────────────── -->
        <div class="loyalty-panel" id="panel-statement">
            <div style="background:white; border-radius:16px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.04);">
                <div style="background:linear-gradient(135deg,#b45309,#f59e0b); padding:1rem 1.5rem; display:flex; justify-content:space-between; align-items:center;">
                    <span style="color:white; font-weight:700;">💳 Extrato de Movimentações</span>
                    <span id="cl-movements-count" style="color:rgba(255,255,255,0.8); font-size:0.85rem;"></span>
                </div>
                <div id="cl-movements-list" style="min-height:100px;">
                    <div style="padding:3rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1rem;">
                        <div style="font-size:3rem; opacity:0.3;">💳</div>
                        <div style="font-weight:700; color:#94a3b8; font-size:1rem;">Conta zerada — sem movimentações</div>
                        <div style="color:#cbd5e1; font-size:0.85rem; max-width:300px;">Débitos de compras e pagamentos realizados aparecerão aqui no seu extrato.</div>
                    </div>
                </div>
            </div>
        </div>
    `;


    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    let allOrders    = [];
    let allMovements = [];

    const fmt = (val) => (parseFloat(val) || 0).toFixed(2).replace('.', ',');

    const statusLabel = (s) => {
        const map = {
            'pending':    { text: 'Aguardando',   color: '#f59e0b', bg: '#fffbeb' },
            'in_progress':{ text: 'Em Produção',  color: '#3b82f6', bg: '#eff6ff' },
            'ready':      { text: 'Em Retirada',  color: '#8b5cf6', bg: '#f5f3ff' },
            'completed':  { text: 'Finalizado',   color: '#10b981', bg: '#f0fdf4' },
        };
        return map[s] || { text: s || 'Aguardando', color: '#64748b', bg: '#f1f5f9' };
    };

    // ── Tab switching ─────────────────────────────────────────────────────────
    container.querySelectorAll('.loyalty-tab-btn').forEach(btn => {
        btn.onclick = () => {
            container.querySelectorAll('.loyalty-tab-btn').forEach(b => b.classList.remove('active'));
            container.querySelectorAll('.loyalty-panel').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            container.querySelector(`#panel-${btn.dataset.tab}`).classList.add('active');
        };
    });

    // ── Render: Orders ────────────────────────────────────────────────────────
    const renderOrders = (orders) => {
        const listEl  = container.querySelector('#cl-orders-list');
        const countEl = container.querySelector('#cl-orders-count');
        countEl.textContent = `${orders.length} pedido${orders.length !== 1 ? 's' : ''}`;

        // Update card
        const monthOrders = orders.filter(o => {
            const d = window.parseDBDate(o.created_at);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        container.querySelector('#cl-total-orders').textContent = monthOrders.length;
        const totalSpent = monthOrders.reduce((s, o) => s + parseFloat(o.total_value || 0), 0);
        container.querySelector('#cl-total-debits').textContent = `R$ ${fmt(totalSpent)}`;

        if (orders.length === 0) {
            listEl.innerHTML = `
                <div style="padding:3rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1rem;">
                    <div style="font-size:3rem; opacity:0.3;">🛍️</div>
                    <div style="font-weight:700; color:#94a3b8; font-size:1rem;">Nenhuma compra registrada</div>
                    <div style="color:#cbd5e1; font-size:0.85rem; max-width:300px;">Suas compras realizadas via Conta Fidelidade aparecerão aqui.</div>
                </div>`;
            return;
        }

        listEl.innerHTML = orders.map(o => {
            const st   = statusLabel(o.status);
            const date = window.parseDBDate(o.created_at).toLocaleDateString('pt-BR');
            const items = o.items
                ? o.items.map(i => `<span style="background:#f1f5f9; padding:2px 8px; border-radius:8px; font-size:0.78rem; font-weight:600; color:#334155;">${i.product_name || i.name}</span>`).join(' ')
                : '';
            return `
            <div class="order-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;">
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:800; color:#1e293b; font-size:1rem; margin-bottom:0.25rem;">Pedido #${o.id}</div>
                        <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:0.5rem;">📅 ${date}</div>
                        ${items ? `<div style="display:flex; flex-wrap:wrap; gap:0.3rem;">${items}</div>` : ''}
                    </div>
                    <div style="text-align:right; flex-shrink:0;">
                        <span style="background:${st.bg}; color:${st.color}; padding:4px 12px; border-radius:20px; font-size:0.8rem; font-weight:700; display:block; margin-bottom:0.5rem;">${st.text}</span>
                        <div style="font-size:1.15rem; font-weight:800; color:#1e293b;">R$ ${fmt(o.total_value)}</div>
                    </div>
                </div>
            </div>`;
        }).join('');
    };

    // ── Render: Movements (Extrato) ───────────────────────────────────────────
    const renderMovements = (movements) => {
        const listEl  = container.querySelector('#cl-movements-list');
        const countEl = container.querySelector('#cl-movements-count');
        countEl.textContent = `${movements.length} movimentação${movements.length !== 1 ? 'ões' : ''}`;

        if (movements.length === 0) {
            listEl.innerHTML = `
                <div style="padding:3rem 2rem; text-align:center; display:flex; flex-direction:column; align-items:center; gap:1rem;">
                    <div style="font-size:3rem; opacity:0.4;">💳</div>
                    <div style="font-weight:700; color:#94a3b8; font-size:1rem;">Conta zerada — sem movimentações</div>
                    <div style="color:#cbd5e1; font-size:0.85rem; max-width:300px;">Débitos de compras e pagamentos realizados aparecerão aqui no seu extrato.</div>
                </div>`;
            return;
        }

        listEl.innerHTML = movements.map(m => {
            const isCredit = m.type === 'payment_credit';
            const color  = isCredit ? '#10b981' : '#ef4444';
            const icon   = isCredit ? '💰' : '🛍️';
            const label  = isCredit ? 'Pagamento / Crédito' : 'Compra via Fidelidade';
            const date   = window.parseDBDate(m.created_at).toLocaleString('pt-BR', {
                timeZone:'America/Sao_Paulo', day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit'
            });
            return `
            <div class="mov-row" style="border-left:4px solid ${color};">
                <div style="width:40px; height:40px; border-radius:50%; background:${color}15; display:flex; align-items:center; justify-content:center; font-size:1.2rem; flex-shrink:0;">${icon}</div>
                <div style="flex:1; min-width:0;">
                    <div style="font-weight:700; color:#1e293b; font-size:0.92rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.description || label}</div>
                    <div style="font-size:0.75rem; color:#94a3b8; margin-top:2px; display:flex; gap:0.75rem; flex-wrap:wrap;">
                        <span>📅 ${date}</span>
                        <span style="background:#f1f5f9; padding:1px 8px; border-radius:10px; font-weight:600;">${label}</span>
                    </div>
                </div>
                <div style="font-size:1.1rem; font-weight:800; color:${color}; flex-shrink:0; text-align:right;">
                    ${isCredit ? '+' : '-'} R$ ${fmt(m.amount)}
                </div>
            </div>`;
        }).join('');
    };

    // ── Apply filter ──────────────────────────────────────────────────────────
    const applyFilter = () => {
        const monthVal = container.querySelector('#cl-filter-month').value;
        const label    = container.querySelector('#cl-period-label');

        const filterByMonth = (arr, dateKey) => {
            if (!monthVal) return arr;
            return arr.filter(item => {
                const d = window.parseDBDate(item[dateKey]);
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;
                return key === monthVal;
            });
        };

        if (monthVal) {
            const [y, mo] = monthVal.split('-');
            label.textContent = `📅 ${monthNames[parseInt(mo)]} ${y}`;
        } else {
            label.textContent = 'Exibindo todos os meses';
        }

        renderOrders(filterByMonth(allOrders, 'created_at'));
        renderMovements(filterByMonth(allMovements, 'created_at'));
    };

    // ── Load data ─────────────────────────────────────────────────────────────
    const loadAll = async () => {
        if (!clientId) {
            container.querySelector('#cl-orders-list').innerHTML =
                `<div style="padding:3rem; text-align:center; color:#ef4444;">⚠️ Conta não vinculada a um cliente. Contate o administrador.</div>`;
            return;
        }

        try {
            // Fetch everything in parallel
            const [clientsRes, movRes, ordersRes] = await Promise.all([
                fetch('/api/clients').catch(e => ({ error: e })),
                fetch(`/api/clients/${clientId}/credit-movements`).catch(e => ({ error: e })),
                fetch(`/api/orders?client_id=${clientId}`).catch(e => ({ error: e }))
            ]);

            // Robust JSON parsing
            const safeJson = async (res) => {
                if (res && res.ok) return await res.json();
                return { data: [] };
            };

            const [clientsData, movData, ordersData] = await Promise.all([
                safeJson(clientsRes),
                safeJson(movRes),
                safeJson(ordersRes)
            ]);

            // Client info — balance & billing date
            // Use loose comparison == because clientId from localStorage might be string
            const clientsList = Array.isArray(clientsData.data) ? clientsData.data : [];
            const myClient = clientsList.find(c => c.id == clientId);
            
            if (myClient) {
                // Tier rendering
                const tier = myClient.loyalty_tier || 'bronze';
                const iconEl = container.querySelector('#cl-tier-icon');
                const titleEl = container.querySelector('#cl-tier-title');
                const descEl = container.querySelector('#cl-tier-desc');
                
                if (tier === 'ouro') {
                    iconEl.innerHTML = '🏆';
                    iconEl.style.background = 'linear-gradient(135deg, #f59e0b, #b45309)';
                    iconEl.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                    titleEl.innerHTML = 'Conta Fidelidade: VIP Ouro';
                    titleEl.style.background = 'linear-gradient(135deg, #f59e0b, #b45309)';
                    descEl.innerHTML = 'Você possui <b>15% de desconto</b> em tudo e <b>Prioridade Máxima</b>.';
                } else if (tier === 'prata') {
                    iconEl.innerHTML = '🥈';
                    iconEl.style.background = 'linear-gradient(135deg, #94a3b8, #64748b)';
                    iconEl.style.boxShadow = '0 6px 20px rgba(148, 163, 184, 0.4)';
                    titleEl.innerHTML = 'Conta Fidelidade: Prata';
                    titleEl.style.background = 'linear-gradient(135deg, #64748b, #475569)';
                    descEl.innerHTML = 'Você possui <b>10% de desconto</b> em tudo e <b>1 Dia de Prazo</b>.';
                } else {
                    iconEl.innerHTML = '🥉';
                    iconEl.style.background = 'linear-gradient(135deg, #fff7ed, #fde68a)';
                    iconEl.style.boxShadow = 'none';
                    iconEl.style.border = '1px solid #fcd34d';
                    titleEl.innerHTML = 'Conta Fidelidade: Bronze';
                    titleEl.style.background = 'linear-gradient(135deg, #b45309, #92400e)';
                    descEl.innerHTML = 'Você possui <b>5% de desconto</b> em todos os serviços.';
                }

                // Level Up Animation Trigger
                if (myClient.loyalty_tier_notified === 0) {
                    const modal = container.querySelector('#levelup-modal');
                    const msg = container.querySelector('#levelup-message');
                    const icon = container.querySelector('#levelup-icon');
                    
                    if (tier === 'ouro') {
                        icon.innerHTML = '🏆';
                        msg.innerHTML = 'Você alcançou o <b>VIP OURO</b>!<br><br>Agora você ganha <b>15% de desconto fixo</b> e <b>Prioridade Máxima</b> em qualquer pedido!';
                    } else if (tier === 'prata') {
                        icon.innerHTML = '🥈';
                        msg.innerHTML = 'Você alcançou o nível <b>PRATA</b>!<br><br>Agora você ganha <b>10% de desconto fixo</b> e prazo reduzido para <b>1 Dia</b>!';
                    }
                    
                    modal.style.display = 'flex';
                    
                    // Simple confetti
                    const cCont = container.querySelector('#confetti-container');
                    const colors = ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#a855f7'];
                    for (let i = 0; i < 50; i++) {
                        const c = document.createElement('div');
                        c.style.position = 'absolute';
                        c.style.width = '10px';
                        c.style.height = '10px';
                        c.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                        c.style.left = Math.random() * 100 + '%';
                        c.style.top = '-10px';
                        c.style.opacity = Math.random();
                        c.style.transform = `rotate(${Math.random() * 360}deg)`;
                        c.style.transition = 'all ' + (Math.random() * 2 + 1) + 's cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                        cCont.appendChild(c);
                        
                        setTimeout(() => {
                            c.style.top = '110%';
                            c.style.transform = `rotate(${Math.random() * 720}deg)`;
                        }, 50);
                    }

                    // Acknowledge endpoint
                    container.querySelector('#btn-ack-levelup').onclick = async () => {
                        modal.style.display = 'none';
                        try {
                            await fetch(`/api/clients/${clientId}/ack-tier`, { method: 'POST' });
                        } catch(e) { console.error('Failed to ack tier', e); }
                    };
                }

                const bal = parseFloat(myClient.credit_balance || 0);
                const balEl = container.querySelector('#cl-balance');
                if (balEl) {
                    balEl.textContent = `R$ ${fmt(bal)}`;
                    balEl.style.color = bal < 0 ? '#dc2626' : bal > 0 ? '#10b981' : '#b45309';
                }

                if (myClient.billing_date) {
                    const billCard = container.querySelector('#cl-billing-card');
                    const billDate = container.querySelector('#cl-billing-date');
                    if (billCard && billDate) {
                        billCard.style.display = 'flex';
                        billDate.textContent = `Dia ${myClient.billing_date}`;
                    }
                }
            }

            // Filter orders for this client (Fidelidade payment)
            const rawOrders = Array.isArray(ordersData.data) ? ordersData.data : (Array.isArray(ordersData) ? ordersData : []);
            allOrders = rawOrders.filter(o => o.client_id == clientId);

            allMovements = Array.isArray(movData.data) ? movData.data : [];

            // Populate month filter from both datasets
            const monthSet = new Set();
            [...allOrders, ...allMovements].forEach(item => {
                if (!item.created_at) return;
                const d = window.parseDBDate(item.created_at);
                if (isNaN(d.getTime())) return;
                const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`;
                monthSet.add(key);
            });

            const monthSelect = container.querySelector('#cl-filter-month');
            if (monthSelect) {
                const now = new Date();
                const currentKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2,'0')}`;

                monthSelect.innerHTML = '<option value="">Todos os meses</option>' +
                    [...monthSet].sort((a, b) => b.localeCompare(a)).map(key => {
                        const [y, m] = key.split('-');
                        const monthIdx = parseInt(m);
                        return `<option value="${key}" ${key === currentKey ? 'selected' : ''}>${monthNames[monthIdx] || m} ${y}</option>`;
                    }).join('');
            }

            applyFilter();

        } catch (err) {
            console.error('Erro ao carregar portal fidelidade:', err);
            const listEl = container.querySelector('#cl-orders-list');
            if (listEl) {
                listEl.innerHTML = `<div style="padding:2rem; text-align:center; color:#ef4444;">Erro ao carregar dados. Tente recarregar a página.</div>`;
            }
        }
    };

    container.querySelector('#cl-filter-month').onchange = applyFilter;

    loadAll();
    return container;
};
