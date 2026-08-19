const emojis = document.querySelectorAll('.emoji-arrastavel');
const prato = document.getElementById('prato-alvo');
let contadorComidas = 0;

emojis.forEach(emoji => {
    emoji.addEventListener('mousedown', iniciarArrasto);
    emoji.addEventListener('touchstart', iniciarArrasto, { passive: false });
});

function iniciarArrasto(e) {
    if (contadorComidas >= 4) {
        alert('Seu prato já está completo com 4 itens!');
        return;
    }

    e.preventDefault();
    const emoji = e.target;
    const rectInicial = emoji.getBoundingClientRect();

    emoji.style.position = 'fixed';
    emoji.style.zIndex = '1000';
    moverNaTela(e.clientX || e.touches[0].clientX, e.clientY || e.touches[0].clientY);

    function moverNaTela(x, y) {
        emoji.style.left = (x - rectInicial.width / 2) + 'px';
        emoji.style.top = (y - rectInicial.height / 2) + 'px';

        const rectPrato = prato.getBoundingClientRect();
        if (x >= rectPrato.left && x <= rectPrato.right && y >= rectPrato.top && y <= rectPrato.bottom) {
            prato.classList.add('prato-atencao');
        } else {
            prato.classList.remove('prato-atencao');
        }
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

        const xFinal = evento.clientX || (evento.changedTouches ? evento.changedTouches[0].clientX : 0);
        const yFinal = evento.clientY || (evento.changedTouches ? evento.changedTouches[0].clientY : 0);

        const rectPrato = prato.getBoundingClientRect();

        if (xFinal >= rectPrato.left && xFinal <= rectPrato.right && yFinal >= rectPrato.top && yFinal <= rectPrato.bottom) {
            const textoAjuda = document.getElementById('texto-ajuda');
            if (textoAjuda) textoAjuda.remove();

            const novoItem = document.createElement('span');
            novoItem.classList.add('comida-no-prato');
            novoItem.innerText = emoji.innerText;
            novoItem.id = "final-" + emoji.id;
            prato.appendChild(novoItem);

            contadorComidas++;
        }
        emoji.style.position = 'static';
    }

    document.addEventListener('mousemove', aoMover);
    document.addEventListener('mouseup', aoSoltar);
    document.addEventListener('touchmove', aoMover, { passive: false });
    document.addEventListener('touchend', aoSoltar);
}

function calcularSaude() {
    let pontosTotais = 0;
    const valoresNutricionais = {
        'alface': 25, 'file-frango': 20, 'arroz': 15, 'azeite': 20, 'linguica': -10, 'refrigerante': -20
    };

    const comidasNoPratoArr = prato.querySelectorAll('.comida-no-prato');

    if (comidasNoPratoArr.length === 0) {
        alert('Coloque alimentos no prato antes de calcular!');
        return;
    }

    comidasNoPratoArr.forEach(comidaNode => {
        const idOriginal = comidaNode.id.replace('final-', '');
        if (valoresNutricionais[idOriginal] !== undefined) {
            pontosTotais += valoresNutricionais[idOriginal];
        }
    });

    let porcentagemTeste = Math.round((pontosTotais / 80) * 100);
    if (porcentagemTeste < 0) porcentagemTeste = 0;
    if (porcentagemTeste > 100) porcentagemTeste = 100;

    const painel = document.getElementById('resultado-painel');
    document.getElementById('area-resultado').style.display = 'block';

    painel.innerHTML = '<h3>Análise Nutricional</h3><p>Seu prato atingiu <strong>' + porcentagemTeste + '%</strong> saudável.</p>';

    if (porcentagemTeste >= 80) {
        // Salva no localStorage e adiciona o botão de redirecionamento
        localStorage.setItem('emblemaPrato', 'ganhou');

        painel.innerHTML += '<p style="margin-top:10px;"> <strong>MUITO BEM!</strong> Você ganhou o <strong>Emblema do Prato Saudável</strong>!</p>';
        painel.innerHTML += '<a href="emblemas.html" class="btn-ir-emblemas">Ver meus Emblemas</a>';
        painel.style.backgroundColor = '#E2EFE0';
        painel.style.borderColor = '#275923';
        painel.style.color = '#275923';
    } else {
        painel.innerHTML += '<p style="margin-top:10px;"> <strong>Tente de novo!</strong> Seu prato precisa de mais itens naturais e menos industrializados.</p>';
        painel.style.backgroundColor = '#FFF4E5';
        painel.style.borderColor = '#CC9C70';
        painel.style.color = '#CC9C70';
    }
}

function recomecarJogo() {
    const comidasNoPrato = prato.querySelectorAll('.comida-no-prato');
    comidasNoPrato.forEach(item => item.remove());
    contadorComidas = 0;
    document.getElementById('area-resultado').style.display = 'none';

    if (!document.getElementById('texto-ajuda')) {
        const textoAjuda = document.createElement('p');
        textoAjuda.id = 'texto-ajuda';
        textoAjuda.className = 'texto-ajuda';
        textoAjuda.innerText = 'Arraste até 4 itens para cá!';
        prato.appendChild(textoAjuda);
    }
}
