export const render = () => {
    const container = document.createElement('div');

    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" style="vertical-align:middle; margin-right:0.4rem;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Demanda de Produtos
            </div>
        </div>

        <div style="max-width:900px;">

            <!-- Tab Selector -->
            <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem;">
                <button class="demand-page-tab active" data-tab="monthly"
                    style="padding:0.55rem 1.4rem; border-radius:8px; border:2px solid var(--primary); background:var(--primary); color:white; font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s;">
                    📅 Mensal
                </button>
                <button class="demand-page-tab" data-tab="quarterly"
                    style="padding:0.55rem 1.4rem; border-radius:8px; border:2px solid var(--primary); background:transparent; color:var(--primary); font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s;">
                    📆 Trimestral
                </button>
            </div>

            <!-- Content -->
            <div id="demand-page-content">
                <div style="text-align:center; padding:3rem; color:#94a3b8;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="opacity:0.4; margin-bottom:0.75rem; display:block; margin-left:auto; margin-right:auto;"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Carregando dados…
                </div>
            </div>
        </div>
    `;

    let demandData = null;
    let activeTab = 'monthly';

    const renderContent = (data, tab) => {
        const el = container.querySelector('#demand-page-content');
        if (!el) return;

        const section = data[tab];
        if (!section || (section.top.length === 0 && section.bottom.length === 0)) {
            el.innerHTML = `<div style="text-align:center; padding:3rem; color:#94a3b8; font-size:0.95rem;">Nenhum dado encontrado para este período.</div>`;
            return;
        }

        const buildCard = (title, items, colorClass, emoji) => {
            if (!items || items.length === 0) return '';
            const maxQty = items[0].total_qty || 1;
            const rows = items.map((item, i) => {
                const pct = Math.round((item.total_qty / maxQty) * 100);
                const isTop = colorClass === 'top';
                const barColor = isTop
                    ? `linear-gradient(90deg, #7c3aed, #a78bfa)`
                    : `linear-gradient(90deg, #dc2626, #f87171)`;
                return `
                <div style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0; border-bottom:1px solid #f1f5f9;">
                    <span style="font-size:0.8rem; font-weight:700; color:#94a3b8; min-width:18px; text-align:right;">#${i+1}</span>
                    <span style="flex:1; font-size:0.88rem; font-weight:600; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${item.product_name}">${item.product_name}</span>
                    <div style="flex:1.5; height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                        <div class="page-demand-bar" style="height:100%; width:0%; background:${barColor}; border-radius:999px; transition:width 0.7s cubic-bezier(0.4,0,0.2,1);" data-pct="${pct}"></div>
                    </div>
                    <span style="font-size:0.85rem; font-weight:700; color:${isTop ? '#7c3aed' : '#dc2626'}; min-width:28px; text-align:right;">${item.total_qty}</span>
                </div>`;
            }).join('');

            return `
            <div style="background:white; border-radius:12px; border:1px solid #e2e8f0; padding:1.25rem 1.5rem; margin-bottom:1.25rem; box-shadow:0 1px 4px rgba(0,0,0,0.05);">
                <div style="font-size:0.78rem; font-weight:800; text-transform:uppercase; letter-spacing:0.07em; color:${isTop ? '#7c3aed' : '#dc2626'}; margin-bottom:0.75rem;">
                    ${emoji} ${title}
                </div>
                ${rows}
            </div>`;
        };

        el.innerHTML = buildCard('Mais Solicitados', section.top, 'top', '▲') +
                       buildCard('Menos Solicitados', section.bottom, 'bottom', '▼');

        // Animate bars
        requestAnimationFrame(() => {
            el.querySelectorAll('.page-demand-bar').forEach(bar => {
                bar.style.width = bar.dataset.pct + '%';
            });
        });
    };

    const load = async () => {
        try {
            const res = await fetch('/api/reports/product-demand');
            demandData = await res.json();
            renderContent(demandData, activeTab);
        } catch (e) {
            const el = container.querySelector('#demand-page-content');
            if (el) el.innerHTML = `<div style="text-align:center; padding:2rem; color:#ef4444;">Erro ao carregar dados de demanda.</div>`;
        }
    };

    // Tab events
    container.querySelectorAll('.demand-page-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            container.querySelectorAll('.demand-page-tab').forEach(b => {
                b.style.background = 'transparent';
                b.style.color = 'var(--primary)';
                b.classList.remove('active');
            });
            btn.style.background = 'var(--primary)';
            btn.style.color = 'white';
            btn.classList.add('active');
            activeTab = btn.dataset.tab;
            if (demandData) renderContent(demandData, activeTab);
        });
    });

    load();
    return container;
};
