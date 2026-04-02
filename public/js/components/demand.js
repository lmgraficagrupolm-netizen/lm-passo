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
            <div style="display:flex; gap:0.75rem; margin-bottom:1.5rem;">
                <button class="demand-page-tab active" data-tab="monthly"
                    style="padding:0.55rem 1.4rem; border-radius:8px; border:2px solid var(--primary); background:var(--primary); color:white; font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s;">
                    Mensal
                </button>
                <button class="demand-page-tab" data-tab="quarterly"
                    style="padding:0.55rem 1.4rem; border-radius:8px; border:2px solid var(--primary); background:transparent; color:var(--primary); font-weight:700; font-size:0.9rem; cursor:pointer; transition:all 0.2s;">
                    Trimestral
                </button>
            </div>
            <div id="demand-page-content">
                <div style="text-align:center; padding:3rem; color:#94a3b8; font-size:0.95rem;">Carregando dados...</div>
            </div>
        </div>
    `;

    let demandData = null;
    let activeTab = 'monthly';

    const buildCard = (title, items, isTop) => {
        if (!items || items.length === 0) return '';
        const maxQty = items[0].total_qty || 1;
        const accent = isTop ? '#7c3aed' : '#dc2626';
        const barGrad = isTop
            ? 'linear-gradient(90deg, #7c3aed, #a78bfa)'
            : 'linear-gradient(90deg, #dc2626, #f87171)';
        const prefix = isTop ? '\u25b2 Mais Vendidos' : '\u25bc Menos Vendidos';

        const rows = items.map((item, i) => {
            const pct = Math.round((item.total_qty / maxQty) * 100);
            const name = String(item.product_name || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `
            <div style="display:flex; align-items:center; gap:0.75rem; padding:0.65rem 0; border-bottom:1px solid #f1f5f9;">
                <span style="font-size:0.78rem; font-weight:800; color:#94a3b8; min-width:22px; text-align:right;">#${i + 1}</span>
                <span style="flex:1.2; font-size:0.88rem; font-weight:600; color:#334155; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${name}">${name}</span>
                <div style="flex:2; height:10px; background:#e2e8f0; border-radius:999px; overflow:hidden;">
                    <div class="pdbar" style="height:100%; width:0%; background:${barGrad}; border-radius:999px; transition:width 0.7s cubic-bezier(0.4,0,0.2,1);" data-pct="${pct}"></div>
                </div>
                <span style="font-size:0.85rem; font-weight:800; color:${accent}; min-width:32px; text-align:right;">${item.total_qty}</span>
            </div>`;
        }).join('');

        return `
        <div style="background:white; border-radius:14px; border:1px solid #e2e8f0; padding:1.4rem 1.6rem; margin-bottom:1.5rem; box-shadow:0 2px 8px rgba(0,0,0,0.06);">
            <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:${accent}; margin-bottom:1rem;">${prefix}</div>
            ${rows}
        </div>`;
    };

    const renderContent = (data, tab) => {
        const el = container.querySelector('#demand-page-content');
        if (!el) return;

        const section = data ? data[tab] : null;
        const hasData = section && (section.top.length > 0 || section.bottom.length > 0);

        if (!hasData) {
            el.innerHTML = `<div style="text-align:center; padding:3rem; color:#94a3b8; font-size:0.95rem;">Nenhum dado encontrado para este periodo.</div>`;
            return;
        }

        el.innerHTML = buildCard('Mais Vendidos', section.top, true) +
                       buildCard('Menos Vendidos', section.bottom, false);

        requestAnimationFrame(() => {
            el.querySelectorAll('.pdbar').forEach(bar => {
                bar.style.width = bar.dataset.pct + '%';
            });
        });
    };

    const load = async () => {
        try {
            const res = await fetch('/api/reports/product-demand');
            if (!res.ok) throw new Error('HTTP ' + res.status);
            demandData = await res.json();
            renderContent(demandData, activeTab);
        } catch (e) {
            const el = container.querySelector('#demand-page-content');
            if (el) el.innerHTML = `<div style="text-align:center; padding:2rem; color:#ef4444;">Erro ao carregar: ${e.message}</div>`;
        }
    };

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
