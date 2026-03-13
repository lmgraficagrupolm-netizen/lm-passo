export const render = () => {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">Configurações (Admin)</div>
        </div>

        <div style="max-width:600px">
            <h3 style="margin-bottom:1rem; color:#334155">👥 Gerenciar Senhas dos Usuários</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Usuário</th>
                        <th>Nome</th>
                        <th>Cargo</th>
                        <th>Ação</th>
                    </tr>
                </thead>
                <tbody id="users-list">
                    <tr><td colspan="4">Carregando...</td></tr>
                </tbody>
            </table>
        </div>

        <!-- Change Password Modal -->
        <div class="modal-overlay" id="pw-modal">
            <div class="modal" style="max-width:400px">
                <div class="modal-header">
                    <h3>Trocar Senha</h3>
                    <button class="modal-close" id="pw-close">&times;</button>
                </div>
                <form id="pw-form">
                    <input type="hidden" id="pw-user-id">
                    <p style="margin-bottom:1rem" id="pw-user-label"></p>
                    <div class="form-group">
                        <label>Nova Senha</label>
                        <input type="password" id="pw-new" required minlength="4" placeholder="Mínimo 4 caracteres">
                    </div>
                    <div class="form-group">
                        <label>Confirmar Nova Senha</label>
                        <input type="password" id="pw-confirm" required minlength="4" placeholder="Repita a senha">
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Salvar Nova Senha</button>
                </form>
            </div>
        </div>
    `;

    const modal = container.querySelector('#pw-modal');

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/auth/users');
            const { data } = await res.json();
            const tbody = container.querySelector('#users-list');

            const roleLabels = {
                master: '🔑 Master',
                financeiro: '💰 Financeiro',
                producao: '🏭 Produção',
                interno: '📋 Interno',
                vendedor: '🛒 Vendedor'
            };

            tbody.innerHTML = data.map(u => `
                <tr>
                    <td><b>${u.username}</b></td>
                    <td>${u.name}</td>
                    <td>${roleLabels[u.role] || u.role}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm change-pw-btn" data-id="${u.id}" data-name="${u.name}" data-username="${u.username}" style="padding:4px 10px; font-size:0.8rem;">
                            🔒 Trocar Senha
                        </button>
                    </td>
                </tr>
            `).join('');

            tbody.querySelectorAll('.change-pw-btn').forEach(btn => {
                btn.onclick = () => {
                    container.querySelector('#pw-user-id').value = btn.dataset.id;
                    container.querySelector('#pw-user-label').innerHTML = `Usuário: <b>${btn.dataset.name}</b> (${btn.dataset.username})`;
                    container.querySelector('#pw-new').value = '';
                    container.querySelector('#pw-confirm').value = '';
                    modal.classList.add('open');
                };
            });
        } catch (e) {
            console.error(e);
        }
    };

    container.querySelector('#pw-close').onclick = () => modal.classList.remove('open');

    container.querySelector('#pw-form').onsubmit = async (e) => {
        e.preventDefault();
        const newPw = container.querySelector('#pw-new').value;
        const confirmPw = container.querySelector('#pw-confirm').value;

        if (newPw !== confirmPw) {
            alert('As senhas não coincidem!');
            return;
        }

        const userId = container.querySelector('#pw-user-id').value;

        try {
            const res = await fetch(`/api/auth/users/${userId}/password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_password: newPw })
            });

            const json = await res.json();
            if (res.ok) {
                alert('✅ Senha alterada com sucesso!');
                modal.classList.remove('open');
            } else {
                alert('Erro: ' + (json.error || 'Falha ao alterar senha'));
            }
        } catch (err) {
            alert('Erro de conexão: ' + err.message);
        }
    };

    loadUsers();
    return container;
};
