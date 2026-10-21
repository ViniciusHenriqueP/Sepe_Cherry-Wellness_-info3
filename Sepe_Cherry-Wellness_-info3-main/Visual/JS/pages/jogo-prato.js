const emojis = document.querySelectorAll('.emoji-arrastavel');
const prato = document.getElementById('prato-alvo');
const gradeComidas = document.getElementById('comidas-grid');
const contador = document.getElementById('prato-contador');
const aviso = document.getElementById('prato-aviso');
const areaResultado = document.getElementById('area-resultado');
const painel = document.getElementById('resultado-painel');

const MAX_ITENS = 4;
const AVISO_PADRAO = 'Toque em um alimento no prato para tirá-lo.';

emojis.forEach(emoji => {
    emoji.addEventListener('mousedown', iniciarArrasto);
    emoji.addEventListener('touchstart', iniciarArrasto, { passive: false });
});

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

function esconderResultado() {
    areaResultado.hidden = true;
}

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

    function dentroDoPrato(x, y) {
        const rectPrato = prato.getBoundingClientRect();
        return x >= rectPrato.left && x <= rectPrato.right && y >= rectPrato.top && y <= rectPrato.bottom;
    }

    function moverNaTela(x, y) {
        emoji.style.left = (x - rectInicial.width / 2) + 'px';
        emoji.style.top = (y - rectInicial.height / 2) + 'px';
        prato.classList.toggle('prato-atencao', dentroDoPrato(x, y));
    }

    function aoMover(evento) {
        moverNaTela(evento.clientX || evento.touches[0].clientX, evento.clientY || evento.touches[0].clientY);
    }

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

function tirarDoPrato(item) {
    if (item.classList.contains('is-saindo')) return;
    item.classList.add('is-saindo');
    esconderResultado();
    setTimeout(() => {
        item.remove();
        atualizarContador();
    }, 200);
}

function calcularSaude() {
    let pontosTotais = 0;
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

    let porcentagemTeste = Math.round((pontosTotais / 80) * 100);
    if (porcentagemTeste < 0) porcentagemTeste = 0;
    if (porcentagemTeste > 100) porcentagemTeste = 100;

    const venceu = porcentagemTeste >= 80;
    painel.className = 'painel-resultado ' + (venceu ? 'is-bom' : 'is-ruim');
    painel.innerHTML = `
        <span class="resultado-kicker">Análise nutricional</span>
        <span class="resultado-porcentagem">${porcentagemTeste}% <small>saudável</small></span>
        <div class="resultado-barra"><div></div></div>`;

    if (venceu) {
        // Salva no localStorage e adiciona o botão de redirecionamento
        localStorage.setItem('emblemaPrato', 'ganhou');

        painel.innerHTML += '<p><strong>Muito bem!</strong> Você ganhou o <strong>Emblema do Prato Saudável</strong>!</p>';
        painel.innerHTML += '<a href="emblemas.html" class="btn-ir-emblemas">Ver meus emblemas</a>';
    } else {
        painel.innerHTML += '<p><strong>Tente de novo!</strong> Seu prato precisa de mais itens naturais e menos industrializados.</p>';
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

function recomecarJogo() {
    itensNoPrato().forEach(item => item.remove());
    esconderResultado();
    mostrarAviso(AVISO_PADRAO, false);
    atualizarContador();
}
