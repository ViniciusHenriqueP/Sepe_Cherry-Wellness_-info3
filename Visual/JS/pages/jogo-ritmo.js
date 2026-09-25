const container = document.getElementById('game-container');
const healthFill = document.getElementById('health-fill');
const scoreVal = document.getElementById('score-val');
const receptorsBar = document.getElementById('receptors-bar');
const overlay = document.getElementById('feedback-overlay');
const receptors = [
    document.getElementById('receptor-0'),
    document.getElementById('receptor-1'),
    document.getElementById('receptor-2'),
    document.getElementById('receptor-3')
];

// Áudios
const somAcerto = new Audio('AUDIO/du-bist-gut-genug.mp3');
const somErro = new Audio('AUDIO/fnf-missnote-1.mp3');
const somDerrota = new Audio('AUDIO/67.mp3');
const somVitoria = new Audio('AUDIO/manoel-gomes-parabens.mp3');

let timerAcerto = null;

function tocarSomAcerto() {
    if (somAcerto.ended) {
        somAcerto.currentTime = 0;
    }
    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.play().catch(() => { });
    timerAcerto = setTimeout(() => {
        somAcerto.pause();
    }, 670);
}

function tocarSomErro() {
    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.pause();
    somErro.currentTime = 0;
    somErro.play().catch(() => { });
}

let gameActive = false;
let health = 50;
let score = 0;
let notes = [];

let modoAtual = 'medio';

// Velocidades em pixels/segundo e tempos em milissegundos: independentes da
// taxa de atualização do monitor (Hz). Antes o jogo avançava um valor fixo
// por frame, então em telas de 144Hz ficava muito mais rápido e em telas de
// 30Hz muito mais lento que o pretendido.
let baseSpeed = 60;
let currentSpeed = 60;
let spawnInterval = 1650;
let lastTimestamp = null;
let spawnTimer = 0;
let speedUpTimer = 0;

const SPEEDUP_INTERVAL_MS = 5000;
const SPEEDUP_AMOUNT = 6;
const SPAWN_DECREASE_MS = 33;
const SPAWN_MIN_MS = 667;

const keys = {
    'ArrowLeft': 0, 'a': 0, 'A': 0,
    'ArrowDown': 1, 's': 1, 'S': 1,
    'ArrowUp': 2, 'w': 2, 'W': 2,
    'ArrowRight': 3, 'd': 3, 'D': 3
};

function aplicarMovimentoAlternado(ativar) {
    receptors.forEach((rec, i) => {
        if (ativar) rec.classList.add(`mov-alt-${i}`);
        else rec.classList.remove(`mov-alt-${i}`);
    });
}

function iniciarComDificuldade(nivel) {
    modoAtual = nivel;

    // DIFICULDADES E VELOCIDADES REAJUSTADAS (px/s e ms, não por frame)
    if (nivel === 'facil') {
        baseSpeed = 48;
        spawnInterval = 2170;
        aplicarMovimentoAlternado(false);
        document.body.classList.remove('modo-escuro-osu');
    } else if (nivel === 'medio') {
        baseSpeed = 84;
        spawnInterval = 1670;
        aplicarMovimentoAlternado(false);
        document.body.classList.remove('modo-escuro-osu');
    } else if (nivel === 'dificil') {
        baseSpeed = 168; // Velocidade bem amigável para reação
        spawnInterval = 1170;
        aplicarMovimentoAlternado(true);
        document.body.classList.add('modo-escuro-osu');
    }

    gameActive = true;
    health = 50;
    score = 0;
    scoreVal.innerText = score;
    currentSpeed = baseSpeed;
    lastTimestamp = null;
    spawnTimer = 0;
    speedUpTimer = 0;
    notes.forEach(n => n.el.remove());
    notes = [];
    overlay.style.display = 'none';
    somAcerto.currentTime = 0;

    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameActive) return;

    if (lastTimestamp === null) lastTimestamp = timestamp;
    // Trava o salto em 100ms (ex: aba fora de foco) para não teleportar as notas.
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

    const moveAmount = currentSpeed * (deltaMs / 1000);
    for (let i = notes.length - 1; i >= 0; i--) {
        let n = notes[i];
        n.y -= moveAmount;
        n.el.style.top = n.y + 'px';

        if (n.y < -20) {
            n.el.remove();
            notes.splice(i, 1);
            tocarSomErro();
            updateHealth(-6);
            triggerReceptorEffect(n.lane, 'miss', 320);
        }
    }

    if (health <= 0) endGame(false);
    if (health >= 100) endGame(true);

    requestAnimationFrame(gameLoop);
}

function createNote() {
    const lane = Math.floor(Math.random() * 4);
    const el = document.createElement('div');
    el.className = `note lane-${lane}`;
    el.style.left = (lane * 25) + '%';
    el.innerHTML = `<svg class="seta seta-${lane}" aria-hidden="true"><use href="#seta"/></svg>`;

    let startY = 420;

    // Teleporte mais previsível no modo Difícil (só surge na metade inferior da tela)
    if (modoAtual === 'dificil' && Math.random() < 0.20) {
        startY = 240 + Math.random() * 60;
        el.classList.add('teleport');
    }

    el.style.top = startY + 'px';

    container.appendChild(el);
    notes.push({ el, lane, y: startY });
}

function mostrarFeedbackTexto(texto, cor, lane, y) {
    const fb = document.createElement('div');
    fb.className = 'hit-feedback';
    fb.innerText = texto;
    fb.style.color = cor;
    fb.style.left = (lane * 25 + 5) + '%';
    fb.style.top = y + 'px';
    container.appendChild(fb);

    setTimeout(() => fb.remove(), 600);
}

function mostrarAcertoBurst(lane, y) {
    const burst = document.createElement('div');
    burst.className = 'hit-burst';
    burst.style.setProperty('--burst-color', `var(--lane-${lane})`);
    burst.style.left = (lane * 25 + 12.5) + '%';
    burst.style.top = (y + 25) + 'px';
    container.appendChild(burst);
    setTimeout(() => burst.remove(), 450);
}

function triggerReceptorEffect(lane, classe, duracao) {
    const rec = receptors[lane];
    rec.classList.remove(classe);
    void rec.offsetWidth; // força reflow para reiniciar a animação
    rec.classList.add(classe);
    setTimeout(() => rec.classList.remove(classe), duracao);
}

function updateHealth(amount) {
    health += amount;
    if (health > 100) health = 100;
    if (health < 0) health = 0;
    healthFill.style.width = health + '%';

    healthFill.classList.remove('health-high', 'health-mid', 'health-low');
    if (health > 70) healthFill.classList.add('health-high');
    else if (health > 30) healthFill.classList.add('health-mid');
    else healthFill.classList.add('health-low');
}

function triggerInput(lane) {
    if (!gameActive) return;
    receptors[lane].classList.add('active');
    checkHit(lane);
    setTimeout(() => receptors[lane].classList.remove('active'), 100);
}

// Teclado
window.addEventListener('keydown', (e) => {
    const lane = keys[e.key];
    if (lane !== undefined && gameActive) {
        triggerInput(lane);
    }
});

// Touch (Mobile)
[0, 1, 2, 3].forEach(lane => {
    const btn = document.getElementById(`btn-${lane}`);

    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        triggerInput(lane);
    });

    btn.addEventListener('click', () => {
        triggerInput(lane);
    });
});

function checkHit(lane) {
    const receptorEl = receptors[lane];
    const receptorRect = receptorEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const receptorY = receptorRect.top - containerRect.top;

    // Área de acerto bem ampla (hitbox expandida)
    const hitZoneMin = receptorY - 50;
    const hitZoneMax = receptorY + 90;

    for (let i = 0; i < notes.length; i++) {
        let n = notes[i];
        if (n.lane === lane && n.y >= hitZoneMin && n.y <= hitZoneMax) {

            // Distância exata do centro do receptor
            const distancia = Math.abs(n.y - receptorY);

            n.el.remove();
            notes.splice(i, 1);
            tocarSomAcerto();
            mostrarAcertoBurst(lane, receptorY);
            triggerReceptorEffect(lane, 'hit', 260);

            // Sistema de pontuação e cura por precisão
            if (distancia <= 15) {
                // PERFECT!
                score += 100;
                updateHealth(8);
                mostrarFeedbackTexto('PERFECT!', 'var(--color-green-mid)', lane, receptorY);
            } else if (distancia <= 35) {
                // GOOD!
                score += 50;
                updateHealth(5);
                mostrarFeedbackTexto('GOOD', 'var(--color-yellow-accent)', lane, receptorY);
            } else {
                // OK
                score += 20;
                updateHealth(2);
                mostrarFeedbackTexto('OK', 'var(--color-green-accent)', lane, receptorY);
            }

            scoreVal.innerText = score;
            return;
        }
    }

    tocarSomErro();
    updateHealth(-3);
    triggerReceptorEffect(lane, 'miss', 320);
}

function endGame(win) {
    gameActive = false;
    aplicarMovimentoAlternado(false);
    document.body.classList.remove('modo-escuro-osu');

    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.pause();

    const nomes = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

    if (win) {
        somVitoria.currentTime = 0;
        somVitoria.play().catch(() => { });

        localStorage.setItem('emblemaMovimento', 'ganhou');
        mostrarTelaResultado(overlay, {
            vitoria: true,
            titulo: 'Ritmo perfeito!',
            mensagem: `<strong>${score} pontos</strong> no modo ${nomes[modoAtual]}. Emblema Vida em Movimento conquistado!`
        });
    } else {
        somDerrota.currentTime = 0;
        somDerrota.play().catch(() => { });

        mostrarTelaResultado(overlay, {
            vitoria: false,
            titulo: 'Fora de ritmo!',
            mensagem: `A energia acabou com <strong>${score} pontos</strong> no modo ${nomes[modoAtual]}. Tente de novo!`
        });
    }
}
