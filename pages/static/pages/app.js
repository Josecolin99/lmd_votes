/* ===== API HELPERS ===== */
async function api(method, path, body = null) {
    const opts = {
        method,
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': CSRF_TOKEN },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    if (!res.ok) throw await res.json();
    if (res.status === 204) return null;
    return res.json();
}

const get  = (path)        => api('GET', path);
const post = (path, body)  => api('POST', path, body);
const put  = (path, body)  => api('PUT', path, body);
const del  = (path)        => api('DELETE', path);

/* ===== CONFIRM MODAL ===== */
function showConfirm({ icon = '⚠️', title = '¿Estás segura?', message = '', confirmText = 'Confirmar', danger = false }) {
    return new Promise((resolve) => {
        document.getElementById('modal-icon').textContent    = icon;
        document.getElementById('modal-title').textContent   = title;
        document.getElementById('modal-message').textContent = message;

        const confirmBtn = document.getElementById('modal-confirm');
        const cancelBtn  = document.getElementById('modal-cancel');
        confirmBtn.textContent = confirmText;
        confirmBtn.className   = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;

        const modal = document.getElementById('confirm-modal');
        modal.style.display = 'flex';
        requestAnimationFrame(() => modal.classList.add('show'));

        const ctrl = new AbortController();
        const sig  = ctrl.signal;

        function close(result) {
            ctrl.abort();
            modal.classList.remove('show');
            setTimeout(() => { modal.style.display = 'none'; }, 250);
            resolve(result);
        }

        confirmBtn.addEventListener('click', () => close(true),  { signal: sig });
        cancelBtn.addEventListener('click',  () => close(false), { signal: sig });
        modal.addEventListener('click', (e) => { if (e.target === modal) close(false); }, { signal: sig });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(false); }, { signal: sig });
    });
}

/* ===== TEMPORADAS LIST ===== */
async function loadTemporadas() {
    const grid = document.getElementById('temporada-grid');
    if (!grid) return;
    try {
        const temporadas = await get('/temporadas/');
        if (!temporadas.length) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <span class="empty-icon">🎭</span>
                    <p>No hay temporadas registradas aún.</p>
                </div>`;
            return;
        }
        grid.innerHTML = temporadas.map(t => `
            <a class="temporada-card" href="/temporadas/${t.id}/">
                ${t.image_url ? `<img src="${t.image_url}" alt="${t.name}" onerror="this.style.display='none'">` : '<div class="temporada-card-placeholder">🎭</div>'}
                <div class="temporada-card-body">
                    <div class="temporada-card-number">T${String(t.number).padStart(2,'0')}</div>
                    <div class="temporada-card-name">${t.name || 'Sin título'}</div>
                </div>
            </a>
        `).join('');
    } catch (e) {
        grid.innerHTML = '<div class="loading">Error al cargar temporadas.</div>';
    }
}

/* ===== TEMPORADA FORM ===== */
function initTemporadaForm() {
    const imgInput = document.getElementById('temporada-image');
    const preview  = document.getElementById('image-preview');

    if (imgInput) {
        imgInput.addEventListener('input', () => {
            const url = imgInput.value.trim();
            preview.innerHTML = url
                ? `<img src="${url}" alt="preview" onerror="this.style.display='none'">`
                : '';
        });
    }

    document.getElementById('temporada-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('form-error');
        errEl.textContent = '';
        try {
            await post('/temporadas/', {
                number:    parseInt(document.getElementById('temporada-number').value),
                name:      document.getElementById('temporada-name').value.trim(),
                image_url: (imgInput?.value || '').trim(),
            });
            window.location.href = '/temporadas/';
        } catch (err) {
            errEl.textContent = Object.values(err).flat().join(' ');
        }
    });
}

/* ===== TEMPORADA DETAIL ===== */
async function initTemporadaDetail(t_id) {
    const dragaGrid   = document.getElementById('temporada-draga-grid');
    const chapterList = document.getElementById('temporada-chapter-list');
    try {
        const [dragas, chapters, cals] = await Promise.all([
            get(`/dragas/?temporada=${t_id}`),
            get(`/chapters/?temporada=${t_id}`),
            get('/calificaciones/'),
        ]);

        // Dragas
        if (!dragas.length) {
            dragaGrid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><span class="empty-icon">💄</span><p>No hay dragas en esta temporada.</p></div>`;
        } else {
            dragaGrid.innerHTML = dragas.map(d => `
                <div class="draga-card">
                    <img src="${d.image_url}" alt="${d.name}" onerror="this.src='https://placehold.co/400x530/1e1e1e/888?text=Sin+imagen'">
                    <div class="draga-card-name">${d.name}</div>
                </div>
            `).join('');
        }

        // Chapters
        const countMap = {};
        cals.forEach(c => { countMap[c.chapter] = (countMap[c.chapter] || 0) + 1; });

        if (!chapters.length) {
            chapterList.innerHTML = `<div class="empty-state"><span class="empty-icon">🎬</span><p>No hay capítulos en esta temporada.</p></div>`;
        } else {
            chapterList.innerHTML = chapters.map(ch => `
                <a class="chapter-item" href="/temporadas/${t_id}/chapters/${ch.id}/">
                    <span class="chapter-number">${String(ch.number).padStart(2,'0')}</span>
                    <span class="chapter-name">${ch.name || 'Sin título'}</span>
                    <span class="chapter-count">${countMap[ch.id] || 0} cals.</span>
                </a>
            `).join('');
        }
    } catch (e) {
        console.error(e);
    }
}

/* ===== DRAGA FORM ===== */
function initDragaForm(t_id) {
    const imgInput = document.getElementById('draga-image');
    const preview  = document.getElementById('image-preview');

    imgInput.addEventListener('input', () => {
        const url = imgInput.value.trim();
        preview.innerHTML = url
            ? `<img src="${url}" alt="preview" onerror="this.style.display='none'">`
            : '';
    });

    document.getElementById('draga-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('form-error');
        errEl.textContent = '';
        try {
            await post('/dragas/', {
                temporada: t_id,
                name:      document.getElementById('draga-name').value.trim(),
                image_url: document.getElementById('draga-image').value.trim(),
            });
            window.location.href = `/temporadas/${t_id}/`;
        } catch (err) {
            errEl.textContent = Object.values(err).flat().join(' ');
        }
    });
}

/* ===== CHAPTER FORM ===== */
function initChapterForm(t_id) {
    document.getElementById('chapter-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl = document.getElementById('form-error');
        errEl.textContent = '';
        try {
            await post('/chapters/', {
                temporada: t_id,
                number:    parseInt(document.getElementById('chapter-number').value),
                name:      document.getElementById('chapter-name').value.trim(),
            });
            window.location.href = `/temporadas/${t_id}/`;
        } catch (err) {
            errEl.textContent = Object.values(err).flat().join(' ');
        }
    });
}

/* ===== CHAPTER DETAIL — RATING LOGIC ===== */
let chapterData       = null;
let dragasAll         = [];
let calsInChapter     = [];
let currentMax        = 100;
let isFirstRating     = true;
let selectedDragaId   = null;
let prevLeaderDragaId = null;
let currentScore      = 50;
let editingCalId      = null;

const ZONES = [
    { max: 0.20, emoji: '💀', label: 'Desastre',  color: '#888888' },
    { max: 0.40, emoji: '😬', label: 'Floja',     color: '#9B5DE5' },
    { max: 0.60, emoji: '😐', label: 'Regular',   color: '#00C6FF' },
    { max: 0.80, emoji: '🔥', label: 'Chingona',  color: '#FFD700' },
    { max: 1.01, emoji: '👑', label: 'ICÓNICA',   color: '#FF006E' },
];

function getZone(pct) {
    return ZONES.find(z => pct <= z.max) || ZONES[ZONES.length - 1];
}

async function initChapterDetail(chapterId, temporadaId) {
    try {
        [chapterData, dragasAll, calsInChapter] = await Promise.all([
            get(`/chapters/${chapterId}/`),
            get(`/dragas/?temporada=${temporadaId}`),
            get(`/calificaciones/?chapter=${chapterId}`),
        ]);
    } catch (e) {
        console.error(e);
        return;
    }

    document.getElementById('chapter-title').textContent = `Capítulo ${chapterData.number}`;
    document.getElementById('chapter-meta').textContent  = chapterData.name || '';

    updateProgress();
    renderRanking();
    renderDragaPicker();
    resetTouchBar();
    initTouchBar();
}

/* ------ Touch bar ------ */
function initTouchBar() {
    const bar = document.getElementById('touch-bar');
    if (!bar) return;
    let dragging = false;

    function scoreFromEvent(e) {
        const rect    = bar.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const pct     = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return Math.round(pct * currentMax);
    }

    bar.addEventListener('mousedown',  (e) => { dragging = true; setScore(scoreFromEvent(e)); });
    bar.addEventListener('touchstart', (e) => { dragging = true; setScore(scoreFromEvent(e)); e.preventDefault(); }, { passive: false });
    document.addEventListener('mousemove',  (e) => { if (dragging) setScore(scoreFromEvent(e)); });
    document.addEventListener('touchmove',  (e) => { if (dragging) { setScore(scoreFromEvent(e)); e.preventDefault(); } }, { passive: false });
    document.addEventListener('mouseup',   () => { dragging = false; });
    document.addEventListener('touchend',  () => { dragging = false; });
}

function setScore(value) {
    currentScore = Math.max(0, Math.min(currentMax, Math.round(value)));
    const pct    = currentMax > 0 ? currentScore / currentMax : 0;
    const zone   = getZone(pct);

    const fill  = document.getElementById('touch-bar-fill');
    const thumb = document.getElementById('touch-thumb');
    const emoji = document.getElementById('touch-thumb-emoji');

    if (fill) {
        fill.style.width      = (pct * 100) + '%';
        fill.style.background = `linear-gradient(90deg, #2a2a2a 0%, ${zone.color} 100%)`;
    }
    if (thumb) {
        thumb.style.left      = (pct * 100) + '%';
        thumb.style.background = zone.color;
        thumb.style.boxShadow  = `0 0 24px ${zone.color}CC, 0 0 48px ${zone.color}44`;
    }
    if (emoji) emoji.textContent = zone.emoji;

    const display = document.getElementById('score-display');
    const label   = document.getElementById('touch-score-label');
    if (display) {
        display.textContent      = currentScore;
        display.style.color      = zone.color;
        display.style.textShadow = `0 0 50px ${zone.color}88`;
    }
    if (label) {
        label.textContent  = zone.label;
        label.style.color  = zone.color;
    }

    updateCompetitiveZone(currentScore);
}

function updateCompetitiveZone(value) {
    const zone = document.getElementById('score-zone');
    if (!zone) return;
    zone.className = 'score-zone';

    if (isFirstRating) {
        zone.className += ' zone-first';
        zone.textContent = '⚠️ Esta será la referencia base';
        return;
    }

    const ref      = getReferenceScore();
    const topScore = [...calsInChapter].sort((a, b) => b.score - a.score)[0]?.score || 0;

    if (value > topScore) {
        zone.className += ' zone-leader';
        zone.textContent = '👑 ¡NUEVA LÍDER!';
    } else if (value >= ref) {
        zone.className += ' zone-above';
        zone.textContent = '🔥 Sobre la referencia';
    } else {
        zone.className += ' zone-below';
        zone.textContent = '😬 Bajo la referencia';
    }
}

function resetTouchBar() {
    const maxLabel = document.getElementById('range-max-label');
    const badge    = document.getElementById('first-badge');

    if (isFirstRating) {
        currentMax          = 100;
        if (badge) badge.style.display = 'block';
    } else {
        if (badge) badge.style.display = 'none';
    }

    if (maxLabel) maxLabel.textContent = currentMax.toFixed(0);
    setScore(Math.round(currentMax / 2));
}

function updateProgress() {
    const total = dragasAll.length;
    const rated = calsInChapter.length;
    const pct   = total ? Math.round((rated / total) * 100) : 0;
    document.getElementById('progress-fill').style.width  = pct + '%';
    document.getElementById('progress-label').textContent = `${rated} / ${total} dragas calificadas`;
}

function getReferenceScore() {
    if (!calsInChapter.length) return null;
    return [...calsInChapter].sort((a, b) => a.id - b.id)[0].score;
}

function renderRanking() {
    const list = document.getElementById('ranking-list');
    const info = document.getElementById('range-info');

    if (!calsInChapter.length) {
        list.innerHTML = `<div class="empty-state"><span class="empty-icon">🏆</span><p>Aún no hay calificaciones.</p></div>`;
        info.textContent = '';
        isFirstRating = true;
        prevLeaderDragaId = null;
        return;
    }

    isFirstRating = false;
    const sorted   = [...calsInChapter].sort((a, b) => b.score - a.score);
    const maxScore = sorted[0].score;
    currentMax     = 100 + maxScore;

    const newLeaderId = sorted[0].draga;
    if (prevLeaderDragaId !== null && prevLeaderDragaId !== newLeaderId) {
        showLeaderFlash(sorted[0].draga_detail?.name || '');
    }
    prevLeaderDragaId = newLeaderId;

    const refId  = [...calsInChapter].sort((a, b) => a.id - b.id)[0].id;
    const medals = ['🥇', '🥈', '🥉'];

    info.textContent = `Rango actual: 0 — ${currentMax.toFixed(0)}`;

    list.innerHTML = sorted.map((c, i) => {
        const pct    = Math.round((c.score / currentMax) * 100);
        const isRef  = c.id === refId;
        const isTop  = i === 0;
        const img    = c.draga_detail?.image_url || '';
        const nombre = (c.draga_detail?.name || '').replace(/'/g, "\\'");
        const medal  = medals[i] ? `<span class="ranking-medal">${medals[i]}</span>` : '';
        return `
        <div class="ranking-item ${isTop ? 'is-first' : ''} ${isRef ? 'is-reference' : ''} ${c._new ? 'new-entry' : ''}">
            ${medal}
            ${img ? `<img class="ranking-thumb" src="${img}" alt="${c.draga_detail?.name}" onerror="this.style.display='none'">` : ''}
            <div class="ranking-info">
                <div class="ranking-name-row">
                    <span class="ranking-pos">${isTop ? '👑' : '#' + (i + 1)}</span>
                    <span class="ranking-name">${c.draga_detail?.name || '—'}</span>
                    <span class="ranking-score">${c.score}</span>
                </div>
                <div class="ranking-bar-wrap">
                    <div class="ranking-bar" style="width:${pct}%"></div>
                </div>
            </div>
            <div class="ranking-actions">
                <button class="btn-ranking-action btn-edit"
                        onclick="editCalificacion(${c.id}, ${c.draga}, ${c.score}, '${img}', '${nombre}')">✎ Editar</button>
                <button class="btn-ranking-action btn-delete"
                        onclick="deleteCalificacion(${c.id})">✕ Borrar</button>
            </div>
        </div>`;
    }).join('');
}

function showLeaderFlash(name) {
    const el = document.getElementById('leader-flash');
    el.textContent = `¡NUEVA LÍDER: ${name.toUpperCase()}! 👑`;
    el.className = 'leader-flash';
    void el.offsetWidth;
    el.className = 'leader-flash show';
    setTimeout(() => { el.className = 'leader-flash'; }, 3200);
}

function launchConfetti() {
    const container = document.getElementById('confetti-container');
    const colors    = ['#FF006E', '#FFD700', '#9B5DE5', '#00F5FF', '#FF85C2', '#ffffff'];
    for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        const left  = 5 + (i / 80) * 90 + (Math.sin(i * 2.4) * 4);
        const delay = (i % 20) * 0.05;
        const dur   = 1.2 + (i % 8) * 0.15;
        const size  = 6 + (i % 5) * 2;
        piece.style.cssText = `left:${left}%;top:-20px;width:${size}px;height:${size * 1.4}px;background:${colors[i % colors.length]};animation-duration:${dur}s;animation-delay:${delay}s`;
        container.appendChild(piece);
        setTimeout(() => piece.remove(), (dur + delay) * 1000 + 300);
    }
}

function renderDragaPicker() {
    const picker    = document.getElementById('draga-picker');
    const ratedIds  = new Set(calsInChapter.map(c => c.draga));
    const available = dragasAll.filter(d => !ratedIds.has(d.id));

    const hint = document.getElementById('picker-hint');
    if (!available.length) {
        picker.innerHTML = `<div class="empty-state"><span class="empty-icon">✅</span><p>¡Todas las dragas calificadas! 🎉</p></div>`;
        if (hint) hint.style.display = 'none';
        return;
    }
    if (hint) hint.style.display = '';

    picker.innerHTML = available.map(d => `
        <div class="draga-picker-card" data-id="${d.id}" data-name="${d.name}" data-img="${d.image_url}" onclick="seleccionarDraga(this)">
            <img src="${d.image_url}" alt="${d.name}" onerror="this.src='https://placehold.co/160x210/1e1e1e/888?text=${encodeURIComponent(d.name)}'">
            <div class="draga-picker-name">${d.name}</div>
        </div>
    `).join('');
}

function seleccionarDraga(card) {
    document.querySelectorAll('.draga-picker-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedDragaId = parseInt(card.dataset.id);

    document.getElementById('selected-img').src           = card.dataset.img;
    document.getElementById('selected-name').textContent  = card.dataset.name;
    document.getElementById('picker-selected').style.display = 'flex';
    document.getElementById('slider-block').style.display    = 'block';

    setScore(currentScore);

    document.getElementById('slider-block').scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    const saveBtn = document.getElementById('save-btn');
    saveBtn.classList.remove('pulse');
    void saveBtn.offsetWidth;
    saveBtn.classList.add('pulse');
}

function deseleccionarDraga() {
    selectedDragaId = null;
    editingCalId    = null;
    document.querySelectorAll('.draga-picker-card').forEach(c => c.classList.remove('selected'));
    document.getElementById('picker-selected').style.display = 'none';
    document.getElementById('slider-block').style.display    = 'none';
    document.getElementById('rating-error').textContent      = '';
    document.getElementById('save-btn').textContent          = '¡CALIFICAR! ✨';
}

function editCalificacion(calId, dragaId, score, img, nombre) {
    editingCalId    = calId;
    selectedDragaId = dragaId;

    document.getElementById('selected-img').src           = img;
    document.getElementById('selected-name').textContent  = nombre;
    document.getElementById('picker-selected').style.display = 'flex';
    document.getElementById('slider-block').style.display    = 'block';

    setScore(score);

    document.getElementById('save-btn').textContent = '✏️ ACTUALIZAR';
    document.getElementById('slider-block').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

async function deleteCalificacion(calId) {
    const ok = await showConfirm({
        icon:        '🗑️',
        title:       '¿Borrar calificación?',
        message:     'La draga volverá al picker para que puedas recalificarla.',
        confirmText: 'Sí, borrar',
        danger:      true,
    });
    if (!ok) return;
    try {
        await del(`/calificaciones/${calId}/`);
        calsInChapter = await get(`/calificaciones/?chapter=${chapterData.id}`);
        renderRanking();
        renderDragaPicker();
        resetTouchBar();
        updateProgress();
    } catch (e) {
        console.error(e);
    }
}

function extendRange() {
    currentMax += 100;
    const maxLabel = document.getElementById('range-max-label');
    const info     = document.getElementById('range-info');
    if (maxLabel) maxLabel.textContent = currentMax.toFixed(0);
    if (info)     info.textContent     = `Rango actual: 0 — ${currentMax.toFixed(0)} 💫`;
    setScore(currentScore);

    if (calsInChapter.length) {
        const last = [...calsInChapter].sort((a, b) => b.id - a.id)[0];
        put(`/calificaciones/${last.id}/`, { ...last, extended: true }).catch(() => {});
    }
}

async function saveCalificacion() {
    const errEl = document.getElementById('rating-error');
    errEl.textContent = '';

    if (!selectedDragaId) {
        errEl.textContent = 'Selecciona una draga primero.';
        return;
    }

    const saveBtn = document.getElementById('save-btn');
    saveBtn.disabled    = true;
    saveBtn.textContent = 'Guardando...';

    try {
        const savedDragaId = selectedDragaId;

        if (editingCalId !== null) {
            await put(`/calificaciones/${editingCalId}/`, {
                draga:   selectedDragaId,
                chapter: chapterData.id,
                score:   currentScore,
            });
        } else {
            await post('/calificaciones/', {
                draga:   selectedDragaId,
                chapter: chapterData.id,
                score:   currentScore,
            });
        }

        calsInChapter = await get(`/calificaciones/?chapter=${chapterData.id}`);

        const newCal = calsInChapter.find(c => c.draga === savedDragaId);
        if (newCal) newCal._new = true;

        launchConfetti();

        selectedDragaId = null;
        document.getElementById('picker-selected').style.display = 'none';
        document.getElementById('slider-block').style.display    = 'none';

        renderRanking();
        renderDragaPicker();
        resetTouchBar();
        updateProgress();

        editingCalId = null;
        calsInChapter.forEach(c => delete c._new);

    } catch (err) {
        errEl.textContent = Object.values(err).flat().join(' ');
    } finally {
        saveBtn.disabled    = false;
        saveBtn.textContent = editingCalId !== null ? '✏️ ACTUALIZAR' : '¡CALIFICAR! ✨';
    }
}

/* ===== USUARIOS ===== */
async function loadUsuarios() {
    const list = document.getElementById('usuarios-list');
    try {
        const users = await get('/usuarios/');
        if (!users.length) {
            list.innerHTML = `<div class="empty-state"><span class="empty-icon">👤</span><p>No hay usuarios.</p></div>`;
            return;
        }
        list.innerHTML = users.map(u => `
            <div class="chapter-item" style="cursor:default">
                <span class="chapter-number" style="font-size:1.5rem">${u.is_staff ? '👑' : '👤'}</span>
                <span class="chapter-name">${u.username}</span>
                <span class="user-badge ${u.is_staff ? 'user-badge--admin' : 'user-badge--user'}">
                    ${u.is_staff ? 'Admin' : 'Usuario'}
                </span>
            </div>
        `).join('');
    } catch (e) {
        list.innerHTML = '<div class="loading">Error al cargar usuarios.</div>';
    }
}

function initUsuarioForm() {
    document.getElementById('usuario-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const errEl    = document.getElementById('form-error');
        errEl.textContent = '';
        const password  = document.getElementById('u-password').value;
        const password2 = document.getElementById('u-password2').value;
        if (password !== password2) {
            errEl.textContent = 'Las contraseñas no coinciden.';
            return;
        }
        try {
            await post('/usuarios/', {
                username: document.getElementById('u-username').value.trim(),
                password,
                is_staff: document.getElementById('u-is-staff').checked,
            });
            window.location.href = '/usuarios/';
        } catch (err) {
            errEl.textContent = err.error || Object.values(err).flat().join(' ');
        }
    });
}
