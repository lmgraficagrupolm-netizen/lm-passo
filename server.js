const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const db = require('./server/database/db');
const fs = require('fs');

// Error Logging Function
const logError = (err) => {
    const errorLogPath = path.join(process.cwd(), 'error_log.txt');
    const errorMessage = `[${new Date().toISOString()}] ERROR: ${err.message}\nSTACK: ${err.stack}\n\n`;
    fs.appendFileSync(errorLogPath, errorMessage);
};

// Global Error Handlers
process.on('uncaughtException', (err) => {
    logError(err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logError(new Error(`Unhandled Rejection: ${reason}`));
});

// Ensure DB directory exists (for Railway persistent volume at /data)
if (process.env.DB_PATH) {
    try {
        const dbDir = path.dirname(process.env.DB_PATH);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
    } catch (err) { logError(err); }
}

// Ensure uploads directory exists in the real filesystem
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
try {
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }
} catch (err) {
    logError(err);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(compression()); // gzip all responses
app.use(cors());
app.use(express.json());
// Force no-cache for JS and CSS so browser always fetches fresh versions after deploy
app.use((req, res, next) => {
    if (req.path.endsWith('.js') || req.path.endsWith('.css')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
    next();
});
// Serve internal assets — prefer disk (allows live updates), fall back to embedded snapshot
const diskPublic = path.join(process.cwd(), 'public');
if (fs.existsSync(diskPublic)) {
    app.use(express.static(diskPublic, { acceptRanges: false }));  // ← uses real files from disk
} else {
    app.use(express.static(path.join(__dirname, 'public'), { acceptRanges: false })); // ← fallback: embedded
}
// Serve uploads with explicit headers — bypass compression and set correct cache headers
// Also forces correct Content-Type for lesser-known image formats like .jfif
app.use('/uploads', (req, res, next) => {
    const ext = path.extname(req.path).toLowerCase();
    // .jfif is a JPEG variant — must be served as image/jpeg or some browsers refuse it
    if (ext === '.jfif' || ext === '.jpe') {
        res.setHeader('Content-Type', 'image/jpeg');
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Accept-Ranges', 'none');
    next();
}, express.static(path.join(process.cwd(), 'public', 'uploads'), { acceptRanges: false, etag: false }));

// Health check (Railway / Render)
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes
const authRoutes = require('./server/routes/auth.routes');
const apiRoutes = require('./server/routes/api.routes');

app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Public Catalogue Item Route
app.get('/c/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM catalogue_items WHERE id = ?', [id], (err, row) => {
        if (err || !row) return res.status(404).send('<!DOCTYPE html><html><head><title>Não Encontrado</title></head><body style="font-family:sans-serif;text-align:center;padding:50px;"><h2>Produto não encontrado ou removido.</h2></body></html>');
        
        let images = [];
        try {
            images = JSON.parse(row.image_url);
            if (!Array.isArray(images)) images = [row.image_url];
        } catch(e) {
            images = [row.image_url];
        }
        
        const firstImage = images[0] || '';
        const title = row.title || 'Catálogo - LM Passo';
        const desc = row.description || '';
        
        // Build absolute URL for WhatsApp minified preview compatibility
        const protocol = req.protocol === 'http' && req.get('host').includes('railway') ? 'https' : req.protocol;
        const hostUrl = protocol + '://' + req.get('host');
        const imageUrl = firstImage.startsWith('http') ? firstImage : hostUrl + firstImage;
        const safeDescHTML = desc.replace(/\n/g, '<br>');

        // Build image wrappers with zoom data attribute
        const imgWrappersHtml = images.map(img => {
            const absImg = img.startsWith('http') ? img : hostUrl + img;
            return `
            <div class="zoom-wrapper" data-src="${absImg}">
                <img src="${img}" alt="${title.replace(/"/g, '&quot;')}" class="gallery-img">
                <div class="zoom-lens"></div>
            </div>`;
        }).join('');

        const html = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} | Catálogo LM Passo</title>
            
            <!-- Open Graph / WhatsApp / Facebook -->
            <meta property="og:title" content="${title.replace(/"/g, '&quot;')}">
            <meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">
            <meta property="og:image" content="${imageUrl}">
            <meta property="og:type" content="product">
            <meta property="og:url" content="${hostUrl}/c/${id}">
            
            <!-- Twitter Card -->
            <meta name="twitter:card" content="summary_large_image">
            <meta name="twitter:image" content="${imageUrl}">
            
            <style>
                * { box-sizing: border-box; }
                body {
                    margin: 0; padding: 0;
                    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
                    background-color: #f1f5f9;
                    display: flex; flex-direction: column; align-items: center;
                    min-height: 100vh;
                    color: #1e293b;
                }
                .container {
                    background: #fff;
                    width: 100%;
                    max-width: 500px;
                    border-radius: 0 0 16px 16px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.08);
                    overflow: hidden;
                    margin-bottom: 2rem;
                }

                /* ── Gallery ── */
                .gallery {
                    display: flex;
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    background: #0f172a;
                    scrollbar-width: none;
                }
                .gallery::-webkit-scrollbar { display: none; }

                /* ── Zoom Wrapper ── */
                .zoom-wrapper {
                    position: relative;
                    flex: 0 0 100%;
                    scroll-snap-align: center;
                    overflow: hidden;
                    cursor: crosshair;
                    user-select: none;
                }
                .gallery-img {
                    width: 100%;
                    display: block;
                    object-fit: contain;
                    max-height: 420px;
                    background: #0f172a;
                    transition: opacity 0.15s;
                    pointer-events: none;
                }

                /* ── Magnifier Lens ── */
                .zoom-lens {
                    display: none;
                    position: absolute;
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    border: 3px solid rgba(124, 58, 237, 0.85);
                    box-shadow: 0 0 0 3px rgba(255,255,255,0.6), 0 8px 32px rgba(0,0,0,0.45);
                    background-repeat: no-repeat;
                    pointer-events: none;
                    transform: translate(-50%, -50%);
                    z-index: 10;
                    /* Subtle glass shimmer */
                    background-color: #000;
                }
                .zoom-wrapper:hover .zoom-lens,
                .zoom-wrapper.touching .zoom-lens {
                    display: block;
                }

                /* ── Dot indicator (scroll hint) ── */
                .dots {
                    display: flex;
                    justify-content: center;
                    gap: 6px;
                    padding: 0.6rem 0 0.3rem;
                    background: #0f172a;
                }
                .dot {
                    width: 7px; height: 7px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.3);
                    cursor: pointer;
                    transition: background 0.2s, transform 0.2s;
                }
                .dot.active { background: #a78bfa; transform: scale(1.3); }

                /* ── Info ── */
                .info { padding: 1.5rem; }
                h1 { margin: 0 0 0.75rem 0; font-size: 1.35rem; font-weight: 800; color: #0f172a; }
                .description { margin: 0 0 1.5rem 0; font-size: 0.95rem; line-height: 1.7; color: #475569; }
                .btn {
                    display: block; width: 100%; padding: 1rem;
                    background: linear-gradient(135deg, #7c3aed, #6d28d9);
                    color: #fff; text-align: center; text-decoration: none;
                    font-weight: 700; font-size: 1.05rem;
                    border-radius: 10px; transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 15px rgba(124, 58, 237, 0.35);
                }
                .btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(124, 58, 237, 0.5); }
                .header {
                    padding: 0.9rem 1rem; text-align: center; background: #fff;
                    width: 100%; border-bottom: 1px solid #e2e8f0;
                    font-weight: 800; color: #4c1d95; letter-spacing: 2px; font-size: 1rem;
                }
                .zoom-hint {
                    text-align: center;
                    font-size: 0.72rem;
                    color: rgba(255,255,255,0.4);
                    padding: 0.2rem 0 0.5rem;
                    background: #0f172a;
                    letter-spacing: 0.04em;
                }
            </style>
        </head>
        <body>
            <div class="header">LM | PASSO</div>
            <div class="container">
                <div class="gallery" id="gallery">
                    ${imgWrappersHtml}
                </div>
                ${images.length > 1 ? `
                <div class="dots" id="dots">
                    ${images.map((_, i) => `<div class="dot${i === 0 ? ' active' : ''}" data-idx="${i}"></div>`).join('')}
                </div>` : ''}
                <div class="zoom-hint">🔍 Passe o mouse sobre a imagem para ampliar</div>
                <div class="info">
                    <h1>${title}</h1>
                    <div class="description">${safeDescHTML}</div>
                    <a href="https://wa.me/?text=Olá, tenho interesse neste produto: *${title}*%0A%0AVeja aqui: ${hostUrl}/c/${id}" class="btn" target="_blank">💬 Tenho Interesse</a>
                </div>
            </div>
            <p style="text-align:center; color:#94a3b8; font-size:0.8rem; margin-top:-0.5rem; padding-bottom:2rem;">&copy; LM Passo - Gestão de Pedidos</p>

            <script>
            (function() {
                const ZOOM = 2.5; // magnification factor
                const LENS_R = 80; // lens radius in px (half of 160px)

                document.querySelectorAll('.zoom-wrapper').forEach(function(wrapper) {
                    var img = wrapper.querySelector('.gallery-img');
                    var lens = wrapper.querySelector('.zoom-lens');
                    var srcUrl = wrapper.dataset.src;

                    function applyZoom(x, y) {
                        var rect = wrapper.getBoundingClientRect();
                        var imgRect = img.getBoundingClientRect();

                        // Mouse position relative to the image
                        var relX = x - imgRect.left;
                        var relY = y - imgRect.top;

                        // Clamp to image bounds
                        relX = Math.max(0, Math.min(relX, imgRect.width));
                        relY = Math.max(0, Math.min(relY, imgRect.height));

                        // Position lens (centered on cursor, relative to wrapper)
                        var lensX = x - rect.left;
                        var lensY = y - rect.top;
                        lens.style.left = lensX + 'px';
                        lens.style.top  = lensY + 'px';

                        // Background: zoomed image centered on cursor
                        var bgW = imgRect.width  * ZOOM;
                        var bgH = imgRect.height * ZOOM;

                        var bgX = (relX * ZOOM) - LENS_R;
                        var bgY = (relY * ZOOM) - LENS_R;

                        // Offset if image doesn't start at wrapper top (object-fit:contain padding)
                        var imgOffsetX = imgRect.left - rect.left;
                        var imgOffsetY = imgRect.top  - rect.top;

                        bgX -= imgOffsetX * ZOOM;
                        bgY -= imgOffsetY * ZOOM;

                        lens.style.backgroundImage  = 'url("' + srcUrl + '")';
                        lens.style.backgroundSize   = bgW + 'px ' + bgH + 'px';
                        lens.style.backgroundPosition = '-' + bgX + 'px -' + bgY + 'px';
                    }

                    // ── Desktop mouse events ──
                    wrapper.addEventListener('mousemove', function(e) {
                        applyZoom(e.clientX, e.clientY);
                    });
                    wrapper.addEventListener('mouseleave', function() {
                        lens.style.display = 'none';
                    });
                    wrapper.addEventListener('mouseenter', function() {
                        lens.style.display = 'block';
                    });

                    // ── Mobile touch events ──
                    wrapper.addEventListener('touchmove', function(e) {
                        e.preventDefault();
                        var t = e.touches[0];
                        wrapper.classList.add('touching');
                        lens.style.display = 'block';
                        applyZoom(t.clientX, t.clientY);
                    }, { passive: false });
                    wrapper.addEventListener('touchend', function() {
                        wrapper.classList.remove('touching');
                        lens.style.display = 'none';
                    });
                });

                // ── Gallery scroll → dot indicator ──
                var gallery = document.getElementById('gallery');
                var dots = document.querySelectorAll('.dot');
                if (gallery && dots.length) {
                    gallery.addEventListener('scroll', function() {
                        var idx = Math.round(gallery.scrollLeft / gallery.offsetWidth);
                        dots.forEach(function(d, i) {
                            d.classList.toggle('active', i === idx);
                        });
                    });
                    dots.forEach(function(dot) {
                        dot.addEventListener('click', function() {
                            var idx = parseInt(dot.dataset.idx);
                            gallery.scrollTo({ left: idx * gallery.offsetWidth, behavior: 'smooth' });
                        });
                    });
                }
            })();
            </script>
        </body>
        </html>
        `;
        res.send(html);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const os = require('os');
app.listen(PORT, '0.0.0.0', () => {
    const nets = os.networkInterfaces();
    let localIp = 'localhost';
    for (const iface of Object.values(nets)) {
        for (const alias of iface) {
            if (alias.family === 'IPv4' && !alias.internal) {
                localIp = alias.address;
                break;
            }
        }
    }
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Acesso em rede:  http://${localIp}:${PORT}`);
});
