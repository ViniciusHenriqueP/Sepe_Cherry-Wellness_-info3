// Trilha sonora da Batalha Final (jogo-boss.html).
//
// COMO TROCAR A MÚSICA
// Coloque os arquivos na pasta AUDIO/ com exatamente estes nomes:
//   - AUDIO/undertale-batalha.mp3 → toca em loop durante a luta
//     (sugestões do Undertale: "Megalovania", "Spear of Justice", "Death by Glamour")
//   - AUDIO/undertale-final.mp3   → toca na cutscene em que a cereja fica saudável
//     (sugestões: "His Theme", "Hopes and Dreams", "Once Upon a Time")
// Se algum arquivo não existir, o jogo toca uma trilha chiptune própria,
// gerada aqui mesmo pelo navegador (Web Audio API), então nunca fica mudo.

const FAIXAS = {
    batalha: { arquivo: 'AUDIO/undertale-batalha.mp3', volume: 0.45, loop: true, chiptune: 'batalha' },
    final: { arquivo: 'AUDIO/undertale-final.mp3', volume: 0.5, loop: true, chiptune: 'final' }
};

// ---------- Chiptune de reserva ----------
// Cada faixa tem 4 compassos de 16 passos (semicolcheias). Os números são
// notas MIDI (60 = Dó central) e 0 é pausa. "duracao" é quantos passos a nota soa.
const CHIPTUNES = {
    batalha: {
        bpm: 150,
        vozes: [
            {
                onda: 'square', volume: 0.07, duracao: 1,
                notas: [
                    69, 0, 72, 74, 0, 74, 72, 69, 77, 0, 76, 0, 74, 0, 72, 0,
                    67, 0, 69, 72, 0, 72, 69, 67, 76, 0, 74, 0, 72, 0, 69, 0,
                    65, 0, 69, 70, 0, 74, 0, 70, 77, 0, 76, 74, 0, 70, 0, 69,
                    69, 0, 0, 73, 0, 76, 0, 73, 81, 0, 79, 0, 76, 0, 73, 0
                ]
            },
            {
                onda: 'triangle', volume: 0.22, duracao: 2,
                // Um compasso de baixo para cada acorde: Ré, Dó, Si bemol, Lá
                notas: [38, 36, 34, 33].flatMap(raiz => [
                    raiz, 0, raiz, 0, raiz + 12, 0, raiz, 0, raiz, 0, raiz + 12, 0, raiz, 0, raiz + 12, 0
                ])
            }
        ],
        bumbo: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0]
    },
    final: {
        bpm: 84,
        vozes: [
            {
                onda: 'triangle', volume: 0.16, duracao: 1,
                notas: [
                    60, 64, 67, 72, 67, 64, 60, 64, 67, 72, 67, 64, 60, 64, 67, 64,
                    53, 57, 60, 65, 60, 57, 53, 57, 60, 65, 60, 57, 53, 57, 60, 57,
                    57, 60, 64, 69, 64, 60, 57, 60, 64, 69, 64, 60, 57, 60, 64, 60,
                    55, 59, 62, 67, 62, 59, 55, 59, 62, 67, 62, 59, 55, 59, 62, 59
                ]
            },
            {
                onda: 'square', volume: 0.045, duracao: 4,
                notas: [
                    76, 0, 0, 0, 79, 0, 0, 0, 77, 0, 76, 0, 74, 0, 0, 0,
                    72, 0, 0, 0, 77, 0, 0, 0, 76, 0, 74, 0, 72, 0, 0, 0,
                    72, 0, 0, 0, 76, 0, 0, 0, 81, 0, 79, 0, 76, 0, 0, 0,
                    74, 0, 0, 0, 79, 0, 0, 0, 77, 0, 76, 0, 74, 0, 71, 0
                ]
            }
        ],
        bumbo: []
    }
};

const frequencia = (nota) => 440 * Math.pow(2, (nota - 69) / 12);

let contextoAudio = null;
let tocando = null; // { audio } ou { sintetizador }
let mudo = false;
try { mudo = localStorage.getItem('bossMudo') === 'sim'; } catch (e) { /* sem localStorage */ }

function obterContexto() {
    if (!contextoAudio) contextoAudio = new (window.AudioContext || window.webkitAudioContext)();
    if (contextoAudio.state === 'suspended') contextoAudio.resume();
    return contextoAudio;
}

function iniciarChiptune(nome) {
    const faixa = CHIPTUNES[nome];
    const ac = obterContexto();
    const mestre = ac.createGain();
    mestre.gain.value = mudo ? 0 : 1;
    mestre.connect(ac.destination);

    const passo = 60 / faixa.bpm / 4;
    const totalPassos = Math.max(...faixa.vozes.map(v => v.notas.length));
    let indice = 0;
    let proximoTempo = ac.currentTime + 0.05;

    function tocarNota(voz, nota, tempo) {
        const osc = ac.createOscillator();
        const env = ac.createGain();
        osc.type = voz.onda;
        osc.frequency.value = frequencia(nota);
        const fim = tempo + passo * voz.duracao * 0.95;
        env.gain.setValueAtTime(0.0001, tempo);
        env.gain.exponentialRampToValueAtTime(voz.volume, tempo + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, fim);
        osc.connect(env).connect(mestre);
        osc.start(tempo);
        osc.stop(fim + 0.02);
    }

    function tocarBumbo(tempo) {
        const osc = ac.createOscillator();
        const env = ac.createGain();
        osc.frequency.setValueAtTime(140, tempo);
        osc.frequency.exponentialRampToValueAtTime(40, tempo + 0.12);
        env.gain.setValueAtTime(0.35, tempo);
        env.gain.exponentialRampToValueAtTime(0.0001, tempo + 0.14);
        osc.connect(env).connect(mestre);
        osc.start(tempo);
        osc.stop(tempo + 0.16);
    }

    // Agenda as notas um pouco à frente do tempo atual para não engasgar
    const agendador = setInterval(() => {
        while (proximoTempo < ac.currentTime + 0.12) {
            faixa.vozes.forEach(voz => {
                const nota = voz.notas[indice % voz.notas.length];
                if (nota) tocarNota(voz, nota, proximoTempo);
            });
            if (faixa.bumbo.length && faixa.bumbo[indice % faixa.bumbo.length]) tocarBumbo(proximoTempo);
            proximoTempo += passo;
            indice = (indice + 1) % totalPassos;
        }
    }, 25);

    return {
        mestre,
        parar() {
            clearInterval(agendador);
            mestre.disconnect();
        }
    };
}

// ---------- API usada pelo jogo ----------
function tocarTrilha(nome) {
    pararTrilha();
    const faixa = FAIXAS[nome];
    const audio = new Audio(faixa.arquivo);
    audio.loop = faixa.loop;
    audio.volume = faixa.volume;
    audio.muted = mudo;
    const atual = { audio };
    tocando = atual;

    // Arquivo não encontrado (ou sem suporte): cai para o chiptune
    let caiu = false;
    const usarChiptune = () => {
        if (caiu || tocando !== atual) return;
        caiu = true;
        audio.pause();
        atual.audio = null;
        try { atual.sintetizador = iniciarChiptune(faixa.chiptune); } catch (e) { /* sem Web Audio */ }
    };
    audio.addEventListener('error', usarChiptune);
    audio.play().catch(usarChiptune);
}

// Para a música; com "fade" em ms, abaixa o volume aos poucos antes
function pararTrilha(fade = 0) {
    const atual = tocando;
    tocando = null;
    if (!atual) return Promise.resolve();

    return new Promise(resolve => {
        const encerrar = () => {
            if (atual.audio) atual.audio.pause();
            if (atual.sintetizador) atual.sintetizador.parar();
            resolve();
        };
        if (!fade) return encerrar();

        if (atual.audio) {
            const inicial = atual.audio.volume;
            const inicio = performance.now();
            const id = setInterval(() => {
                const p = Math.min((performance.now() - inicio) / fade, 1);
                atual.audio.volume = inicial * (1 - p);
                if (p >= 1) {
                    clearInterval(id);
                    encerrar();
                }
            }, 40);
        } else if (atual.sintetizador) {
            const ganho = atual.sintetizador.mestre.gain;
            const agora = contextoAudio.currentTime;
            ganho.setValueAtTime(ganho.value, agora);
            ganho.linearRampToValueAtTime(0, agora + fade / 1000);
            setTimeout(encerrar, fade);
        } else {
            encerrar();
        }
    });
}

function alternarMudo() {
    mudo = !mudo;
    try { localStorage.setItem('bossMudo', mudo ? 'sim' : 'nao'); } catch (e) { /* sem localStorage */ }
    if (tocando?.audio) tocando.audio.muted = mudo;
    if (tocando?.sintetizador) tocando.sintetizador.mestre.gain.value = mudo ? 0 : 1;
    return mudo;
}

function estaMudo() {
    return mudo;
}
