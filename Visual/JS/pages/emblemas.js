/* =====================================================================
   emblemas.js — Página "Emblemas & Minijogos" 🏅
   ---------------------------------------------------------------------
   Usado em: emblemas.html
   Depende de: JS/progresso.js, JS/desafio-secreto.js e JS/reveal.js

   Aqui a gente monta a "estante de troféus" da pessoa:
   • um card para cada emblema que ela já conquistou;
   • uma barrinha mostrando quantos dos 3 ela já tem;
   • com os 3, aparece o card da Batalha Final (e, se ela já venceu
     no Difícil/Impossível, o botão do Desafio secreto).
   ===================================================================== */

// Os emblemas dos minijogos. Para criar um emblema novo no futuro,
// basta adicionar um item aqui (e a chave em JS/progresso.js).
const EMBLEMAS = [
    {
        id: 'prato',
        img: 'IMG/Emblemas/Masterchef.png',
        titulo: 'Prato Saudável',
        descricao: 'Concedido por montar um prato nutricionalmente balanceado com 80% ou mais de aproveitamento saudável.',
        jogo: 'jogo-prato.html',
        nomeJogo: 'Monte seu Prato'
    },
    {
        id: 'movimento',
        img: 'IMG/Emblemas/Ritmo.png',
        titulo: 'Ritmo em Movimento',
        descricao: 'Concedido por manter a agilidade e acompanhar a aceleração do ritmo no jogo de movimento!',
        jogo: 'jogo-ritmo.html',
        nomeJogo: 'Ritmo em Movimento'
    },
    {
        id: 'mental',
        img: 'IMG/Emblemas/Respiracao.png',
        titulo: 'Bem-Estar Mental',
        descricao: 'Concedido por manter o ritmo da respiração e encher a barra de fôlego no jogo Respire e Recarregue.',
        jogo: 'jogo-respiracao.html',
        nomeJogo: 'Respire e Recarregue'
    }
];

// Monta o HTML de um card de emblema conquistado
function cardEmblema(emblema) {
    return `
        <div class="emblema-card" data-reveal="scale">
            <div class="emblema-img-area">
                <img src="${emblema.img}" alt="${emblema.titulo}">
            </div>
            <h3 class="emblema-titulo">${emblema.titulo}</h3>
            <p class="emblema-descricao">${emblema.descricao}</p>
            <a href="${emblema.jogo}" class="btn-primary">Visitar Jogo</a>
        </div>`;
}

// Card especial da Batalha Final (só aparece com os 3 emblemas)
function cardChefe() {
    const venceuChefe = CherryProgresso.ganhou('final');
    const venceuImpossivel = CherryProgresso.ganhou('impossivel');

    // O texto muda conforme a pessoa avança: ainda não lutou → venceu → venceu no Impossível
    let descricao = 'Você conquistou os três emblemas. Desvie dos ataques da Cereja Podre e acerte as perguntas para derrotá-la!';
    if (venceuChefe) {
        descricao = venceuImpossivel
            ? 'Você derrotou a Cereja Podre até no modo Impossível. Lenda do bem-estar!'
            : 'Você derrotou a Cereja Podre usando tudo o que aprendeu no site. Que tal tentar o modo Impossível?';
    }

    return `
        <div class="emblema-card emblema-card--boss" data-reveal="scale">
            <div class="emblema-img-area">
                <svg viewBox="-10 -10 20 18" width="110" height="100" aria-hidden="true">
                    <path d="M0 6 C-2 4 -8 0 -8 -3 C-8 -6 -5 -8 -3 -8 C-1.5 -8 0 -7 0 -5 C0 -7 1.5 -8 3 -8 C5 -8 8 -6 8 -3 C8 0 2 4 0 6 Z" fill="#FF1A1A"></path>
                </svg>
            </div>
            <h3 class="emblema-titulo">${venceuChefe ? 'Chefe Derrotado' : 'Batalha Final'}</h3>
            <p class="emblema-descricao">${descricao}</p>
            <a href="jogo-boss.html" class="btn-primary">${venceuChefe ? 'Revanche' : 'Enfrentar o chefe'}</a>
            ${desafioLiberado() ? '<button type="button" class="btn-primary desafio-abrir">Desafio secreto</button>' : ''}
        </div>`;
}

// Barrinha "Você já tem X de 3 cerejas", com uma frase de incentivo
function barraDeProgresso(total) {
    const frases = [
        'Toda jornada começa com o primeiro passo. Escolha um jogo e bora! 🍒',
        'Primeira cereja no cesto! Continue assim. 🍒',
        'Falta só uma! Você está quase lá. 🍒🍒',
        'Cesto cheio! A Cereja Podre que se cuide. 🍒🍒🍒'
    ];
    const porcentagem = Math.round((total / EMBLEMAS.length) * 100);
    return `
        <div class="progresso-emblemas" data-reveal="up">
            <p class="progresso-emblemas-texto"><strong>${total} de ${EMBLEMAS.length}</strong> emblemas conquistados</p>
            <div class="progresso-emblemas-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${EMBLEMAS.length}" aria-valuenow="${total}">
                <div style="width: ${porcentagem}%"></div>
            </div>
            <p class="progresso-emblemas-frase">${frases[total]}</p>
        </div>`;
}

document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('container-conquistas');
    const progresso = document.getElementById('progresso-emblemas');

    const conquistados = EMBLEMAS.filter(e => CherryProgresso.ganhou(e.id));

    // A barra fica num espaço próprio acima dos cards
    if (progresso) progresso.innerHTML = barraDeProgresso(conquistados.length);

    let htmlFinal = conquistados.map(cardEmblema).join('');

    // Com os três emblemas, libera a batalha final contra a Cereja Podre
    if (CherryProgresso.temTodosBase()) htmlFinal += cardChefe();

    // Nenhum emblema ainda? Em vez de uma tela vazia, mostramos por onde começar
    if (conquistados.length === 0) {
        const sugestoes = EMBLEMAS
            .map(e => `<a href="${e.jogo}" class="btn-primary">${e.nomeJogo}</a>`)
            .join('');
        htmlFinal = `
            <div class="sem-emblemas" data-reveal="up">
                <p>Seu cesto de cerejas ainda está vazinho — mas isso é só o começo!</p>
                <p>Escolha um minijogo para conquistar seu primeiro emblema:</p>
                <div class="sem-emblemas-jogos">${sugestoes}</div>
            </div>`;
    }

    container.innerHTML = htmlFinal;

    // O botão do desafio é criado agora, então ligamos o clique depois
    const botaoDesafio = container.querySelector('.desafio-abrir');
    if (botaoDesafio) botaoDesafio.addEventListener('click', abrirDesafioSecreto);

    // Avisa o reveal.js que tem cards novos para animar
    if (window.CherryReveal) window.CherryReveal.refresh();
});
