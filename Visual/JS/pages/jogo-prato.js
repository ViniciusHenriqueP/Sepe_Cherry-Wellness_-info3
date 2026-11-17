/* =====================================================================
   jogo-prato.js — Minijogo "Monte seu Prato" 🍽️
   ---------------------------------------------------------------------
   Usado em: jogo-prato.html   (depende de JS/progresso.js)

   A ideia: a pessoa arrasta até 4 alimentos para o prato e clica em
   "Calcular". Cada alimento vale pontos (os naturais valem mais, os
   industrializados tiram pontos). Com 80% ou mais de "saudável", ela
   ganha o Emblema do Prato Saudável.

   Funciona com mouse (computador) e com o dedo (celular).
   ===================================================================== */

// ----- Pegando os elementos da página -----
const emojis = document.querySelectorAll('.emoji-arrastavel');
const prato = document.getElementById('prato-alvo');
const gradeComidas = document.getElementById('comidas-grid');
const contador = document.getElementById('prato-contador');
const aviso = document.getElementById('prato-aviso');
const areaResultado = document.getElementById('area-resultado');
const painel = document.getElementById('resultado-painel');

// ----- Regras do jogo -----
const MAX_ITENS = 4; // cabe no máximo 4 alimentos no prato
const AVISO_PADRAO = 'Toque em um alimento no prato para tirá-lo.';

// Cada alimento começa a ser arrastado ao clicar (mouse) ou tocar (dedo)
emojis.forEach(emoji => {
    emoji.addEventListener('mousedown', iniciarArrasto);
    emoji.addEventListener('touchstart', iniciarArrasto, { passive: false });
});

// Lista o que já está no prato agora
function itensNoPrato() {
    return prato.querySelectorAll('.comida-no-prato');
}

// Mensagem abaixo do prato, no lugar dos alert() do navegador
function mostrarAviso(texto, alerta) {
    aviso.textContent = texto;
    aviso.classList.remove('is-alerta');
    if (alerta) {
        void aviso.offsetWidth; // reinicia a animação
        aviso.classList.add('is-alerta');
    }
}

// Atualiza o "2/4 itens", trava a grade quando enche e mostra a dica
// "Arraste até 4 itens" quando o prato está vazio
function atualizarContador() {
    const total = itensNoPrato().length;
    contador.textContent = `${total}/${MAX_ITENS} itens`;
    contador.classList.toggle('is-cheio', total >= MAX_ITENS);
    gradeComidas.classList.toggle('is-bloqueado', total >= MAX_ITENS);

    const textoAjuda = document.getElementById('texto-ajuda');
    if (total === 0 && !textoAjuda) {
        const novo = document.createElement('p');
        novo.id = 'texto-ajuda';
        novo.className = 'texto-ajuda';
        novo.innerText = 'Arraste até 4 itens para cá!';
        prato.appendChild(novo);
    } else if (total > 0 && textoAjuda) {
        textoAjuda.remove();
    }
}

// Se a pessoa mudou o prato, o resultado antigo não vale mais
function esconderResultado() {
    areaResultado.hidden = true;
}

// ----- Arrastar e soltar -----
// Faz o alimento "grudar" no cursor/dedo até a pessoa soltar.
// Se soltar em cima do prato, ele entra no prato.
function iniciarArrasto(e) {
    e.preventDefault();

    if (itensNoPrato().length >= MAX_ITENS) {
        mostrarAviso('Seu prato já tem 4 itens! Tire um para trocar.', true);
        return;
    }

    const emoji = e.target;
    const rectInicial = emoji.getBoundingClientRect();

    document.body.classList.add('arrastando');
    emoji.style.position = 'fixed';
    emoji.style.zIndex = '1000';
    moverNaTela(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);

    // O ponto (x, y) está em cima do prato?
    function dentroDoPrato(x, y) {
        const rectPrato = prato.getBoundingClientRect();
        return x >= rectPrato.left && x <= rectPrato.right && y >= rectPrato.top && y <= rectPrato.bottom;
    }

    // Move o alimento junto com o cursor e acende o prato quando ele passa por cima
    function moverNaTela(x, y) {
        emoji.style.left = (x - rectInicial.width / 2) + 'px';
        emoji.style.top = (y - rectInicial.height / 2) + 'px';
        prato.classList.toggle('prato-atencao', dentroDoPrato(x, y));
    }

    function aoMover(evento) {
        moverNaTela(evento.clientX || evento.touches[0].clientX, evento.clientY || evento.touches[0].clientY);
    }

    // Soltou: para de ouvir o movimento e decide se o alimento entra no prato
    function aoSoltar(evento) {
        document.removeEventListener('mousemove', aoMover);
        document.removeEventListener('mouseup', aoSoltar);
        document.removeEventListener('touchmove', aoMover);
        document.removeEventListener('touchend', aoSoltar);

        prato.classList.remove('prato-atencao');
        document.body.classList.remove('arrastando');

        const xFinal = evento.clientX || (evento.changedTouches ? evento.changedTouches[0].clientX : 0);
        const yFinal = evento.clientY || (evento.changedTouches ? evento.changedTouches[0].clientY : 0);

        if (dentroDoPrato(xFinal, yFinal)) {
            adicionarAoPrato(emoji);
        }
        emoji.style.position = '';
        emoji.style.zIndex = '';
        emoji.style.left = '';
        emoji.style.top = '';
    }

    document.addEventListener('mousemove', aoMover);
    document.addEventListener('mouseup', aoSoltar);
    document.addEventListener('touchmove', aoMover, { passive: false });
    document.addEventListener('touchend', aoSoltar);
}

// Coloca uma cópia do alimento no prato
function adicionarAoPrato(emoji) {
    const nome = emoji.closest('.comida-card').querySelector('span').textContent;

    // Cada item no prato é um botão: tocar nele tira o alimento
    const novoItem = document.createElement('button');
    novoItem.type = 'button';
    novoItem.classList.add('comida-no-prato');
    novoItem.innerText = emoji.innerText;
    novoItem.dataset.comida = emoji.id;
    novoItem.setAttribute('aria-label', `Tirar ${nome} do prato`);
    novoItem.addEventListener('click', () => tirarDoPrato(novoItem));
    prato.appendChild(novoItem);

    esconderResultado();
    mostrarAviso(AVISO_PADRAO, false);
    atualizarContador();
}

// Tira o alimento com uma animaçãozinha de saída (200ms)
function tirarDoPrato(item) {
    if (item.classList.contains('is-saindo')) return;
    item.classList.add('is-saindo');
    esconderResultado();
    setTimeout(() => {
        item.remove();
        atualizarContador();
    }, 200);
}

// ----- O cálculo -----
// Soma os pontos de cada alimento e transforma em porcentagem.
// O prato "perfeito" (alface + frango + arroz + azeite) soma 80 pontos = 100%.
function calcularSaude() {
    let pontosTotais = 0;
    // Pontos de cada alimento: positivos fazem bem, negativos atrapalham
    const valoresNutricionais = {
        'alface': 25, 'file-frango': 20, 'arroz': 15, 'azeite': 20, 'linguica': -10, 'refrigerante': -20
    };

    const comidasNoPratoArr = itensNoPrato();

    if (comidasNoPratoArr.length === 0) {
        mostrarAviso('Coloque alimentos no prato antes de calcular!', true);
        return;
    }

    comidasNoPratoArr.forEach(comidaNode => {
        const idOriginal = comidaNode.dataset.comida;
        if (valoresNutricionais[idOriginal] !== undefined) {
            pontosTotais += valoresNutricionais[idOriginal];
        }
    });

    // Converte para porcentagem e segura entre 0% e 100%
    let porcentagemTeste = Math.round((pontosTotais / 80) * 100);
    if (porcentagemTeste < 0) porcentagemTeste = 0;
    if (porcentagemTeste > 100) porcentagemTeste = 100;

    const venceu = porcentagemTeste >= 80; // 80% ou mais = emblema!
    painel.className = 'painel-resultado ' + (venceu ? 'is-bom' : 'is-ruim');
    painel.innerHTML = `
        <span class="resultado-kicker">Análise nutricional</span>
        <span class="resultado-porcentagem">${porcentagemTeste}% <small>saudável</small></span>
        <div class="resultado-barra"><div></div></div>`;

    if (venceu) {
        // Guarda a conquista (ver JS/progresso.js) e mostra o caminho até os emblemas
        CherryProgresso.marcar('prato');

        painel.innerHTML += '<p><strong>Muito bem!</strong> Você ganhou o <strong>Emblema do Prato Saudável</strong>!</p>';
        painel.innerHTML += '<a href="emblemas.html" class="btn-ir-emblemas">Ver meus emblemas</a>';
    } else {
        painel.innerHTML += '<p><strong>Quase lá!</strong> Que tal trocar algum industrializado por algo mais natural? Seu corpo agradece. 💚</p>';
    }

    // Reinicia a animação do painel e enche a barra depois que ele aparece
    areaResultado.hidden = true;
    void painel.offsetWidth;
    areaResultado.hidden = false;
    const barra = painel.querySelector('.resultado-barra div');
    requestAnimationFrame(() => requestAnimationFrame(() => {
        barra.style.width = porcentagemTeste + '%';
    }));
    areaResultado.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Botão "Recomeçar": esvazia o prato e volta ao início
function recomecarJogo() {
    itensNoPrato().forEach(item => item.remove());
    esconderResultado();
    mostrarAviso(AVISO_PADRAO, false);
    atualizarContador();
}
