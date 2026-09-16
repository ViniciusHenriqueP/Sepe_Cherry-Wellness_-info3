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

const setasMidia = ['⬅️', '⬇️', '⬆️', '➡️'];

let gameActive = false;
let health = 50;
let score = 0;
let notes = [];

let modoAtual = 'medio';
let baseSpeed = 1.0;
let currentSpeed = 1.0;
let spawnRate = 110;
let frameCount = 0;

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

    // DIFICULDADES E VELOCIDADES REAJUSTADAS
    if (nivel === 'facil') {
        baseSpeed = 0.8;
        spawnRate = 130;
        aplicarMovimentoAlternado(false);
        document.body.classList.remove('modo-escuro-osu');
    } else if (nivel === 'medio') {
        baseSpeed = 1.4;
        spawnRate = 100;
        aplicarMovimentoAlternado(false);
        document.body.classList.remove('modo-escuro-osu');
    } else if (nivel === 'dificil') {
        baseSpeed = 2.8; // Velocidade bem amigável para reação
        spawnRate = 70;
        aplicarMovimentoAlternado(true);
        document.body.classList.add('modo-escuro-osu');
    }

    gameActive = true;
    health = 50;
    score = 0;
    scoreVal.innerText = score;
    frameCount = 0;
    currentSpeed = baseSpeed;
    notes.forEach(n => n.el.remove());
    notes = [];
    overlay.style.display = 'none';
    somAcerto.currentTime = 0;

    gameLoop();
}

function gameLoop() {
    if (!gameActive) return;

    frameCount++;

    if (frameCount % 300 === 0) {
        currentSpeed += 0.1;
        if (spawnRate > 40) {
            spawnRate -= 2;
        }
    }

    if (frameCount % Math.round(spawnRate) === 0) {
        createNote();
    }

    for (let i = notes.length - 1; i >= 0; i--) {
        let n = notes[i];
        n.y -= currentSpeed;
        n.el.style.top = n.y + 'px';

        if (n.y < -20) {
            n.el.remove();
            notes.splice(i, 1);
            tocarSomErro();
            updateHealth(-6);
        }
    }

    if (health <= 0) endGame(false);
    if (health >= 100) endGame(true);

    requestAnimationFrame(gameLoop);
}

function createNote() {
    const lane = Math.floor(Math.random() * 4);
    const el = document.createElement('div');
    el.className = 'note';
    el.innerHTML = setasMidia[lane];
    el.style.left = (lane * 25) + '%';

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

function updateHealth(amount) {
    health += amount;
    if (health > 100) health = 100;
    if (health < 0) health = 0;
    healthFill.style.width = health + '%';

    if (health > 70) healthFill.style.backgroundColor = '#458b40';
    else if (health > 30) healthFill.style.backgroundColor = '#d9a036';
    else healthFill.style.backgroundColor = '#a63232';
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

            // Sistema de pontuação e cura por precisão
            if (distancia <= 15) {
                // PERFECT!
                score += 100;
                updateHealth(8);
                mostrarFeedbackTexto('PERFECT!', '#2eec71', lane, receptorY);
            } else if (distancia <= 35) {
                // GOOD!
                score += 50;
                updateHealth(5);
                mostrarFeedbackTexto('GOOD', '#f1c40f', lane, receptorY);
            } else {
                // OK
                score += 20;
                updateHealth(2);
                mostrarFeedbackTexto('OK', '#e67e22', lane, receptorY);
            }

            scoreVal.innerText = score;
            return;
        }
    }

    tocarSomErro();
    updateHealth(-3);
}

function endGame(win) {
    gameActive = false;
    aplicarMovimentoAlternado(false);
    document.body.classList.remove('modo-escuro-osu');

    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.pause();

    overlay.style.display = 'flex';
    const status = document.getElementById('final-status');
    const msg = document.getElementById('final-msg');
    const btnArea = document.getElementById('btn-area');

    if (win) {
        somVitoria.currentTime = 0;
        somVitoria.play().catch(() => { });

        localStorage.setItem('emblemaMovimento', 'ganhou');
        status.innerText = "RITMO PERFEITO!";
        msg.innerText = `Parabéns! Você fez ${score} pontos no modo ${modoAtual.toUpperCase()} e conquistou o emblema Vida em Movimento.`;

        btnArea.className = '';
        btnArea.innerHTML = `
            <a href="emblemas.html" class="btn-game">Ver meu Emblema</a>
            <br>
            <button class="btn-game" onclick="location.reload()" style="margin-top:10px;">Jogar Novamente</button>
        `;
    } else {
        somDerrota.currentTime = 0;
        somDerrota.play().catch(() => { });

        status.innerText = "FORA DE RITMO!";
        msg.innerText = `Sua barra de energia acabou. Você fez ${score} pontos no modo ${modoAtual.toUpperCase()}. Tente novamente!`;

        btnArea.className = '';
        btnArea.innerHTML = '<button class="btn-game" onclick="location.reload()">Tentar Novamente</button>';
    }
}
