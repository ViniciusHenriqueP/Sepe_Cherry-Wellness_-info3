// Batalha final no estilo Undertale: no turno do chefe você desvia com o
// coração; no seu turno, acerta uma pergunta sobre o site para causar dano.

const arena = document.getElementById('arena');
const bossEl = document.getElementById('boss');
const bossPalco = document.getElementById('boss-palco');
const bossHpFill = document.getElementById('boss-hp-fill');
const fala = document.getElementById('fala');
const falaTexto = document.getElementById('fala-texto');
const box = document.getElementById('battle-box');
const canvas = document.getElementById('campo');
const ctx = canvas.getContext('2d');
const narracao = document.getElementById('narracao');
const opcoesEl = document.getElementById('opcoes');
const hpFill = document.getElementById('hp-fill');
const hpTexto = document.getElementById('hp-texto');
const overlay = document.getElementById('feedback-overlay');
const tempoPergunta = document.getElementById('tempo-pergunta');
const tempoFill = document.getElementById('tempo-fill');
const buffsEl = document.getElementById('buffs');

// Perguntas tiradas das páginas do site. A primeira opção é sempre a certa;
// a ordem é embaralhada na hora de mostrar.
const PERGUNTAS = [
    // Prato & Saúde
    { pergunta: 'Quanto de frutas e vegetais por dia a OMS recomenda, no mínimo?', opcoes: ['400g', '100g', '1kg', '50g'] },
    { pergunta: 'Qual nutriente é a principal fonte de energia do corpo e do cérebro?', opcoes: ['Carboidratos', 'Proteínas', 'Sódio', 'Gordura trans'] },
    { pergunta: 'Qual o máximo de sal por dia recomendado pela OMS?', opcoes: ['5g', '15g', '25g', '40g'] },
    { pergunta: 'Qual é a principal função das proteínas?', opcoes: ['Construir e reparar tecidos', 'Dar energia rápida', 'Guardar água no corpo', 'Adoçar os alimentos'] },
    { pergunta: 'Onde encontramos gorduras boas (insaturadas)?', opcoes: ['Azeite, abacate e castanhas', 'Frituras e embutidos', 'Refrigerante', 'Biscoito recheado'] },
    { pergunta: 'A gordura saturada deve ficar abaixo de quanto das calorias do dia?', opcoes: ['10%', '30%', '50%', '75%'] },
    { pergunta: 'Quanta fibra por dia a OMS recomenda para adultos?', opcoes: ['Pelo menos 25g', 'No máximo 2g', 'Exatamente 5g', 'Nenhuma'] },
    { pergunta: 'Quantos adultos brasileiros viviam com obesidade em 2023?', opcoes: ['24,3%', '11,8%', '5%', '60%'] },
    { pergunta: 'Qual é uma troca mais saudável para o arroz branco refinado?', opcoes: ['Arroz integral', 'Macarrão instantâneo', 'Pão doce', 'Batata frita'] },
    { pergunta: 'O que os carboidratos complexos fazem?', opcoes: ['Liberam energia aos poucos', 'Dão energia só por 5 minutos', 'Aumentam o sal do sangue', 'Nada, são inúteis'] },
    { pergunta: 'Para que servem vitaminas e minerais?', opcoes: ['Regular as funções vitais', 'Substituir a água', 'Só dar sabor', 'Engordar'] },
    // Vida em movimento
    { pergunta: 'Quantos minutos por semana de atividade moderada a OMS recomenda?', opcoes: ['150 minutos', '30 minutos', '60 minutos', '500 minutos'] },
    { pergunta: 'E quantos minutos por semana de atividade vigorosa, como corrida?', opcoes: ['75 minutos', '10 minutos', '300 minutos', '20 minutos'] },
    { pergunta: 'Por que fazer aquecimento antes do treino?', opcoes: ['Para prevenir lesões', 'Para cansar mais rápido', 'Para perder a hidratação', 'Não serve para nada'] },
    { pergunta: 'O que um músculo hidratado tem a menos?', opcoes: ['Risco de cãibras', 'Força', 'Resistência', 'Circulação'] },
    { pergunta: 'Quantos adolescentes (11 a 17 anos) no mundo não se exercitam o suficiente?', opcoes: ['81%', '20%', '45%', '5%'] },
    { pergunta: 'Exercícios ajudam a prevenir quais doenças?', opcoes: ['Diabetes tipo 2 e hipertensão', 'Gripe e resfriado', 'Miopia e astigmatismo', 'Nenhuma doença'] },
    { pergunta: 'O que a atividade física faz pelos pulmões?', opcoes: ['Aumenta o fôlego', 'Diminui a capacidade respiratória', 'Nada', 'Deixa a respiração mais curta'] },
    { pergunta: 'Quantos adultos do mundo não atingem a atividade física recomendada?', opcoes: ['31%', '3%', '90%', '10%'] },
    // Bem-Estar mental
    { pergunta: 'Quantos adolescentes de 10 a 19 anos vivem com algum transtorno mental?', opcoes: ['1 em cada 7', '1 em cada 100', '1 em cada 2', 'Nenhum'] },
    { pergunta: 'Quantas pessoas no mundo convivem com transtornos de ansiedade?', opcoes: ['470 milhões', '4 mil', '47 mil', '8 bilhões'] },
    { pergunta: 'Técnicas de respiração ajudam a...', opcoes: ['Acalmar a mente e reduzir a ansiedade', 'Ficar mais agitado', 'Dormir menos', 'Esquecer as coisas'] },
    { pergunta: 'Fazer pausas das telas ajuda a...', opcoes: ['Reduzir o estresse e melhorar o foco', 'Ficar mais ansioso', 'Perder o sono', 'Nada'] },
    { pergunta: 'Quando algo está pesando demais, o que o site recomenda?', opcoes: ['Conversar com alguém de confiança', 'Guardar tudo para si', 'Ignorar o problema', 'Ficar no celular'] },
    { pergunta: 'Quantas pessoas com depressão recebem tratamento formal no mundo?', opcoes: ['1 em cada 3', 'Todas', '9 em cada 10', 'Nenhuma'] },
    { pergunta: 'Organizar pensamentos e tarefas ajuda a...', opcoes: ['Tomar decisões mais claras', 'Ficar mais confuso', 'Procrastinar', 'Esquecer prioridades'] }
];

const FALAS_ACERTO = [
    'Ugh... isso doeu mais que abdominal.',
    'Tá, tá, você leu o site. Grande coisa.',
    'Para de responder certo!!',
    'Eu só... precisava de uma caminhada...'
];

// Ações do menu AÇÕES: cada uma gasta o seu turno (você não ataca) e tem
// usos limitados por batalha (usosAcao, em DIFICULDADES).
const ACOES = [
    {
        id: 'comer',
        nome: 'Comer',
        efeito: () => `+${curaDeComer()} HP`,
        async usar() {
            const cura = Math.min(curaDeComer(), dificuldade.vida - vida);
            vida += cura;
            atualizarVida();
            await narrar(`* Você come um prato colorido, cheio de frutas e legumes. Recuperou ${cura} HP!`, 1100);
        }
    },
    {
        id: 'exercitar',
        nome: 'Exercitar',
        efeito: () => 'Coração mais rápido no próximo turno',
        async usar() {
            buffs.velocidade = true;
            atualizarBuffs();
            await narrar('* Você faz um aquecimento e se alonga. Seus reflexos ficam mais rápidos no próximo turno!', 1100);
        }
    },
    {
        id: 'meditar',
        nome: 'Meditar',
        efeito: () => 'Dobro de dano no próximo ataque',
        async usar() {
            buffs.foco = true;
            atualizarBuffs();
            await narrar('* Você respira fundo e medita. Seu próximo ataque vai causar o dobro de dano!', 1100);
        }
    }
];

const VELOCIDADE_EXERCICIO = 1.6;

const FALAS_ACAO = [
    'Ei! Nada de hábito saudável na minha frente!',
    'Isso aí não vai te salvar. ...Vai?',
    'Argh. Que cheiro de salada.'
];

const FALAS_ERRO = [
    'Hehe. Errou! Volta lá e lê de novo.',
    'Isso. Esquece tudo e vem pro sofá comigo.',
    'Informação que entra por um ouvido e sai pelo outro. Adoro.'
];

// Tamanho lógico do campo de desvio; o canvas é escalado pelo CSS.
const CAMPO = 240;
const BOSS_VIDA_MAX = 100;
const CORACAO_VEL = 150;
const CORACAO_RAIO = 5;
const EMOJI_RAIO = 8;
const FORMA_CORACAO = new Path2D('M0 6 C-2 4 -8 0 -8 -3 C-8 -6 -5 -8 -3 -8 C-1.5 -8 0 -7 0 -5 C0 -7 1.5 -8 3 -8 C5 -8 8 -6 8 -3 C8 0 2 4 0 6 Z');

// ritmo: multiplicador de velocidade dos ataques, que cresce a cada turno até ritmoMax.
// comboAbaixoDe / trioAbaixoDe: com o chefe nesse HP, vêm 2 ou 3 ataques juntos.
// tempoPergunta: limite para responder, em ms (0 = sem limite).
// curaAoErrar: quanto de HP o chefe recupera quando você erra.
// usosAcao: quantas vezes cada ação (comer, exercitar, meditar) pode ser usada.
const DIFICULDADES = {
    facil: {
        nome: 'Fácil', vida: 28, danoRecebido: 3, danoAcerto: 25, duracao: 7000, invencivel: 1100,
        ritmo: 0.8, ritmoPorTurno: 0.04, ritmoMax: 1.1, comboAbaixoDe: 0, trioAbaixoDe: 0,
        tempoPergunta: 0, curaAoErrar: 0, usosAcao: 3
    },
    medio: {
        nome: 'Médio', vida: 20, danoRecebido: 4, danoAcerto: 20, duracao: 8000, invencivel: 900,
        ritmo: 1, ritmoPorTurno: 0.07, ritmoMax: 1.5, comboAbaixoDe: 40, trioAbaixoDe: 0,
        tempoPergunta: 0, curaAoErrar: 0, usosAcao: 2
    },
    dificil: {
        nome: 'Difícil', vida: 20, danoRecebido: 5, danoAcerto: 20, duracao: 9000, invencivel: 750,
        ritmo: 1.2, ritmoPorTurno: 0.08, ritmoMax: 1.7, comboAbaixoDe: 60, trioAbaixoDe: 0,
        tempoPergunta: 0, curaAoErrar: 0, usosAcao: 2
    },
    impossivel: {
        nome: 'Impossível', vida: 12, danoRecebido: 4, danoAcerto: 10, duracao: 10000, invencivel: 500,
        ritmo: 1.45, ritmoPorTurno: 0.05, ritmoMax: 1.8, comboAbaixoDe: 100, trioAbaixoDe: 30,
        tempoPergunta: 7000, curaAoErrar: 10, usosAcao: 1
    }
};

let dificuldade = DIFICULDADES.medio;
let vida = dificuldade.vida;
let bossVida = BOSS_VIDA_MAX;
let turno = 0;
let acertos = 0;
let estado = 'inicio'; // inicio | dialogo | ataque | pergunta | fim
let coracao = { x: CAMPO / 2, y: CAMPO / 2 };
let projeteis = [];
let invencivelAte = 0;
let filaPerguntas = [];
let usosRestantes = {};
const buffs = { velocidade: false, foco: false };
const teclas = new Set();

const sortear = (lista) => lista[Math.floor(Math.random() * lista.length)];
const aleatorio = (min, max) => min + Math.random() * (max - min);
const esperar = (ms) => new Promise(r => setTimeout(r, ms));

function embaralhar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

function prepararCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = CAMPO * dpr;
    canvas.height = CAMPO * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// ---------- Diálogos ----------
// Um clique (ou Z/Enter) completa o texto que está sendo digitado ou pula a pausa.
let aoAvancar = null;

function avancar() {
    if (aoAvancar) aoAvancar();
}

function digitar(el, texto, msPorLetra = 32) {
    return new Promise(resolve => {
        let i = 0;
        el.textContent = '';
        const id = setInterval(() => {
            i++;
            el.textContent = texto.slice(0, i);
            if (i >= texto.length) fim();
        }, msPorLetra);
        function fim() {
            clearInterval(id);
            el.textContent = texto;
            aoAvancar = null;
            resolve();
        }
        aoAvancar = fim;
    });
}

function pausa(ms) {
    return new Promise(resolve => {
        const id = setTimeout(fim, ms);
        function fim() {
            clearTimeout(id);
            aoAvancar = null;
            resolve();
        }
        aoAvancar = fim;
    });
}

function modoCaixa(modo) {
    box.classList.remove('modo-texto', 'modo-ataque', 'modo-pergunta');
    box.classList.add(`modo-${modo}`);
    arena.classList.toggle('modo-ataque', modo === 'ataque');
}

async function narrar(texto, espera = 900) {
    estado = 'dialogo';
    modoCaixa('texto');
    await digitar(narracao, texto);
    await pausa(espera);
}

async function falaBoss(texto, espera = 1100) {
    estado = 'dialogo';
    fala.classList.add('visivel');
    await digitar(falaTexto, texto, 38);
    await pausa(espera);
}

function esconderFala() {
    fala.classList.remove('visivel');
    falaTexto.textContent = '';
}

// ---------- Padrões de ataque do chefe ----------
function emoji(simbolo, x, y, vx, vy) {
    return { tipo: 'emoji', simbolo, x, y, vx, vy };
}

function barra(x, y, w, h, vx) {
    return { tipo: 'barra', x, y, w, h, vx, vy: 0 };
}

const PADROES = {
    chuvaDoce: {
        frase: '* Começa a chover açúcar.',
        criar(ritmo) {
            let timer = 0;
            return (dt) => {
                timer += dt;
                const intervalo = 330 / ritmo;
                while (timer >= intervalo) {
                    timer -= intervalo;
                    projeteis.push(emoji(sortear(['🍩', '🍬', '🍭']), aleatorio(10, CAMPO - 10), -12,
                        aleatorio(-15, 15), aleatorio(85, 125) * ritmo));
                }
            };
        }
    },
    paredesSofa: {
        frase: '* O sofá tenta te prender.',
        criar(ritmo) {
            // Paredes com um vão, como os ossos do Sans
            let timer = 700;
            let lado = 1;
            return (dt) => {
                timer += dt;
                if (timer < 1100 / ritmo) return;
                timer = 0;
                lado *= -1;
                const vao = 64;
                const vaoY = aleatorio(16, CAMPO - 16 - vao);
                const x = lado > 0 ? -12 : CAMPO;
                const vx = 105 * ritmo * lado;
                projeteis.push(barra(x, 0, 12, vaoY, vx));
                projeteis.push(barra(x, vaoY + vao, 12, CAMPO - vaoY - vao, vx));
            };
        }
    },
    miraFastFood: {
        frase: '* Cheiro de fritura no ar...',
        criar(ritmo) {
            let timer = 0;
            return (dt) => {
                timer += dt;
                if (timer < 600 / ritmo) return;
                timer = 0;
                const borda = Math.floor(Math.random() * 4);
                const x = borda === 0 ? -12 : borda === 1 ? CAMPO + 12 : aleatorio(0, CAMPO);
                const y = borda === 2 ? -12 : borda === 3 ? CAMPO + 12 : aleatorio(0, CAMPO);
                const angulo = Math.atan2(coracao.y - y, coracao.x - x);
                const v = 115 * ritmo;
                projeteis.push(emoji(sortear(['🍔', '🍟', '🌭']), x, y, Math.cos(angulo) * v, Math.sin(angulo) * v));
            };
        }
    },
    tempoDeTela: {
        frase: '* 99+ notificações.',
        criar(ritmo) {
            let timer = 0;
            let lado = 1;
            return (dt) => {
                timer += dt;
                if (timer < 420 / ritmo) return;
                timer = 0;
                lado *= -1;
                const p = emoji(sortear(['📱', '🔔']), lado > 0 ? -12 : CAMPO + 12, aleatorio(20, CAMPO - 20),
                    100 * ritmo * lado, 0);
                p.onda = { base: p.y, amp: aleatorio(14, 30), freq: aleatorio(2, 4), t: Math.random() * 6 };
                projeteis.push(p);
            };
        }
    }
};

const ORDEM_PADROES = ['chuvaDoce', 'paredesSofa', 'miraFastFood', 'tempoDeTela'];

// Os primeiros turnos apresentam cada ataque; depois são sorteados. Conforme o
// chefe perde vida (ou desde o início, no Impossível) vêm ataques juntos.
function escolherPadroes() {
    const quantidade = bossVida <= dificuldade.trioAbaixoDe ? 3
        : bossVida <= dificuldade.comboAbaixoDe ? 2 : 1;
    if (quantidade === 1 && turno < ORDEM_PADROES.length) return [ORDEM_PADROES[turno]];
    return embaralhar(ORDEM_PADROES).slice(0, quantidade);
}

// ---------- Turno do chefe (desvio) ----------
let ataque = null;

function faseAtaque(nomes) {
    return new Promise(resolve => {
        estado = 'ataque';
        esconderFala();
        modoCaixa('ataque');
        prepararCanvas();
        coracao = { x: CAMPO / 2, y: CAMPO / 2 };
        projeteis = [];
        teclas.clear();

        const ritmoBase = Math.min(dificuldade.ritmo + turno * dificuldade.ritmoPorTurno, dificuldade.ritmoMax);
        // Ataques juntos ficam um pouco mais lentos, senão não haveria como passar
        const ritmo = ritmoBase * [1, 1, 0.85, 0.75][nomes.length];
        ataque = {
            tempo: 0,
            ultimo: null,
            atualizadores: nomes.map(n => PADROES[n].criar(ritmo)),
            velocidade: buffs.velocidade ? VELOCIDADE_EXERCICIO : 1,
            fim: resolve
        };
        requestAnimationFrame(loop);
    });
}

function loop(t) {
    if (!ataque) return;
    if (ataque.ultimo === null) ataque.ultimo = t;
    const dtMs = Math.min(t - ataque.ultimo, 50);
    ataque.ultimo = t;
    ataque.tempo += dtMs;

    moverCoracao(dtMs / 1000);
    ataque.atualizadores.forEach(atualizar => atualizar(dtMs));
    moverProjeteis(dtMs / 1000);
    checarColisoes(t);
    desenhar(t);

    if (vida <= 0 || ataque.tempo >= dificuldade.duracao) {
        const fim = ataque.fim;
        ataque = null;
        buffs.velocidade = false; // o exercício vale só para um turno
        atualizarBuffs();
        fim();
        return;
    }
    requestAnimationFrame(loop);
}

function limitarCoracao() {
    coracao.x = Math.max(8, Math.min(CAMPO - 8, coracao.x));
    coracao.y = Math.max(8, Math.min(CAMPO - 8, coracao.y));
}

function moverCoracao(dt) {
    let dx = 0;
    let dy = 0;
    if (teclas.has('esquerda')) dx -= 1;
    if (teclas.has('direita')) dx += 1;
    if (teclas.has('cima')) dy -= 1;
    if (teclas.has('baixo')) dy += 1;
    if (dx && dy) {
        dx *= Math.SQRT1_2;
        dy *= Math.SQRT1_2;
    }
    const velocidade = CORACAO_VEL * ataque.velocidade;
    coracao.x += dx * velocidade * dt;
    coracao.y += dy * velocidade * dt;
    limitarCoracao();
}

function moverProjeteis(dt) {
    for (let i = projeteis.length - 1; i >= 0; i--) {
        const p = projeteis[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.onda) {
            p.onda.t += dt;
            p.y = p.onda.base + Math.sin(p.onda.t * p.onda.freq) * p.onda.amp;
        }
        const largura = p.w || 0;
        const fora = p.x < -40 - largura || p.x > CAMPO + 40 || p.y < -40 || p.y > CAMPO + 40;
        if (fora) projeteis.splice(i, 1);
    }
}

function encosta(p) {
    if (p.tipo === 'emoji') {
        return Math.hypot(p.x - coracao.x, p.y - coracao.y) < EMOJI_RAIO + CORACAO_RAIO;
    }
    const px = Math.max(p.x, Math.min(coracao.x, p.x + p.w));
    const py = Math.max(p.y, Math.min(coracao.y, p.y + p.h));
    return Math.hypot(px - coracao.x, py - coracao.y) < CORACAO_RAIO;
}

function checarColisoes(t) {
    if (t < invencivelAte) return;
    if (!projeteis.some(encosta)) return;

    vida = Math.max(0, vida - dificuldade.danoRecebido);
    invencivelAte = t + dificuldade.invencivel;
    atualizarVida();
    box.classList.remove('tremer');
    void box.offsetWidth; // reinicia a animação
    box.classList.add('tremer');
}

function desenhar(t) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CAMPO, CAMPO);

    ctx.font = '18px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    projeteis.forEach(p => {
        if (p.tipo === 'emoji') {
            ctx.fillText(p.simbolo, p.x, p.y);
        } else {
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(p.x, p.y, p.w, p.h, 5);
            else ctx.rect(p.x, p.y, p.w, p.h);
            ctx.fill();
        }
    });

    // Pisca enquanto está invencível depois de levar dano
    const piscando = t < invencivelAte && Math.floor(t / 80) % 2 === 0;
    if (!piscando) {
        ctx.save();
        ctx.translate(coracao.x, coracao.y + 1);
        ctx.fillStyle = '#FF1A1A';
        ctx.fill(FORMA_CORACAO);
        ctx.restore();
    }
}

function curaDeComer() {
    return Math.ceil(dificuldade.vida / 2);
}

function atualizarBuffs() {
    buffsEl.innerHTML = '';
    if (buffs.velocidade) buffsEl.insertAdjacentHTML('beforeend', '<span class="buff">VEL+</span>');
    if (buffs.foco) buffsEl.insertAdjacentHTML('beforeend', '<span class="buff">FOCO x2</span>');
}

function atualizarVida() {
    hpFill.style.width = (vida / dificuldade.vida) * 100 + '%';
    hpTexto.textContent = `${vida} / ${dificuldade.vida}`;
}

// ---------- Turno do jogador ----------
let perguntaAtual = null;

// Mostra opções na caixa e devolve o índice escolhido. Cada item pode ter uma
// descrição (linha menor) e vir desabilitado. -1 = o tempo acabou.
function escolherOpcao(itens) {
    return new Promise(resolve => {
        opcoesEl.innerHTML = '';
        const botoes = itens.map((item, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'opcao';
            btn.disabled = !!item.desabilitado;
            btn.classList.toggle('sem-usos', !!item.desabilitado);
            btn.innerHTML = '<span class="opcao-nome"></span>';
            btn.firstChild.textContent = item.texto;
            if (item.descricao) {
                const desc = document.createElement('span');
                desc.className = 'opcao-desc';
                desc.textContent = item.descricao;
                btn.appendChild(desc);
            }
            btn.addEventListener('mouseenter', () => selecionar(i));
            btn.addEventListener('click', () => escolher(i));
            opcoesEl.appendChild(btn);
            return btn;
        });

        function escolher(i) {
            if (estado !== 'pergunta') return;
            if (i >= 0 && (i >= botoes.length || botoes[i].disabled)) return;
            estado = 'dialogo';
            perguntaAtual = null;
            botoes.forEach(b => (b.disabled = true));
            resolve({ i, botoes });
        }

        perguntaAtual = { botoes, selecionada: 0, responder: escolher };
        selecionar(Math.max(0, botoes.findIndex(b => !b.disabled)));
        estado = 'pergunta';
    });
}

async function menuPrincipal() {
    estado = 'dialogo';
    modoCaixa('pergunta');
    opcoesEl.innerHTML = '';
    await digitar(narracao, '* Sua vez! O que você vai fazer?', 22);
    const semAcoes = ACOES.every(acao => usosRestantes[acao.id] === 0);
    const { i } = await escolherOpcao([
        { texto: 'LUTAR', descricao: 'Acerte uma pergunta para atacar' },
        semAcoes
            ? { texto: 'AÇÕES', descricao: 'Nenhuma ação restante', desabilitado: true }
            : { texto: 'AÇÕES', descricao: 'Comer, exercitar ou meditar' }
    ]);
    return i === 0 ? 'lutar' : 'acoes';
}

async function menuAcoes() {
    narracao.textContent = '* Qual hábito saudável você vai usar?';
    const itens = ACOES.map(acao => {
        const restantes = usosRestantes[acao.id];
        return {
            texto: acao.nome,
            descricao: `${acao.efeito()} · ${restantes === 1 ? '1 uso' : restantes + ' usos'}`,
            desabilitado: restantes === 0
        };
    });
    itens.push({ texto: 'Voltar', descricao: 'Voltar ao menu' });
    const { i } = await escolherOpcao(itens);
    return ACOES[i] || null;
}

// Devolve a ação escolhida, ou null para lutar. "Voltar" nas ações volta ao menu.
async function turnoJogador() {
    while (true) {
        const escolha = await menuPrincipal();
        if (escolha === 'lutar') return null;
        const acao = await menuAcoes();
        if (acao) return acao;
    }
}

function proximaPergunta() {
    if (filaPerguntas.length === 0) filaPerguntas = embaralhar(PERGUNTAS);
    return filaPerguntas.pop();
}

async function fasePergunta() {
    const q = proximaPergunta();
    const opcoes = embaralhar(q.opcoes.map((texto, i) => ({ texto, certa: i === 0 })));

    estado = 'dialogo';
    modoCaixa('pergunta');
    opcoesEl.innerHTML = '';
    await digitar(narracao, '* ' + q.pergunta, 22);

    const escolha = escolherOpcao(opcoes);

    // Tempo limite: a barra esvazia e, se chegar ao fim, conta como erro (-1)
    let limite = null;
    if (dificuldade.tempoPergunta) {
        const pergunta = perguntaAtual;
        tempoPergunta.classList.add('ativo');
        tempoFill.style.transition = 'none';
        tempoFill.style.width = '100%';
        void tempoFill.offsetWidth;
        tempoFill.style.transition = `width ${dificuldade.tempoPergunta}ms linear`;
        tempoFill.style.width = '0%';
        limite = setTimeout(() => pergunta.responder(-1), dificuldade.tempoPergunta);
    }

    const { i, botoes } = await escolha;
    clearTimeout(limite);
    tempoPergunta.classList.remove('ativo');
    const correta = opcoes.findIndex(o => o.certa);
    botoes[correta].classList.add('is-certa');
    if (i !== correta && i >= 0) botoes[i].classList.add('is-errada');
    await esperar(900);
    return { acertou: i === correta, esgotou: i === -1, correta: opcoes[correta].texto };
}

function selecionar(i) {
    if (!perguntaAtual || perguntaAtual.botoes[i].disabled) return;
    perguntaAtual.selecionada = i;
    perguntaAtual.botoes.forEach((b, j) => b.classList.toggle('selecionada', j === i));
}

// Opções em grade de 2 colunas: setas andam na grade, Z/Enter/Espaço confirmam
function navegarOpcoes(tecla) {
    const i = perguntaAtual.selecionada;
    const umaColuna = getComputedStyle(opcoesEl).gridTemplateColumns.split(' ').length === 1;
    const passoLinha = umaColuna ? 1 : 2;
    const movimentos = {
        esquerda: umaColuna ? -1 : (i % 2 === 1 ? -1 : 0),
        direita: umaColuna ? 1 : (i % 2 === 0 ? 1 : 0),
        cima: -passoLinha,
        baixo: passoLinha
    };
    const passo = movimentos[tecla] || 0;
    let novo = i + passo;
    while (passo && novo >= 0 && novo < perguntaAtual.botoes.length && perguntaAtual.botoes[novo].disabled) novo += passo;
    if (novo >= 0 && novo < perguntaAtual.botoes.length) selecionar(novo);
}

// ---------- Efeitos no chefe ----------
function mostrarNumero(texto, miss) {
    const n = document.createElement('span');
    n.className = 'numero-dano' + (miss === 'cura' ? ' is-cura' : miss ? ' is-miss' : '');
    n.textContent = texto;
    bossPalco.appendChild(n);
    setTimeout(() => n.remove(), 900);
}

function atualizarVidaBoss() {
    bossHpFill.style.width = (bossVida / BOSS_VIDA_MAX) * 100 + '%';
}

async function atacarBoss(dano) {
    const corte = document.createElement('div');
    corte.className = 'corte';
    bossEl.appendChild(corte);
    await esperar(400);
    corte.remove();

    bossVida = Math.max(0, bossVida - dano);
    atualizarVidaBoss();
    bossEl.classList.remove('levou-dano');
    void bossEl.offsetWidth;
    bossEl.classList.add('levou-dano');
    mostrarNumero(dano, false);
    await esperar(900);
}

// ---------- Fluxo da batalha ----------
async function batalha() {
    await narrar('* A Cereja Podre bloqueia o caminho.', 700);
    await falaBoss('Heh. Então você juntou os três emblemas...');
    await falaBoss('Eu vivo de sofá, fritura e celular até as 3 da manhã.');
    await falaBoss('Quero ver se você aprendeu mesmo.');
    if (dificuldade === DIFICULDADES.impossivel) {
        await falaBoss('Impossível, é? Heh. Você não vai nem ver o sofá chegando.');
    }

    while (true) {
        const padroes = escolherPadroes();
        esconderFala();
        await narrar(PADROES[padroes[0]].frase, 500);
        await faseAtaque(padroes);
        turno++;
        if (vida <= 0) return derrota();

        const acao = await turnoJogador();
        if (acao) {
            usosRestantes[acao.id]--;
            await acao.usar();
            await falaBoss(sortear(FALAS_ACAO));
            continue;
        }

        const resposta = await fasePergunta();
        // A meditação vale para a próxima tentativa, acertando ou não
        const dano = dificuldade.danoAcerto * (buffs.foco ? 2 : 1);
        buffs.foco = false;
        atualizarBuffs();

        if (resposta.acertou) {
            acertos++;
            await atacarBoss(dano);
            if (bossVida <= 0) return vitoria();
            await falaBoss(sortear(FALAS_ACERTO));
        } else {
            mostrarNumero('MISS', true);
            const motivo = resposta.esgotou ? 'O tempo acabou!' : 'Você errou o ataque!';
            await narrar(`* ${motivo} A resposta era: ${resposta.correta}.`, 1500);
            if (dificuldade.curaAoErrar && bossVida < BOSS_VIDA_MAX) {
                bossVida = Math.min(BOSS_VIDA_MAX, bossVida + dificuldade.curaAoErrar);
                atualizarVidaBoss();
                mostrarNumero('+' + dificuldade.curaAoErrar, 'cura');
                await falaBoss('Nhac. Um salgadinho pra recuperar as forças.');
            } else {
                await falaBoss(sortear(FALAS_ERRO));
            }
        }
    }
}

async function vitoria() {
    await falaBoss('Tá bom... você venceu. Acho que vou... beber uma água.', 1400);
    esconderFala();
    bossEl.classList.add('derrotado');
    await narrar('* A Cereja Podre foi embora fazer uma caminhada.', 1200);
    estado = 'fim';
    localStorage.setItem('emblemaFinal', 'ganhou');
    if (dificuldade === DIFICULDADES.impossivel) localStorage.setItem('emblemaImpossivel', 'ganhou');
    mostrarTelaResultado(overlay, {
        vitoria: true,
        titulo: dificuldade === DIFICULDADES.impossivel ? 'O impossível aconteceu!' : 'Você venceu!',
        mensagem: `A Cereja Podre caiu no modo ${dificuldade.nome} com <strong>${acertos} acertos</strong> e ${vida} de HP sobrando. Emblema da Batalha Final conquistado!`
    });
}

async function derrota() {
    await esperar(400);
    estado = 'fim';
    mostrarTelaResultado(overlay, {
        vitoria: false,
        titulo: 'Não desista!',
        mensagem: `Você deixou a Cereja Podre com <strong>${bossVida} de HP</strong> no modo ${dificuldade.nome}. Mantenha sua determinação e tente de novo!`
    });
}

// ---------- Controles ----------
const MAPA_TECLAS = {
    ArrowLeft: 'esquerda', a: 'esquerda', A: 'esquerda',
    ArrowRight: 'direita', d: 'direita', D: 'direita',
    ArrowUp: 'cima', w: 'cima', W: 'cima',
    ArrowDown: 'baixo', s: 'baixo', S: 'baixo'
};
const TECLAS_CONFIRMAR = ['Enter', ' ', 'z', 'Z'];

window.addEventListener('keydown', (e) => {
    const direcao = MAPA_TECLAS[e.key];
    const confirmar = TECLAS_CONFIRMAR.includes(e.key);
    if (estado === 'inicio' || estado === 'fim') return;
    if (direcao || confirmar) e.preventDefault(); // não rola a página durante a luta

    if (estado === 'ataque' && direcao) teclas.add(direcao);
    else if (estado === 'pergunta' && perguntaAtual) {
        if (direcao) navegarOpcoes(direcao);
        else if (confirmar && !e.repeat) perguntaAtual.responder(perguntaAtual.selecionada);
        else if (['1', '2', '3', '4'].includes(e.key)) perguntaAtual.responder(Number(e.key) - 1);
    } else if (estado === 'dialogo' && confirmar && !e.repeat) avancar();
});

window.addEventListener('keyup', (e) => {
    const direcao = MAPA_TECLAS[e.key];
    if (direcao) teclas.delete(direcao);
});

arena.addEventListener('click', () => {
    if (estado === 'dialogo') avancar();
});

// Toque/mouse: arrastar em qualquer lugar da arena move o coração na mesma
// distância, para o dedo não tampar o coração.
let arrasto = null;

arena.addEventListener('pointerdown', (e) => {
    if (estado !== 'ataque') return;
    arrasto = { x: e.clientX, y: e.clientY };
});

window.addEventListener('pointermove', (e) => {
    if (!arrasto || estado !== 'ataque') return;
    const escala = canvas.clientWidth / CAMPO;
    coracao.x += (e.clientX - arrasto.x) / escala;
    coracao.y += (e.clientY - arrasto.y) / escala;
    arrasto = { x: e.clientX, y: e.clientY };
    limitarCoracao();
});

['pointerup', 'pointercancel'].forEach(evento => window.addEventListener(evento, () => (arrasto = null)));

// Direcional na tela (celular): segurar um botão é como segurar a seta do
// teclado. No menu e nas perguntas, cada toque anda uma opção.
document.querySelectorAll('.dpad-btn').forEach(btn => {
    const direcao = btn.dataset.dir;
    const soltar = () => {
        teclas.delete(direcao);
        btn.classList.remove('pressionado');
    };

    btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation(); // não começa um arrasto na arena
        btn.setPointerCapture(e.pointerId);
        btn.classList.add('pressionado');
        if (estado === 'ataque') teclas.add(direcao);
        else if (estado === 'pergunta' && perguntaAtual) navegarOpcoes(direcao);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(evento => btn.addEventListener(evento, soltar));
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
});

// ---------- Início ----------
const temTodosEmblemas = ['emblemaPrato', 'emblemaMovimento', 'emblemaMental']
    .every(chave => localStorage.getItem(chave) === 'ganhou');

if (!temTodosEmblemas) {
    overlay.innerHTML = `
        <span class="overlay-kicker">Bloqueado</span>
        <h2>Ainda não!</h2>
        <p>Conquiste os três emblemas (Prato Saudável, Ritmo em Movimento e Bem-Estar Mental) para enfrentar o chefe final.</p>
        <div class="resultado-acoes"><a href="emblemas.html" class="btn-game">Ver meus emblemas</a></div>`;
} else {
    overlay.querySelectorAll('[data-nivel]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // senão o mesmo clique pularia a primeira fala
            dificuldade = DIFICULDADES[btn.dataset.nivel];
            vida = dificuldade.vida;
            ACOES.forEach(acao => (usosRestantes[acao.id] = dificuldade.usosAcao));
            overlay.style.display = 'none';
            atualizarVida();
            batalha();
        });
    });
}
