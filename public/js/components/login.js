export const render = (onLogin) => {
    const container = document.createElement('div');
    container.className = 'login-container';
    container.innerHTML = `
        <div class="login-box">
            <div style="text-align:center; margin-bottom:1rem;">
                <img src="/logo.png?v=2" alt="Logo" style="width:100px; height:100px; object-fit:contain; border-radius:16px; background:#2e1065; padding:10px;">
            </div>
            <h2>LM | PASSO</h2>
            <form id="login-form">
                <div class="form-group">
                    <label>Usuário</label>
                    <input type="text" id="username" required>
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="password" required>
                </div>
                <div id="login-error" style="color: red; margin-bottom: 1rem; font-size: 0.9rem; display: none;"></div>
                <button type="submit" class="btn btn-primary">Entrar</button>
            </form>
        </div>
    `;

    container.querySelector('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = container.querySelector('#username').value;
        const password = container.querySelector('#password').value;
        const errorMsg = container.querySelector('#login-error');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                onLogin(data);
            } else {
                errorMsg.textContent = data.error || 'Erro ao entrar';
                errorMsg.style.display = 'block';
            }
        } catch (err) {
            errorMsg.textContent = 'Erro de conexão com o servidor';
            errorMsg.style.display = 'block';
        }
    });

    return container;
};
