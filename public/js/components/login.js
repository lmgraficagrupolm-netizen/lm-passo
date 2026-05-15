export const render = (onLogin) => {
    const container = document.createElement('div');
    container.className = 'login-container';

    const style = document.createElement('style');
    style.innerHTML = `
        /* ===== FULL SCREEN DESKTOP LAYOUT ===== */
        .lm-bg {
            width: 100vw;
            height: 100vh;
            background: #2e1065;
            position: relative;
            overflow: hidden;
            display: flex;
        }

        /* ===== MARQUEE — FILLS ENTIRE 1920x1080 ===== */
        .lm-marquee-wrap {
            position: absolute;
            inset: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            justify-content: space-around;
            pointer-events: none;
            z-index: 0;
        }
        .lm-marquee-row {
            display: flex;
            white-space: nowrap;
            flex-shrink: 0;
            animation: lm-scroll 45s linear infinite;
        }
        .lm-marquee-row:nth-child(even) {
            animation-direction: reverse;
            animation-duration: 55s;
        }
        .lm-marquee-row:nth-child(3n) {
            animation-duration: 50s;
        }
        .lm-marquee-item {
            font-size: 0.82rem;
            font-weight: 700;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: rgba(196, 181, 253, 0.07);
            padding: 0 2.2rem;
            user-select: none;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }
        .lm-marquee-logo {
            width: 12px; height: 12px;
            object-fit: contain;
            opacity: 0.07;
            filter: brightness(0) invert(1);
            flex-shrink: 0;
        }
        @keyframes lm-scroll {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
        }

        /* ===== SPLIT DESKTOP LAYOUT ===== */
        .lm-layout {
            display: flex;
            width: 100%;
            height: 100vh;
            position: relative;
            z-index: 10;
        }

        /* Left: Branding panel — transparent over purple bg */
        .lm-brand-panel {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1.8rem;
            padding: 5rem;
        }
        .lm-logo-img {
            width: 110px; height: 110px;
            object-fit: contain;
            filter: brightness(0) invert(1);
            animation: lm-glitch 6s steps(1) infinite;
        }
        @keyframes lm-glitch {
            0%  { filter: brightness(0) invert(1); transform: translate(0); }
            2%  { filter: brightness(0) invert(1) drop-shadow(-2px 0 #a78bfa) drop-shadow(2px 0 #c4b5fd); transform: translate(-2px, 1px); }
            4%  { filter: brightness(0) invert(1); transform: translate(2px, -1px); }
            6%  { filter: brightness(0) invert(1); transform: translate(0); }
            8%  { filter: brightness(0) invert(1); transform: translate(0); opacity: 0.8; }
            9%  { filter: brightness(0) invert(1); transform: translate(0); opacity: 1; }
            94% { filter: brightness(0) invert(1); transform: translate(0); }
            96% { filter: brightness(0) invert(1) drop-shadow(-3px 0 #8b5cf6); transform: translate(-3px, 0); opacity: 0.7; }
            98% { filter: brightness(0) invert(1); transform: translate(0); opacity: 1; }
            100%{ filter: brightness(0) invert(1); transform: translate(0); }
        }
        .lm-brand-name {
            font-size: 3.5rem;
            font-weight: 900;
            letter-spacing: 0.08em;
            color: #fff;
            text-shadow: 0 0 40px rgba(167,139,250,0.4);
            line-height: 1;
        }
        .lm-brand-sub {
            font-size: 0.9rem;
            font-weight: 600;
            letter-spacing: 0.22em;
            text-transform: uppercase;
            color: rgba(196,181,253,0.6);
            text-align: center;
        }
        .lm-brand-divider {
            width: 60px;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent);
            border-radius: 2px;
        }

        /* Right: Form panel — DARKER than background */
        .lm-form-panel {
            width: 520px;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(5, 2, 15, 0.65);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-left: 1px solid rgba(139,92,246,0.15);
            padding: 4rem 3.5rem;
        }
        .lm-form-inner {
            width: 100%;
        }
        .lm-form-title {
            font-size: 1.6rem;
            font-weight: 800;
            color: #fff;
            margin-bottom: 0.4rem;
        }
        .lm-form-desc {
            font-size: 0.85rem;
            color: rgba(196,181,253,0.5);
            margin-bottom: 2.5rem;
            letter-spacing: 0.02em;
        }

        /* Inputs */
        .lm-field { margin-bottom: 1.3rem; }
        .lm-field label {
            display: block;
            font-size: 0.75rem;
            font-weight: 700;
            color: rgba(196,181,253,0.6);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 0.5rem;
        }
        .lm-input-wrap { position: relative; }
        .lm-input-icon {
            position: absolute;
            left: 1rem;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(139,92,246,0.5);
            font-size: 1rem;
            pointer-events: none;
        }
        .lm-input {
            width: 100%;
            padding: 0.95rem 1rem 0.95rem 2.8rem;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(139,92,246,0.2);
            border-radius: 12px;
            color: #e9d5ff;
            font-size: 0.95rem;
            font-family: 'Inter', sans-serif;
            transition: all 0.25s ease;
            outline: none;
        }
        .lm-input::placeholder { color: rgba(196,181,253,0.25); }
        .lm-input:focus {
            background: rgba(139,92,246,0.08);
            border-color: rgba(139,92,246,0.5);
            box-shadow: 0 0 0 3px rgba(124,58,237,0.12);
            color: #fff;
        }

        /* Error */
        .lm-error {
            display: none;
            align-items: center;
            gap: 0.5rem;
            background: rgba(239,68,68,0.08);
            border: 1px solid rgba(239,68,68,0.25);
            border-radius: 10px;
            padding: 0.7rem 1rem;
            margin-bottom: 1.2rem;
            color: #fca5a5;
            font-size: 0.85rem;
            font-weight: 500;
        }
        .lm-error.visible {
            display: flex;
            animation: lm-shake 0.4s ease;
        }
        @keyframes lm-shake {
            0%,100% { transform: translateX(0); }
            20%      { transform: translateX(-6px); }
            40%      { transform: translateX(6px); }
            60%      { transform: translateX(-4px); }
            80%      { transform: translateX(4px); }
        }

        /* Button */
        .lm-btn {
            width: 100%;
            padding: 1rem;
            border: none;
            border-radius: 12px;
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            color: white;
            font-size: 1rem;
            font-weight: 700;
            font-family: 'Inter', sans-serif;
            letter-spacing: 0.04em;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            box-shadow: 0 6px 24px rgba(124,58,237,0.35);
            transition: all 0.25s ease;
            margin-top: 0.5rem;
        }
        .lm-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(124,58,237,0.5);
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }
        .lm-btn:active:not(:disabled) { transform: translateY(0); }
        .lm-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .lm-btn::after {
            content: '';
            position: absolute;
            top: 0; left: -100%;
            width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
            transform: skewX(-20deg);
            transition: left 0s;
        }
        .lm-btn:hover::after {
            left: 160%;
            transition: left 0.6s ease;
        }
        .lm-btn.success {
            background: linear-gradient(135deg, #059669, #047857);
            box-shadow: 0 6px 24px rgba(5,150,105,0.4);
        }
    `;
    document.head.appendChild(style);

    const ITEM = '<span class="lm-marquee-item"><img src="/logo.png?v=3" class="lm-marquee-logo" alt="">LM | GR\u00c1FICA</span>';
    const ROW  = `<div class="lm-marquee-row">${ITEM.repeat(30)}</div>`;

    container.innerHTML = `
        <div class="lm-bg">
            <!-- Marquee across full 1920x1080 -->
            <div class="lm-marquee-wrap">
                ${ROW.repeat(18)}
            </div>

            <!-- Desktop split layout -->
            <div class="lm-layout">

                <!-- LEFT: Branding -->
                <div class="lm-brand-panel">
                    <img src="/logo.png?v=3" alt="LM Logo" class="lm-logo-img">
                    <div class="lm-brand-name">LM | PASSO</div>
                    <div class="lm-brand-divider"></div>
                    <div class="lm-brand-sub">Sistema de Gestão LM | Gráfica</div>
                </div>

                <!-- RIGHT: Dark form panel -->
                <div class="lm-form-panel">
                    <div class="lm-form-inner">
                        <div class="lm-form-title">Bem-vindo</div>
                        <div class="lm-form-desc">Faça login para continuar</div>

                        <form id="lm-login-form">
                            <div class="lm-field">
                                <label>Usuário</label>
                                <div class="lm-input-wrap">
                                    <ion-icon name="person-outline" class="lm-input-icon"></ion-icon>
                                    <input type="text" id="lm-username" class="lm-input" placeholder="Digite seu usuário" autocomplete="username" required>
                                </div>
                            </div>
                            <div class="lm-field">
                                <label>Senha</label>
                                <div class="lm-input-wrap">
                                    <ion-icon name="lock-closed-outline" class="lm-input-icon"></ion-icon>
                                    <input type="password" id="lm-password" class="lm-input" placeholder="Digite sua senha" autocomplete="current-password" required>
                                </div>
                            </div>
                            <div id="lm-error" class="lm-error">
                                <ion-icon name="alert-circle"></ion-icon>
                                <span id="lm-error-text">Usuário ou senha incorretos</span>
                            </div>
                            <button type="submit" id="lm-submit" class="lm-btn">Entrar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `;

    const form      = container.querySelector('#lm-login-form');
    const btn       = container.querySelector('#lm-submit');
    const errorBox  = container.querySelector('#lm-error');
    const errorText = container.querySelector('#lm-error-text');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = container.querySelector('#lm-username').value.trim();
        const password = container.querySelector('#lm-password').value;

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
