/* =====================================================================
   jogo-ritmo.js — Minijogo "Ritmo em Movimento" 🎵🏃
   ---------------------------------------------------------------------
   Usado em: jogo-ritmo.html
   Depende de: JS/progresso.js e JS/minijogo.js (tela de resultado)

   Um jogo de ritmo: setas sobem pelas 4 pistas e a pessoa aperta a
   tecla certa (setas ou W A S D) — ou toca no botão, no celular —
   quando a seta passa pelo "receptor" lá em cima.

   - Acertou: ganha pontos e energia (quanto mais no centro, melhor).
   - Errou ou deixou passar: perde energia e o combo zera.
   - Energia em 100% = vitória e Emblema Vida em Movimento.
   - Energia em 0% = fim de jogo.
   Com o tempo, as setas ficam mais rápidas e mais frequentes.
   ===================================================================== */

// ----- Elementos da página -----
const container = document.getElementById('game-container');
const healthFill = document.getElementById('health-fill');
const scoreVal = document.getElementById('score-val');
const receptorsBar = document.getElementById('receptors-bar');
const overlay = document.getElementById('feedback-overlay');
const comboVal = document.getElementById('combo-val');
const recordeVal = document.getElementById('recorde-val');
const comboPop = document.getElementById('combo-pop');
const energiaVal = document.getElementById('energia-val');
const energiaBarra = document.getElementById('energia-barra');
const pistas = document.querySelectorAll('.pista');
const receptors = [
    document.getElementById('receptor-0'),
    document.getElementById('receptor-1'),
    document.getElementById('receptor-2'),
    document.getElementById('receptor-3')
];

// ----- Sons do jogo (memes que a turma escolheu 😄) -----
const somAcerto = new Audio('AUDIO/du-bist-gut-genug.mp3');
const somErro = new Audio('AUDIO/fnf-missnote-1.mp3');
const somDerrota = new Audio('AUDIO/67.mp3');
const somVitoria = new Audio('AUDIO/manoel-gomes-parabens.mp3');

let timerAcerto = null;

// Toca só um pedacinho (670ms) do som de acerto, para não embolar
// quando a pessoa acerta várias setas seguidas
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

// Corta o som de acerto e toca o de erro do começo
function tocarSomErro() {
    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.pause();
    somErro.currentTime = 0;
    somErro.play().catch(() => { });
}

// ----- Estado da partida -----
let gameActive = false; // o jogo está rodando?
let health = 50;        // energia: começa no meio (0 a 100)
let score = 0;
let notes = [];         // setas que estão na tela agora
let combo = 0;

// Recorde fica salvo no navegador (localStorage)
let recorde = 0;
try { recorde = Number(localStorage.getItem('recordeRitmo')) || 0; } catch (e) { /* sem localStorage */ }
recordeVal.innerText = recorde;

// Pontos e combo dão um "pulinho" quando mudam
function atualizarNumero(el, valor) {
    el.innerText = valor;
    el.classList.remove('pulou');
    void el.offsetWidth;
    el.classList.add('pulou');
}

// O número grande de COMBO só aparece a partir de 5 acertos seguidos
function mostrarCombo() {
    if (combo < 5) return;
    comboPop.innerHTML = `${combo}<small>COMBO</small>`;
    comboPop.classList.remove('mostrar');
    void comboPop.offsetWidth;
    comboPop.classList.add('mostrar');
}

function perderCombo() {
    combo = 0;
    comboVal.innerText = combo;
}

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

// A cada 5 segundos o jogo acelera um pouquinho:
const SPEEDUP_INTERVAL_MS = 5000;
const SPEEDUP_AMOUNT = 6;      // +6 px/s na velocidade das setas
const SPAWN_DECREASE_MS = 33;  // setas nascem 33ms mais cedo
const SPAWN_MIN_MS = 667;      // mas nunca mais de ~1,5 seta por segundo

// Qual tecla aperta qual pista (0 = esquerda ... 3 = direita)
const keys = {
    'ArrowLeft': 0, 'a': 0, 'A': 0,
    'ArrowDown': 1, 's': 1, 'S': 1,
    'ArrowUp': 2, 'w': 2, 'W': 2,
    'ArrowRight': 3, 'd': 3, 'D': 3
};

// No modo Difícil os receptores ficam balançando, para dar um tempero extra
function aplicarMovimentoAlternado(ativar) {
    receptors.forEach((rec, i) => {
        if (ativar) rec.classList.add(`mov-alt-${i}`);
        else rec.classList.remove(`mov-alt-${i}`);
    });
}

// Chamado pelos botões Fácil / Médio / Difícil: ajusta as regras e começa
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

    // Zera tudo para uma partida nova
    gameActive = true;
    health = 50;
    score = 0;
    scoreVal.innerText = score;
    perderCombo();
    updateHealth(0);
    container.classList.add('jogando');
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

// ----- O coração do jogo -----
// Roda ~60 vezes por segundo: cria setas novas, move as que existem
// e confere se alguma passou sem ser acertada.
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

        // Passou do topo sem ser acertada: conta como erro
        if (n.y < -20) {
            n.el.remove();
            notes.splice(i, 1);
            tocarSomErro();
            perderCombo();
            updateHealth(-6);
            triggerReceptorEffect(n.lane, 'miss', 320);
        }
    }

    if (health <= 0) endGame(false);
    if (health >= 100) endGame(true);

    requestAnimationFrame(gameLoop);
}

// Cria uma seta numa pista sorteada
function createNote() {
    const lane = Math.floor(Math.random() * 4);
    const el = document.createElement('div');
    el.className = `note lane-${lane}`;
    el.style.left = (lane * 25) + '%';
    el.innerHTML = `<svg class="seta seta-${lane}" aria-hidden="true"><use href="#seta"/></svg>`;

    // Nasce logo abaixo da borda de baixo da pista (420px no celular, 480px no computador)
    let startY = container.clientHeight;

    // Teleporte mais previsível no modo Difícil (só surge na metade inferior da tela)
    if (modoAtual === 'dificil' && Math.random() < 0.20) {
        startY = 240 + Math.random() * 60;
        el.classList.add('teleport');
    }

    el.style.top = startY + 'px';

    container.appendChild(el);
    notes.push({ el, lane, y: startY });
}

// Texto flutuante "PERFECT!", "GOOD" ou "OK" que some em 0,6s
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

// Explosãozinha visual no ponto do acerto
function mostrarAcertoBurst(lane, y) {
    const burst = document.createElement('div');
    burst.className = 'hit-burst';
    burst.style.left = (lane * 25 + 12.5) + '%';
    burst.style.top = (y + 25) + 'px';
    container.appendChild(burst);
    setTimeout(() => burst.remove(), 450);
}

// Faz o receptor piscar (verde no acerto, vermelho no erro)
function triggerReceptorEffect(lane, classe, duracao) {
    const rec = receptors[lane];
    rec.classList.remove(classe);
    void rec.offsetWidth; // força reflow para reiniciar a animação
    rec.classList.add(classe);
    setTimeout(() => rec.classList.remove(classe), duracao);
}

// Soma (ou tira) energia e pinta a barra: verde, amarela ou vermelha
function updateHealth(amount) {
    health += amount;
    if (health > 100) health = 100;
    if (health < 0) health = 0;
    healthFill.style.width = health + '%';
    energiaVal.innerText = health + '%';
    energiaBarra.setAttribute('aria-valuenow', health);

    healthFill.classList.remove('health-high', 'health-mid', 'health-low');
    if (health > 70) healthFill.classList.add('health-high');
    else if (health > 30) healthFill.classList.add('health-mid');
    else healthFill.classList.add('health-low');
}

// A pessoa apertou uma pista: acende ela e confere se acertou
function triggerInput(lane) {
    if (!gameActive) return;
    receptors[lane].classList.add('active');
    pistas[lane].classList.add('acesa');
    checkHit(lane);
    setTimeout(() => {
        receptors[lane].classList.remove('active');
        pistas[lane].classList.remove('acesa');
    }, 100);
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

// Procura uma seta daquela pista perto do receptor.
// Quanto mais perto do centro, mais pontos e mais energia.
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

            combo++;
            atualizarNumero(scoreVal, score);
            atualizarNumero(comboVal, combo);
            mostrarCombo();
            return;
        }
    }

    // Apertou sem ter seta perto: errinho leve
    tocarSomErro();
    perderCombo();
    updateHealth(-3);
    triggerReceptorEffect(lane, 'miss', 320);
}

// ----- Fim de partida -----
// Salva o recorde, toca o som certo e mostra a tela de resultado
function endGame(win) {
    gameActive = false;
    container.classList.remove('jogando');
    aplicarMovimentoAlternado(false);

    const novoRecorde = score > recorde;
    if (novoRecorde) {
        recorde = score;
        recordeVal.innerText = recorde;
        try { localStorage.setItem('recordeRitmo', recorde); } catch (e) { /* sem localStorage */ }
    }
    const textoRecorde = novoRecorde ? ' Novo recorde!' : '';
    document.body.classList.remove('modo-escuro-osu');

    if (timerAcerto) clearTimeout(timerAcerto);
    somAcerto.pause();

    const nomes = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

    if (win) {
        somVitoria.currentTime = 0;
        somVitoria.play().catch(() => { });

        CherryProgresso.marcar('movimento'); // 🏅 emblema conquistado!
        mostrarTelaResultado(overlay, {
            vitoria: true,
            titulo: 'Ritmo perfeito!',
            mensagem: `<strong>${score} pontos</strong> no modo ${nomes[modoAtual]}.${textoRecorde} Emblema Vida em Movimento conquistado!`
        });
    } else {
        somDerrota.currentTime = 0;
        somDerrota.play().catch(() => { });

        mostrarTelaResultado(overlay, {
            vitoria: false,
            titulo: 'Fora de ritmo!',
            mensagem: `A energia acabou com <strong>${score} pontos</strong> no modo ${nomes[modoAtual]}.${textoRecorde} Respira, alonga os dedos e tenta de novo! 💪`
        });
    }
}
