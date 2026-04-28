export const render = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const container = document.createElement('div');

    container.innerHTML = `
        <!-- Header -->
        <div style="margin-bottom:2rem;">
            <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap;">
                <div style="width:52px; height:52px; background:linear-gradient(135deg,#b45309,#f59e0b); border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:1.6rem; box-shadow:0 6px 20px rgba(180,83,9,0.35); flex-shrink:0;">⭐</div>
                <div style="flex:1;">
                    <h2 style="font-size:1.75rem; font-weight:900; background:linear-gradient(135deg,#92400e,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0; letter-spacing:-0.03em;">Minha Pontuação</h2>
                    <p style="color:#64748b; margin:0; font-size:0.9rem; font-weight:500;">Acumule pontos e troque por benefícios exclusivos.</p>
                </div>
            </div>
        </div>

        <!-- Points Card -->
        <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:2rem;">
            <div style="flex:1; min-width:200px; background:linear-gradient(135deg,#b45309,#f59e0b); border-radius:20px; padding:2rem; color:white; box-shadow:0 8px 32px rgba(180,83,9,0.35); text-align:center;">
                <div style="font-size:3.5rem; font-weight:900; letter-spacing:-0.04em; line-height:1;">0</div>
                <div style="font-size:1rem; font-weight:700; opacity:0.85; margin-top:0.25rem;">pontos acumulados</div>
                <div style="font-size:0.8rem; opacity:0.65; margin-top:0.5rem;">Olá, ${user.name}!</div>
            </div>
            <div style="flex:2; min-width:260px; background:white; border-radius:20px; padding:2rem; border:1px solid #e2e8f0; box-shadow:0 4px 20px rgba(0,0,0,0.04); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; text-align:center;">
                <div style="font-size:3rem;">🚧</div>
                <h3 style="margin:0; font-size:1.2rem; font-weight:800; color:#b45309;">Sistema em desenvolvimento</h3>
                <p style="margin:0; color:#64748b; font-size:0.9rem; max-width:350px;">
                    Em breve você poderá acumular pontos a cada compra realizada via Conta Fidelidade e trocar por descontos e benefícios exclusivos.
                </p>
            </div>
        </div>

        <!-- How it works -->
        <div style="background:white; border-radius:20px; border:1px solid #fcd34d; padding:2rem; box-shadow:0 4px 20px rgba(180,83,9,0.08);">
            <h3 style="margin:0 0 1.5rem 0; font-size:1.1rem; font-weight:800; color:#92400e;">📋 Como vai funcionar</h3>
            <div style="display:flex; flex-direction:column; gap:1rem;">
                <div style="display:flex; align-items:flex-start; gap:1rem; padding:1rem; background:#fffbeb; border-radius:12px; border:1px solid #fef08a;">
                    <div style="width:36px; height:36px; background:linear-gradient(135deg,#b45309,#f59e0b); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; font-size:1rem; flex-shrink:0;">1</div>
                    <div>
                        <div style="font-weight:700; color:#1e293b; margin-bottom:0.2rem;">Compre via Conta Fidelidade</div>
                        <div style="font-size:0.85rem; color:#64748b;">Cada compra realizada pelo Kanban com pagamento Fidelidade gera pontos automaticamente.</div>
                    </div>
                </div>
                <div style="display:flex; align-items:flex-start; gap:1rem; padding:1rem; background:#fffbeb; border-radius:12px; border:1px solid #fef08a;">
                    <div style="width:36px; height:36px; background:linear-gradient(135deg,#b45309,#f59e0b); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; font-size:1rem; flex-shrink:0;">2</div>
                    <div>
                        <div style="font-weight:700; color:#1e293b; margin-bottom:0.2rem;">Acumule pontos</div>
                        <div style="font-size:0.85rem; color:#64748b;">Acompanhe seu saldo de pontos aqui em tempo real, separado por mês.</div>
                    </div>
                </div>
                <div style="display:flex; align-items:flex-start; gap:1rem; padding:1rem; background:#fffbeb; border-radius:12px; border:1px solid #fef08a;">
                    <div style="width:36px; height:36px; background:linear-gradient(135deg,#b45309,#f59e0b); border-radius:10px; display:flex; align-items:center; justify-content:center; color:white; font-weight:900; font-size:1rem; flex-shrink:0;">3</div>
                    <div>
                        <div style="font-weight:700; color:#1e293b; margin-bottom:0.2rem;">Troque por benefícios</div>
                        <div style="font-size:0.85rem; color:#64748b;">Use seus pontos para obter descontos, brindes e condições especiais exclusivas para clientes fidelidade.</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return container;
};
