const container = document.getElementById('game-container');
const breathFill = document.getElementById('breath-fill');
const scoreVal = document.getElementById('score-val');
const overlay = document.getElementById('feedback-overlay');
const pulmaoSvg = document.getElementById('pulmao-svg');
const pulmaoCentral = document.getElementById('pulmao-central');

let gameActive = false;
let breath = 50;
let score = 0;
let notes = [];

// Distância do centro de cada lobo até o meio do pulmão central, como fração
// da largura do SVG (lobos centrados em x = 100 ± 39,4 no viewBox de 200).
const LOBE_OFFSET_RATIO = 39.4 / 200;

// Velocidade em pixels/segundo e tempos em milissegundos — independente da
// taxa de atualização da tela, como no minijogo de ritmo.
const DIFICULDADES = {
    facil: { nome: 'Fácil', velocidade: 80, intervalo: 1500, aceleracao: 6, intervaloMin: 800 },
    medio: { nome: 'Médio', velocidade: 108, intervalo: 1150, aceleracao: 10, intervaloMin: 520 },
    dificil: { nome: 'Difícil', velocidade: 150, intervalo: 850, aceleracao: 14, intervaloMin: 420 }
};

let dificuldade = DIFICULDADES.medio;
let currentSpeed = dificuldade.velocidade;
let spawnInterval = dificuldade.intervalo;
let lastTimestamp = null;
let spawnTimer = 0;
let speedUpTimer = 0;

const SPEEDUP_INTERVAL_MS = 4500;
const SPAWN_DECREASE_MS = 35;

const PERFECT_PX = 16;
const GOOD_PX = 36;
const OK_PX = 62;

const keys = { 'q': 'left', 'Q': 'left', 'e': 'right', 'E': 'right' };

function iniciarJogo(nivel) {
    dificuldade = DIFICULDADES[nivel] || DIFICULDADES.medio;
    gameActive = true;
    breath = 50;
    score = 0;
    scoreVal.innerText = score;
    currentSpeed = dificuldade.velocidade;
    spawnInterval = dificuldade.intervalo;
    lastTimestamp = null;
    spawnTimer = 0;
    speedUpTimer = 0;
    notes.forEach(n => n.el.remove());
    notes = [];
    updateBreath(0);
    overlay.style.display = 'none';

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
        currentSpeed += dificuldade.aceleracao;
        spawnInterval = Math.max(dificuldade.intervaloMin, spawnInterval - SPAWN_DECREASE_MS);
    }

    if (spawnTimer >= spawnInterval) {
        spawnTimer -= spawnInterval;
        createNote();
    }

    const moveAmount = currentSpeed * (deltaMs / 1000);

    for (let i = notes.length - 1; i >= 0; i--) {
        const n = notes[i];
        n.x += n.lane === 'left' ? moveAmount : -moveAmount;
        n.el.style.left = n.x + 'px';

        const noteCenterX = n.x + n.width / 2;
        const alvoX = alvoDaPista(n.lane);
        const passou = n.lane === 'left'
            ? noteCenterX > alvoX + OK_PX
            : noteCenterX < alvoX - OK_PX;

        if (passou) {
            n.el.remove();
            notes.splice(i, 1);
            updateBreath(-6);
            reagirPulmao('reagir-erro');
        }
    }

    if (breath <= 0) endGame(false);
    if (breath >= 100) endGame(true);

    requestAnimationFrame(gameLoop);
}

// Ponto de encaixe de cada metade: o centro do lobo correspondente no pulmão
// central, e não o meio exato do pulmão.
function alvoDaPista(lane) {
    const centerX = container.clientWidth / 2;
    const offset = pulmaoCentral.offsetWidth * LOBE_OFFSET_RATIO;
    return lane === 'left' ? centerX - offset : centerX + offset;
}

function createNote() {
    const lane = Math.random() < 0.5 ? 'left' : 'right';
    const el = document.createElement('div');
    el.className = `nota-pulmao lane-${lane}`;

    el.innerHTML = lane === 'left'
        ? '<svg viewBox="0 0 60 100" fill="currentColor" fill-opacity="0.9" stroke="none"><g transform="translate(60,0) scale(-1,1)"><use href="#lobo-pulmao"/></g></svg>'
        : '<svg viewBox="0 0 60 100" fill="currentColor" fill-opacity="0.9" stroke="none"><use href="#lobo-pulmao"/></svg>';

    container.appendChild(el);

    // A largura vem do CSS (menor no celular), então é lida depois de inserir
    const width = el.offsetWidth;
    const startX = lane === 'left' ? -width : container.clientWidth;
    el.style.left = startX + 'px';

    notes.push({ el, lane, x: startX, width });
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
    const alvoX = alvoDaPista(lane);
    let melhorIndice = -1;
    let melhorDistancia = Infinity;

    for (let i = 0; i < notes.length; i++) {
        const n = notes[i];
        if (n.lane !== lane) continue;
        const noteCenterX = n.x + n.width / 2;
        const distancia = Math.abs(noteCenterX - alvoX);
        if (distancia <= OK_PX && distancia < melhorDistancia) {
            melhorDistancia = distancia;
            melhorIndice = i;
        }
    }

    if (melhorIndice === -1) {
        updateBreath(-3);
        reagirPulmao('reagir-erro');
        return;
    }

    const n = notes[melhorIndice];
    n.el.remove();
    notes.splice(melhorIndice, 1);

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

    overlay.style.display = 'flex';
    const status = document.getElementById('final-status');
    const msg = document.getElementById('final-msg');
    const btnArea = document.getElementById('btn-area');
    btnArea.classList.remove('dificuldade-linha');

    if (win) {
        localStorage.setItem('emblemaMental', 'ganhou');
        status.innerText = 'Fôlego cheio!';
        msg.innerText = `Você fez ${score} pontos no modo ${dificuldade.nome} e encheu o pulmão de fôlego. Emblema de Bem-Estar Mental conquistado!`;

        btnArea.innerHTML = `
            <a href="emblemas.html" class="btn-primary" style="text-decoration:none; display:block; text-align:center;">Ver meu Emblema</a>
            <button class="btn-secondary" onclick="location.reload()" type="button">Jogar Novamente</button>
        `;
    } else {
        status.innerText = 'Faltou fôlego!';
        msg.innerText = `Sua barra de fôlego esvaziou. Você fez ${score} pontos no modo ${dificuldade.nome}. Respire fundo e tente de novo!`;

        btnArea.innerHTML = '<button class="btn-primary" onclick="location.reload()" type="button">Tentar Novamente</button>';
    }
}
