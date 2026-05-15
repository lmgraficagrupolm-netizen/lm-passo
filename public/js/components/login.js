export const render = (onLogin) => {
    const container = document.createElement('div');
    container.className = 'login-container';

    // Inject premium login CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .lm-login-bg {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #0d0a1a;
            position: relative;
            overflow: hidden;
        }

        /* Animated orbs */
        .lm-orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            opacity: 0.5;
            pointer-events: none;
            animation: lm-orb-float 8s ease-in-out infinite;
        }
        .lm-orb-1 {
            width: 500px; height: 500px;
            background: radial-gradient(circle, #7c3aed, transparent 70%);
            top: -10%; left: -10%;
            animation-delay: 0s;
        }
        .lm-orb-2 {
            width: 400px; height: 400px;
            background: radial-gradient(circle, #4c1d95, transparent 70%);
            bottom: -10%; right: -5%;
            animation-delay: -4s;
        }
        .lm-orb-3 {
            width: 250px; height: 250px;
            background: radial-gradient(circle, #8b5cf6, transparent 70%);
            top: 50%; left: 60%;
            animation-delay: -2s;
            opacity: 0.3;
        }
        @keyframes lm-orb-float {
            0%, 100% { transform: translateY(0px) scale(1); }
            50%       { transform: translateY(-30px) scale(1.05); }
        }

        /* Grid overlay */
        .lm-grid {
            position: absolute;
            inset: 0;
            background-image:
                linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
        }

        /* Card */
        .lm-login-card {
            position: relative;
            z-index: 10;
            width: 100%;
            max-width: 420px;
            margin: 1rem;
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(139,92,246,0.25);
            border-radius: 28px;
            padding: 2.8rem 2.4rem;
            box-shadow:
                0 0 0 1px rgba(255,255,255,0.04) inset,
                0 32px 64px -12px rgba(0,0,0,0.6),
                0 0 80px rgba(124,58,237,0.15);
            animation: lm-card-in 0.6s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes lm-card-in {
            from { opacity:0; transform: translateY(30px) scale(0.97); }
            to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* Logo area */
        .lm-logo-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.2rem;
            margin-bottom: 2.4rem;
        }
        /* Outer ring that spins */
        .lm-logo-ring {
            width: 90px; height: 90px;
            border-radius: 50%;
            background: conic-gradient(from 0deg, #7c3aed, #a78bfa, #c4b5fd, #7c3aed);
            animation: lm-spin 4s linear infinite;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            box-shadow: 0 0 24px rgba(124,58,237,0.4);
        }
        @keyframes lm-spin {
            to { transform: rotate(360deg); }
        }
        /* Inner dark circle — counter-rotates to keep logo still */
        .lm-logo-circle {
            width: 78px; height: 78px;
            border-radius: 50%;
            background: #1a0e3a;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            animation: lm-spin-reverse 4s linear infinite;
        }
        @keyframes lm-spin-reverse {
            to { transform: rotate(-360deg); }
        }
        .lm-logo-img {
            width: 50px; height: 50px;
            object-fit: contain;
            display: block;
            flex-shrink: 0;
        }
        .lm-brand-name {
            font-size: 1.7rem;
            font-weight: 800;
            letter-spacing: 0.06em;
            background: linear-gradient(135deg, #e9d5ff, #c4b5fd, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .lm-brand-sub {
            font-size: 0.85rem;
            color: rgba(196,181,253,0.5);
            margin-top: -0.8rem;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            font-weight: 500;
        }

        /* Inputs */
        .lm-field {
            margin-bottom: 1.2rem;
        }
        .lm-field label {
            display: flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.8rem;
            font-weight: 700;
            color: rgba(196,181,253,0.7);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 0.5rem;
        }
        .lm-input-wrap {
            position: relative;
        }
        .lm-input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(139,92,246,0.6);
            font-size: 1.1rem;
            pointer-events: none;
        }
        .lm-input {
            width: 100%;
            padding: 0.95rem 1rem 0.95rem 2.8rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(139,92,246,0.2);
            border-radius: 14px;
            color: #e9d5ff;
            font-size: 1rem;
            font-family: 'Inter', sans-serif;
            transition: all 0.25s ease;
            outline: none;
        }
        .lm-input::placeholder { color: rgba(196,181,253,0.3); }
        .lm-input:focus {
            background: rgba(139,92,246,0.08);
            border-color: rgba(139,92,246,0.6);
            box-shadow: 0 0 0 4px rgba(124,58,237,0.15), 0 0 20px rgba(139,92,246,0.1);
            color: #fff;
        }

        /* Error */
        .lm-error {
            display: none;
            align-items: center;
            gap: 0.5rem;
            background: rgba(239,68,68,0.1);
            border: 1px solid rgba(239,68,68,0.3);
            border-radius: 10px;
            padding: 0.75rem 1rem;
            margin-bottom: 1.2rem;
            color: #fca5a5;
            font-size: 0.9rem;
            font-weight: 500;
            animation: lm-shake 0.4s ease;
        }
        .lm-error.visible { display: flex; }
        @keyframes lm-shake {
            0%,100% { transform: translateX(0); }
            20%     { transform: translateX(-8px); }
            40%     { transform: translateX(8px); }
            60%     { transform: translateX(-5px); }
            80%     { transform: translateX(5px); }
        }

        /* Button */
        .lm-btn {
            width: 100%;
            padding: 1rem;
            border: none;
            border-radius: 14px;
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            color: white;
            font-size: 1rem;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.04em;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            box-shadow: 0 6px 24px rgba(124,58,237,0.4);
            transition: all 0.25s ease;
            margin-top: 0.5rem;
        }
        .lm-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 12px 32px rgba(124,58,237,0.55);
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        .lm-btn:active:not(:disabled) {
            transform: translateY(0);
        }
        .lm-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        .lm-btn::after {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transform: skewX(-20deg);
            transition: left 0s;
        }
        .lm-btn:hover::after {
            left: 160%;
            transition: left 0.6s ease;
        }

        /* Success state */
        .lm-btn.success {
            background: linear-gradient(135deg, #059669, #047857);
            box-shadow: 0 6px 24px rgba(5,150,105,0.4);
        }
    `;
    document.head.appendChild(style);

    container.innerHTML = `
        <div class="lm-login-bg">
            <div class="lm-orb lm-orb-1"></div>
            <div class="lm-orb lm-orb-2"></div>
            <div class="lm-orb lm-orb-3"></div>
            <div class="lm-grid"></div>

            <div class="lm-login-card">
                <div class="lm-logo-wrap">
                    <div class="lm-logo-ring">
                        <div class="lm-logo-circle">
                            <img src="/logo.png?v=3" alt="LM Logo" class="lm-logo-img">
                        </div>
                    </div>
                    <div class="lm-brand-name">LM | PASSO</div>
                    <div class="lm-brand-sub">Sistema de Gestão</div>
                </div>

                <form id="lm-login-form">
                    <div class="lm-field">
                        <label>
                            <ion-icon name="person"></ion-icon> Usuário
                        </label>
                        <div class="lm-input-wrap">
                            <ion-icon name="person-outline" class="lm-input-icon"></ion-icon>
                            <input type="text" id="lm-username" class="lm-input" placeholder="Digite seu usuário" autocomplete="username" required>
                        </div>
                    </div>

                    <div class="lm-field">
                        <label>
                            <ion-icon name="lock-closed"></ion-icon> Senha
                        </label>
                        <div class="lm-input-wrap">
                            <ion-icon name="lock-closed-outline" class="lm-input-icon"></ion-icon>
                            <input type="password" id="lm-password" class="lm-input" placeholder="Digite sua senha" autocomplete="current-password" required>
                        </div>
                    </div>

                    <div id="lm-error" class="lm-error">
                        <ion-icon name="alert-circle"></ion-icon>
                        <span id="lm-error-text">Usuário ou senha incorretos</span>
                    </div>

                    <button type="submit" id="lm-submit" class="lm-btn">
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    `;

    const form = container.querySelector('#lm-login-form');
    const btn = container.querySelector('#lm-submit');
    const errorBox = container.querySelector('#lm-error');
    const errorText = container.querySelector('#lm-error-text');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = container.querySelector('#lm-username').value.trim();
        const password = container.querySelector('#lm-password').value;

        // Hide error, set loading state
        errorBox.classList.remove('visible');
        btn.disabled = true;
        btn.textContent = 'Entrando...';

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                btn.classList.add('success');
                btn.textContent = '✓ Acesso liberado!';
                setTimeout(() => onLogin(data), 600);
            } else {
                btn.disabled = false;
                btn.textContent = 'Entrar';
                errorText.textContent = data.error || 'Usuário ou senha incorretos';
                errorBox.classList.add('visible');
            }
        } catch (err) {
            btn.disabled = false;
            btn.textContent = 'Entrar';
            errorText.textContent = 'Erro de conexão com o servidor';
            errorBox.classList.add('visible');
        }
    });

    return container;
};
