const container = document.getElementById('game-container');
const breathFill = document.getElementById('breath-fill');
const scoreVal = document.getElementById('score-val');
const overlay = document.getElementById('feedback-overlay');
const pulmaoSvg = document.getElementById('pulmao-svg');

// Áudios (reaproveita os mesmos efeitos do minijogo Ritmo em Movimento)
const somAcerto = new Audio('AUDIO/du-bist-gut-genug.mp3');
const somErro = new Audio('AUDIO/fnf-missnote-1.mp3');
const somDerrota = new Audio('AUDIO/67.mp3');
const somVitoria = new Audio('AUDIO/manoel-gomes-parabens.mp3');

let timerAcerto = null;

function tocarSomAcerto() {
    if (somAcerto.ended) somAcerto.currentTime = 0;
    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.play().catch(() => { });
    timerAcerto = setTimeout(() => somAcerto.pause(), 670);
}

function tocarSomErro() {
    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.pause();
    somErro.currentTime = 0;
    somErro.play().catch(() => { });
}

let gameActive = false;
let breath = 50;
let score = 0;
let notes = [];

const NOTE_WIDTH = 52;

// Velocidade em pixels/segundo e tempos em milissegundos — independente da
// taxa de atualização da tela, como no minijogo de ritmo.
let baseSpeed = 70;
let currentSpeed = baseSpeed;
let spawnInterval = 1500;
let lastTimestamp = null;
let spawnTimer = 0;
let speedUpTimer = 0;

const SPEEDUP_INTERVAL_MS = 6000;
const SPEEDUP_AMOUNT = 7;
const SPAWN_DECREASE_MS = 30;
const SPAWN_MIN_MS = 750;

const PERFECT_PX = 16;
const GOOD_PX = 34;
const OK_PX = 60;

const keys = { 'q': 'left', 'Q': 'left', 'e': 'right', 'E': 'right' };

function iniciarJogo() {
    gameActive = true;
    breath = 50;
    score = 0;
    scoreVal.innerText = score;
    currentSpeed = baseSpeed;
    spawnInterval = 1500;
    lastTimestamp = null;
    spawnTimer = 0;
    speedUpTimer = 0;
    notes.forEach(n => n.el.remove());
    notes = [];
    updateBreath(0);
    overlay.style.display = 'none';
    somAcerto.currentTime = 0;

    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameActive) return;

    if (lastTimestamp === null) lastTimestamp = timestamp;
    const deltaMs = Math.min(timestamp - lastTimestamp, 100);
    lastTimestamp = timestamp;

    spawnTimer += deltaMs;
    speedUpTimer += deltaMs;

    if (speedUpTimer >= SPEEDUP_INTERVAL_MS) {
        speedUpTimer -= SPEEDUP_INTERVAL_MS;
        currentSpeed += SPEEDUP_AMOUNT;
        spawnInterval = Math.max(SPAWN_MIN_MS, spawnInterval - SPAWN_DECREASE_MS);
    }

    if (spawnTimer >= spawnInterval) {
        spawnTimer -= spawnInterval;
        createNote();
    }

    const centerX = container.clientWidth / 2;
    const moveAmount = currentSpeed * (deltaMs / 1000);

    for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.x += n.lane === 'left' ? moveAmount : -moveAmount;
        n.el.style.left = n.x + 'px';

        const noteCenterX = n.x + NOTE_WIDTH / 2;
        const passou = n.lane === 'left'
            ? noteCenterX > centerX + OK_PX
            : noteCenterX < centerX - OK_PX;

        if (passou) {
            n.el.remove();
            notes.splice(i, 1);
            tocarSomErro();
            updateBreath(-6);
            reagirPulmao('reagir-erro');
        }
    }

    if (breath <= 0) endGame(false);
    if (breath >= 100) endGame(true);

    requestAnimationFrame(gameLoop);
}

function createNote() {
    const lane = Math.random() < 0.5 ? 'left' : 'right';
    const el = document.createElement('div');
    el.className = `nota-pulmao lane-${lane}`;

    const containerWidth = container.clientWidth;
    const startX = lane === 'left' ? -NOTE_WIDTH : containerWidth;
    el.style.left = startX + 'px';

    el.innerHTML = lane === 'left'
        ? '<svg viewBox="0 0 60 100" fill="currentColor" fill-opacity="0.9" stroke="none"><g transform="translate(60,0) scale(-1,1)"><use href="#lobo-pulmao"/></g></svg>'
        : '<svg viewBox="0 0 60 100" fill="currentColor" fill-opacity="0.9" stroke="none"><use href="#lobo-pulmao"/></svg>';

    container.appendChild(el);
    notes.push({ el, lane, x: startX });
}

function mostrarFeedbackTexto(texto) {
    const fb = document.createElement('div');
    fb.className = 'hit-feedback';
    fb.innerText = texto;
    container.appendChild(fb);
    setTimeout(() => fb.remove(), 650);
}

function mostrarBurst(cor) {
    const burst = document.createElement('div');
    burst.className = 'hit-burst';
    burst.style.setProperty('--burst-color', cor);
    container.appendChild(burst);
    setTimeout(() => burst.remove(), 450);
}

function reagirPulmao(classe) {
    pulmaoSvg.classList.remove('reagir-perfeito', 'reagir-bom', 'reagir-erro');
    void pulmaoSvg.offsetWidth; // reinicia a animação
    pulmaoSvg.classList.add(classe);
    setTimeout(() => pulmaoSvg.classList.remove(classe), 420);
}

function updateBreath(amount) {
    breath += amount;
    if (breath > 100) breath = 100;
    if (breath < 0) breath = 0;
    breathFill.style.width = breath + '%';

    breathFill.classList.remove('breath-high', 'breath-mid', 'breath-low');
    if (breath > 70) breathFill.classList.add('breath-high');
    else if (breath > 30) breathFill.classList.add('breath-mid');
    else breathFill.classList.add('breath-low');
}

function triggerInput(lane) {
    if (!gameActive) return;
    checkHit(lane);
}

function checkHit(lane) {
    const centerX = container.clientWidth / 2;
    let melhorIndice = -1;
    let melhorDistancia = Infinity;

    for (let i = 0; i < notes.length; i++) {
        const n = notes[i];
        if (n.lane !== lane) continue;
        const noteCenterX = n.x + NOTE_WIDTH / 2;
        const distancia = Math.abs(noteCenterX - centerX);
        if (distancia <= OK_PX && distancia < melhorDistancia) {
            melhorDistancia = distancia;
            melhorIndice = i;
        }
    }

    if (melhorIndice === -1) {
        tocarSomErro();
        updateBreath(-3);
        reagirPulmao('reagir-erro');
        return;
    }

    const n = notes[melhorIndice];
    n.el.remove();
    notes.splice(melhorIndice, 1);
    tocarSomAcerto();

    if (melhorDistancia <= PERFECT_PX) {
        score += 100;
        updateBreath(8);
        reagirPulmao('reagir-perfeito');
        mostrarFeedbackTexto('Perfeito!');
        mostrarBurst('var(--color-green-mid)');
    } else if (melhorDistancia <= GOOD_PX) {
        score += 50;
        updateBreath(5);
        reagirPulmao('reagir-bom');
        mostrarFeedbackTexto('Bom');
        mostrarBurst('var(--color-yellow-accent)');
    } else {
        score += 20;
        updateBreath(2);
        reagirPulmao('reagir-bom');
        mostrarFeedbackTexto('OK');
        mostrarBurst('var(--color-sage-deep)');
    }

    scoreVal.innerText = score;
}

// Teclado: Q = esquerda, E = direita
window.addEventListener('keydown', (e) => {
    const lane = keys[e.key];
    if (lane !== undefined && gameActive) {
        triggerInput(lane);
    }
});

// Toque (celular)
['left', 'right'].forEach(lane => {
    const btn = document.getElementById(`btn-${lane}`);
    if (!btn) return;

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerInput(lane);
    }, { passive: false });

    btn.addEventListener('click', () => triggerInput(lane));
});

function endGame(win) {
    gameActive = false;

    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.pause();

    overlay.style.display = 'flex';
    const status = document.getElementById('final-status');
    const msg = document.getElementById('final-msg');
    const btnArea = document.getElementById('btn-area');

    if (win) {
        somVitoria.currentTime = 0;
        somVitoria.play().catch(() => { });

        localStorage.setItem('emblemaMental', 'ganhou');
        status.innerText = 'Fôlego cheio!';
        msg.innerText = `Você fez ${score} pontos e encheu o pulmão de fôlego. Emblema de Bem-Estar Mental conquistado!`;

        btnArea.innerHTML = `
            <a href="emblemas.html" class="btn-primary" style="text-decoration:none; display:block; text-align:center;">Ver meu Emblema</a>
            <button class="btn-secondary" onclick="location.reload()" type="button">Jogar Novamente</button>
        `;
    } else {
        somDerrota.currentTime = 0;
        somDerrota.play().catch(() => { });

        status.innerText = 'Faltou fôlego!';
        msg.innerText = `Sua barra de fôlego esvaziou. Você fez ${score} pontos. Respire fundo e tente de novo!`;

        btnArea.innerHTML = '<button class="btn-primary" onclick="location.reload()" type="button">Tentar Novamente</button>';
    }
}
