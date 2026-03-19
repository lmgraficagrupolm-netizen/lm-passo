export const render = () => {
    const container = document.createElement('div');
    container.innerHTML = `
        <div class="view-header">
            <div class="view-title">Clientes</div>
            <button class="btn btn-primary" style="width: auto;" id="btn-new-client">Novo Cliente</button>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Origem</th>
                    <th>Desconto</th>
                    <th>Acesso</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody id="clients-list">
                <tr><td colspan="6">Carregando...</td></tr>
            </tbody>
        </table>

        <!-- Modal -->
        <div class="modal-overlay" id="client-modal">
            <div class="modal">
                <div class="modal-header">
                    <h3 id="client-modal-title">Novo Cliente</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <form id="client-form">
                    <input type="hidden" name="id" id="client-id">
                    <div class="form-group">
                        <label>Nome</label>
                        <input type="text" name="name" id="client-name" required>
                    </div>
                    <div class="form-group">
                        <label>Telefone</label>
                        <input type="text" name="phone" id="client-phone" placeholder="(XX) XXXXX-XXXX" required>
                    </div>
                    <div class="form-group">
                        <label>Origem</label>
                        <select name="origin" id="client-origin">
                            <option value="Site">Site</option>
                            <option value="Whatsapp">Whatsapp</option>
                            <option value="Balcão">Balcão</option>
                            <option value="Indicação">Indicação</option>
                            <option value="CORE">CORE</option>
                        </select>
                    </div>
                    <div class="form-group" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; background:#f5f3ff; border-radius:8px; border:1px solid #e0d4f5;">
                        <input type="checkbox" id="client-discount" name="core_discount" style="width:18px; height:18px; cursor:pointer;">
                        <label for="client-discount" style="margin:0; cursor:pointer; font-weight:600; color:#7c3aed;">🏷️ Desconto CORE 15%</label>
                    </div>
                    <div class="form-group" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; background:#eff6ff; border-radius:8px; border:1px solid #bfdbfe;">
                        <input type="checkbox" id="client-extended-toggle" style="width:18px; height:18px; cursor:pointer;">
                        <label for="client-extended-toggle" style="margin:0; cursor:pointer; font-weight:600; color:#1d4ed8;">📋 Dados Completos (CPF, Endereço, etc.)</label>
                    </div>
                    <div id="client-extended-fields" style="display:none; border:1px solid #e0e7ff; border-radius:8px; padding:0.75rem; background:#f8faff; margin-top:0.25rem;">
                        <div class="form-group" style="margin-bottom:0.5rem">
                            <label style="font-size:0.85rem; font-weight:600; color:#374151;">CPF / CNPJ</label>
                            <input type="text" name="cpf" id="client-cpf" placeholder="000.000.000-00" style="width:100%; padding:0.4rem 0.5rem; border:1px solid #d1d5db; border-radius:6px;">
                        </div>
                        <div class="form-group" style="margin-bottom:0.5rem">
                            <label style="font-size:0.85rem; font-weight:600; color:#374151;">Endereço</label>
                            <input type="text" name="address" id="client-address" placeholder="Rua, número, complemento" style="width:100%; padding:0.4rem 0.5rem; border:1px solid #d1d5db; border-radius:6px;">
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <div class="form-group" style="flex:2; margin-bottom:0.5rem">
                                <label style="font-size:0.85rem; font-weight:600; color:#374151;">Cidade</label>
                                <input type="text" name="city" id="client-city" placeholder="Cidade" style="width:100%; padding:0.4rem 0.5rem; border:1px solid #d1d5db; border-radius:6px;">
                            </div>
                            <div class="form-group" style="flex:1; margin-bottom:0.5rem">
                                <label style="font-size:0.85rem; font-weight:600; color:#374151;">Estado</label>
                                <input type="text" name="state" id="client-state" placeholder="UF" maxlength="2" style="width:100%; padding:0.4rem 0.5rem; border:1px solid #d1d5db; border-radius:6px; text-transform:uppercase;">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label style="font-size:0.85rem; font-weight:600; color:#374151;">CEP</label>
                            <input type="text" name="zip_code" id="client-zip" placeholder="00000-000" style="width:100%; padding:0.4rem 0.5rem; border:1px solid #d1d5db; border-radius:6px;">
                        </div>
                    </div>

                    <!-- Financial Access Toggle (edit only) -->
                    <div id="access-section" style="display:none; margin-top:0.25rem;">
                        <div class="form-group" style="display:flex; align-items:center; gap:0.75rem; padding:0.6rem 0.75rem; background:#f0fdf4; border-radius:8px; border:1px solid #86efac;">
                            <input type="checkbox" id="client-access-toggle" style="width:18px; height:18px; cursor:pointer;">
                            <label for="client-access-toggle" style="margin:0; cursor:pointer; font-weight:600; color:#065f46;">🔐 Acesso Financeiro (Portal do Cliente)</label>
                        </div>
                        <div id="access-info" style="display:none; margin-top:0.5rem; padding:0.75rem; background:#f0fdf4; border-radius:8px; border:1px solid #86efac;">
                            <div style="font-size:0.85rem; color:#065f46; font-weight:600; margin-bottom:0.5rem;">✅ Acesso ativo</div>
                            <div style="font-size:0.85rem; color:#374151;">Usuário: <b id="access-username-display">-</b></div>
                        </div>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem">
                        <button type="button" class="btn" id="btn-delete-client" style="background:#fee2e2; color:#b91c1c; border:1px solid #fca5a5; display:none;">🗑️ Excluir Cliente</button>
                        <div style="display:flex; gap:0.5rem; margin-left:auto">
                            <button type="button" class="btn btn-secondary modal-close-btn">Cancelar</button>
                            <button type="submit" class="btn btn-primary">Salvar</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- Credentials Modal -->
        <div class="modal-overlay" id="credentials-modal">
            <div class="modal" style="max-width:450px">
                <div class="modal-header">
                    <h3>🔐 Acesso do Cliente Criado!</h3>
                    <button class="modal-close" id="cred-close">&times;</button>
                </div>
                <div style="padding:0.5rem 0;">
                    <p style="font-size:0.9rem; color:#475569; margin-bottom:1rem;">Anote as credenciais abaixo. A senha não poderá ser visualizada novamente.</p>
                    <div style="background:#f0fdf4; border:2px solid #86efac; border-radius:10px; padding:1rem; margin-bottom:1rem;">
                        <div style="margin-bottom:0.75rem;">
                            <div style="font-size:0.8rem; color:#6b7280; margin-bottom:2px;">👤 Login</div>
                            <div style="font-size:1.1rem; font-weight:700; color:#065f46; font-family:monospace; background:white; padding:0.4rem 0.6rem; border-radius:6px; border:1px solid #d1fae5;" id="cred-username">-</div>
                        </div>
                        <div style="margin-bottom:0.75rem;">
                            <div style="font-size:0.8rem; color:#6b7280; margin-bottom:2px;">🔑 Senha</div>
                            <div style="font-size:1.1rem; font-weight:700; color:#065f46; font-family:monospace; background:white; padding:0.4rem 0.6rem; border-radius:6px; border:1px solid #d1fae5;" id="cred-password">-</div>
                        </div>
                        <div>
                            <div style="font-size:0.8rem; color:#6b7280; margin-bottom:2px;">🔗 Link de Acesso</div>
                            <div style="font-size:0.95rem; font-weight:600; color:#1d4ed8; font-family:monospace; background:white; padding:0.4rem 0.6rem; border-radius:6px; border:1px solid #dbeafe; word-break:break-all;" id="cred-link">-</div>
                        </div>
                    </div>
                    <button class="btn btn-primary" id="btn-copy-creds" style="width:100%;">📋 Copiar Dados</button>
                </div>
            </div>
        </div>
    `;

    let currentEditClient = null;

    const loadClients = async () => {
        try {
            const res = await fetch('/api/clients');
            const { data } = await res.json();
            const tbody = container.querySelector('#clients-list');
            tbody.innerHTML = data.map(c => `
                <tr>
                    <td><b>${c.name}</b></td>
                    <td>${c.phone || '-'}</td>
                    <td>${c.origin || '-'}</td>
                    <td>${c.core_discount ? '<span style="background:#d1fae5; color:#065f46; padding:2px 8px; border-radius:12px; font-size:0.8rem; font-weight:600;">15% OFF</span>' : '-'}</td>
                    <td>${c.has_access
                        ? '<span style="background:#d1fae5; color:#065f46; padding:2px 8px; border-radius:12px; font-size:0.8rem; font-weight:600;">🔐 Ativo</span>'
                        : '<span style="color:#94a3b8; font-size:0.85rem;">—</span>'
                    }</td>
                    <td>
                        <button class="btn btn-secondary btn-sm edit-btn" data-json='${JSON.stringify(c).replace(/'/g, "&#39;")}'>Editar</button>
                    </td>
                </tr>
            `).join('');

            tbody.querySelectorAll('.edit-btn').forEach(btn => {
                btn.onclick = () => openEditModal(JSON.parse(btn.dataset.json));
            });
        } catch (e) {
            console.error(e);
        }
    };

    const modal = container.querySelector('#client-modal');
    const form = container.querySelector('#client-form');
    const deleteBtn = container.querySelector('#btn-delete-client');
    const credModal = container.querySelector('#credentials-modal');

    // Extended fields toggle
    const extendedToggle = container.querySelector('#client-extended-toggle');
    const extendedFields = container.querySelector('#client-extended-fields');
    extendedToggle.onchange = () => {
        extendedFields.style.display = extendedToggle.checked ? 'block' : 'none';
    };

    // ── CEP auto-fill via ViaCEP ──────────────────────────────────────────
    const zipInput     = container.querySelector('#client-zip');
    const addressInput = container.querySelector('#client-address');
    const cityInput    = container.querySelector('#client-city');
    const stateInput   = container.querySelector('#client-state');

    const fetchCep = async (cep) => {
        const digits = cep.replace(/\D/g, '');
        if (digits.length !== 8) return;

        zipInput.style.borderColor = '#f59e0b';
        zipInput.title = 'Buscando...';

        try {
            const res  = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
            const data = await res.json();

            if (data.erro) {
                zipInput.style.borderColor = '#dc2626';
                zipInput.title = 'CEP não encontrado';
                return;
            }

            // Auto-open extended fields if not already open
            if (!extendedToggle.checked) {
                extendedToggle.checked = true;
                extendedFields.style.display = 'block';
            }

            // Fill fields — preserve number/complement if address already typed
            const currentAddr = addressInput.value.trim();
            addressInput.value = data.logradouro
                ? (currentAddr && !currentAddr.startsWith(data.logradouro) ? data.logradouro : data.logradouro)
                : currentAddr;

            // Bairro goes into address as suffix if logradouro exists, else standalone
            if (data.bairro && !addressInput.value.includes(data.bairro)) {
                addressInput.value = addressInput.value
                    ? `${addressInput.value}, ${data.bairro}`
                    : data.bairro;
            }

            cityInput.value  = data.localidade || '';
            stateInput.value = data.uf || '';

            zipInput.style.borderColor = '#22c55e';
            zipInput.title = `${data.localidade} - ${data.uf}`;
        } catch {
            zipInput.style.borderColor = '#dc2626';
            zipInput.title = 'Erro ao buscar CEP';
        }
    };

    zipInput.addEventListener('blur', () => fetchCep(zipInput.value));
    zipInput.addEventListener('input', () => {
        const digits = zipInput.value.replace(/\D/g, '');
        // Auto-format: 00000-000
        if (digits.length <= 8) {
            zipInput.value = digits.length > 5
                ? digits.slice(0,5) + '-' + digits.slice(5)
                : digits;
        }
        if (digits.length === 8) fetchCep(digits);
    });


    // Access toggle handler
    const accessToggle = container.querySelector('#client-access-toggle');
    accessToggle.onchange = async () => {
        if (!currentEditClient) return;

        if (accessToggle.checked) {
            // Enable access
            try {
                const res = await fetch(`/api/clients/${currentEditClient.id}/toggle-access`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enable: true })
                });
                const json = await res.json();
                if (res.ok) {
                    // Show credentials modal
                    container.querySelector('#cred-username').textContent = json.username;
                    container.querySelector('#cred-password').textContent = json.password;
                    container.querySelector('#cred-link').textContent = json.link;
                    credModal.classList.add('open');

                    // Update access info
                    container.querySelector('#access-info').style.display = 'block';
                    container.querySelector('#access-username-display').textContent = json.username;
                    currentEditClient.has_access = true;
                    currentEditClient.access_username = json.username;
                } else {
                    alert('Erro: ' + (json.error || 'Falha ao criar acesso'));
                    accessToggle.checked = false;
                }
            } catch (e) {
                alert('Erro de conexão: ' + e.message);
                accessToggle.checked = false;
            }
        } else {
            // Disable access
            if (!confirm('Tem certeza que deseja remover o acesso financeiro deste cliente?')) {
                accessToggle.checked = true;
                return;
            }
            try {
                const res = await fetch(`/api/clients/${currentEditClient.id}/toggle-access`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ enable: false })
                });
                if (res.ok) {
                    container.querySelector('#access-info').style.display = 'none';
                    currentEditClient.has_access = false;
                    currentEditClient.access_username = null;
                } else {
                    accessToggle.checked = true;
                }
            } catch (e) {
                accessToggle.checked = true;
            }
        }
    };

    // Copy credentials button
    container.querySelector('#btn-copy-creds').onclick = () => {
        const username = container.querySelector('#cred-username').textContent;
        const password = container.querySelector('#cred-password').textContent;
        const link = container.querySelector('#cred-link').textContent;
        const text = `Login: ${username}\nSenha: ${password}\nLink: ${link}`;
        navigator.clipboard.writeText(text).then(() => {
            container.querySelector('#btn-copy-creds').textContent = '✅ Copiado!';
            setTimeout(() => {
                container.querySelector('#btn-copy-creds').textContent = '📋 Copiar Dados';
            }, 2000);
        });
    };

    container.querySelector('#cred-close').onclick = () => credModal.classList.remove('open');

    const openNewModal = () => {
        form.reset();
        currentEditClient = null;
        container.querySelector('#client-id').value = '';
        container.querySelector('#client-discount').checked = false;
        extendedToggle.checked = false;
        extendedFields.style.display = 'none';
        container.querySelector('#access-section').style.display = 'none';
        container.querySelector('#client-modal-title').textContent = 'Novo Cliente';
        deleteBtn.style.display = 'none';
        modal.classList.add('open');
    };

    const openEditModal = (client) => {
        currentEditClient = client;
        container.querySelector('#client-id').value = client.id;
        container.querySelector('#client-name').value = client.name;
        container.querySelector('#client-phone').value = client.phone || '';
        container.querySelector('#client-origin').value = client.origin || 'Balcão';
        container.querySelector('#client-discount').checked = client.core_discount ? true : false;
        // Extended fields
        const hasExtended = !!(client.cpf || client.address || client.city || client.state || client.zip_code);
        extendedToggle.checked = hasExtended;
        extendedFields.style.display = hasExtended ? 'block' : 'none';
        container.querySelector('#client-cpf').value = client.cpf || '';
        container.querySelector('#client-address').value = client.address || '';
        container.querySelector('#client-city').value = client.city || '';
        container.querySelector('#client-state').value = client.state || '';
        container.querySelector('#client-zip').value = client.zip_code || '';

        // Access section (only for edit)
        const accessSection = container.querySelector('#access-section');
        accessSection.style.display = 'block';
        accessToggle.checked = client.has_access ? true : false;
        const accessInfo = container.querySelector('#access-info');
        if (client.has_access) {
            accessInfo.style.display = 'block';
            container.querySelector('#access-username-display').textContent = client.access_username || '-';
        } else {
            accessInfo.style.display = 'none';
        }

        container.querySelector('#client-modal-title').textContent = 'Editar Cliente';
        deleteBtn.style.display = 'inline-block';
        deleteBtn.dataset.id = client.id;
        modal.classList.add('open');
    };

    const closeModal = () => modal.classList.remove('open');

    container.querySelector('#btn-new-client').onclick = openNewModal;
    container.querySelector('.modal-close').onclick = closeModal;
    container.querySelector('.modal-close-btn').onclick = closeModal;

    // Delete client
    deleteBtn.onclick = async () => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
        await fetch(`/api/clients/${deleteBtn.dataset.id}`, { method: 'DELETE' });
        closeModal();
        loadClients();
    };

    // Save (create or update)
    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const body = Object.fromEntries(formData);
        body.core_discount = container.querySelector('#client-discount').checked ? 1 : 0;
        const id = body.id;

        const url = id
            ? `/api/clients/${id}`
            : '/api/clients';
        const method = id ? 'PUT' : 'POST';

        if (!id) delete body.id;

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        closeModal();
        loadClients();
    };

    loadClients();
    return container;
};
