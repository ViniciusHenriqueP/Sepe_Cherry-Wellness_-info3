// Pop-up "Por que isso acontece?" dos cards de benefícios (jogo-movimento.html)
// Cada card tem um botão com data-beneficio="chave"; o texto de cada chave fica aqui.
const beneficios = {
    humor: {
        titulo: 'Melhora o humor',
        lead: 'Durante e depois do exercício, o cérebro recebe um reforço de substâncias ligadas ao prazer e ao bem-estar.',
        pontos: [
            ['Endorfinas e endocanabinoides', 'O esforço físico estimula a liberação de endorfinas e de endocanabinoides, como a anandamida. Eles diminuem a percepção de dor e geram a sensação de leveza conhecida como "barato do corredor".'],
            ['Serotonina e dopamina', 'A prática regular aumenta a disponibilidade desses neurotransmissores, que regulam o humor, a motivação e a sensação de recompensa.'],
            ['BDNF', 'O exercício eleva o BDNF (fator neurotrófico derivado do cérebro), uma proteína que protege os neurônios e favorece novas conexões entre eles, efeito associado à redução de sintomas de depressão.']
        ],
        pratica: 'Mesmo sessões curtas, de 10 a 30 minutos de atividade moderada, como uma caminhada rápida, já costumam melhorar o humor no mesmo dia.'
    },
    estresse: {
        titulo: 'Reduz o estresse',
        lead: 'O exercício funciona como um "treino" para o sistema que o corpo usa para reagir ao estresse.',
        pontos: [
            ['Eixo HPA e cortisol', 'Situações de estresse ativam o eixo hipotálamo-hipófise-adrenal, que libera cortisol. Com a prática regular, o corpo se adapta e passa a liberar menos cortisol diante das pressões do dia a dia.'],
            ['Sistema nervoso parassimpático', 'A atividade física fortalece a parte do sistema nervoso responsável pelo relaxamento. Isso aparece como frequência cardíaca de repouso mais baixa e maior variação entre os batimentos, sinal de um corpo que se recupera melhor.'],
            ['Tensão muscular e sono', 'Ao contrair e relaxar os músculos, o exercício alivia a tensão acumulada e ajuda a regular o sono, que é quando o corpo se recupera do estresse.']
        ],
        pratica: 'Atividades rítmicas, como caminhar, pedalar ou nadar, feitas com a respiração tranquila, são ótimas para desacelerar depois de um dia cheio.'
    },
    disposicao: {
        titulo: 'Aumenta a disposição',
        lead: 'Parece contraditório gastar energia para ganhar energia, mas o corpo se adapta ao esforço e fica mais eficiente.',
        pontos: [
            ['Mais mitocôndrias', 'As mitocôndrias são as "usinas" das células, onde é produzido o ATP, a molécula de energia do corpo. O treino estimula os músculos a formarem mais mitocôndrias, que geram energia com menos esforço.'],
            ['Coração mais eficiente', 'Com o condicionamento, o coração bombeia mais sangue a cada batimento e novos vasos capilares se formam nos músculos. O oxigênio chega mais rápido onde é preciso e o cansaço demora mais a aparecer.'],
            ['Sono mais reparador', 'Quem se exercita com regularidade tende a adormecer mais rápido e a ter mais sono profundo, acordando mais descansado.']
        ],
        pratica: 'Treinos muito intensos logo antes de dormir podem atrasar o sono. Prefira terminar a atividade pelo menos 1 hora antes de deitar.'
    },
    concentracao: {
        titulo: 'Favorece a concentração',
        lead: 'O cérebro também ganha com o movimento: recebe mais sangue, mais oxigênio e mais estímulo para criar conexões.',
        pontos: [
            ['Mais fluxo sanguíneo', 'Durante a atividade, o fluxo de sangue para o cérebro aumenta, levando mais oxigênio e glicose aos neurônios.'],
            ['Neuroplasticidade', 'O BDNF liberado pelo exercício estimula o hipocampo, região ligada à memória e ao aprendizado, a formar novas conexões entre neurônios.'],
            ['Atenção e foco', 'O aumento de noradrenalina e dopamina no córtex pré-frontal melhora as funções executivas: planejar, manter o foco e ignorar distrações.']
        ],
        pratica: 'Uma pausa ativa de 10 a 20 minutos antes de estudar ajuda a manter a atenção durante a tarefa.'
    }
};

const modal = document.getElementById('beneficio-modal');
const modalIcone = document.getElementById('beneficio-modal-icone');
const modalTitulo = document.getElementById('beneficio-modal-titulo');
const modalLead = document.getElementById('beneficio-modal-lead');
const modalPontos = document.getElementById('beneficio-modal-pontos');
const modalPratica = document.getElementById('beneficio-modal-pratica');

function abrirBeneficio(botao) {
    const dados = beneficios[botao.dataset.beneficio];
    if (!dados) return;

    // Reaproveita o mesmo ícone SVG do card clicado
    const iconeCard = botao.closest('.beneficio-card').querySelector('svg');
    modalIcone.replaceChildren(iconeCard.cloneNode(true));

    modalTitulo.textContent = dados.titulo;
    modalLead.textContent = dados.lead;
    modalPratica.textContent = dados.pratica;

    modalPontos.replaceChildren();
    dados.pontos.forEach(([termo, explicacao], i) => {
        const item = document.createElement('li');
        item.style.setProperty('--ponto-delay', `${0.12 + i * 0.08}s`);
        const titulo = document.createElement('strong');
        titulo.textContent = termo;
        const texto = document.createElement('p');
        texto.textContent = explicacao;
        item.append(titulo, texto);
        modalPontos.append(item);
    });

    modal.classList.remove('is-closing');
    modal.showModal();
    document.documentElement.classList.add('modal-aberto');
    modal.querySelector('.beneficio-modal-inner').scrollTop = 0;
}

function fecharBeneficio() {
    if (!modal.open || modal.classList.contains('is-closing')) return;

    const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduzirMovimento) {
        modal.close();
        return;
    }

    // Espera a animação de saída terminar antes de fechar de fato
    modal.classList.add('is-closing');
    modal.addEventListener('animationend', () => {
        modal.classList.remove('is-closing');
        modal.close();
    }, { once: true });
}

document.querySelectorAll('.beneficio-mais').forEach((botao) => {
    botao.addEventListener('click', () => abrirBeneficio(botao));
});

modal.querySelectorAll('[data-fechar]').forEach((botao) => {
    botao.addEventListener('click', fecharBeneficio);
});

// Clique fora da caixa (no fundo escurecido) fecha
modal.addEventListener('click', (evento) => {
    if (evento.target === modal) fecharBeneficio();
});

// Esc: usa a mesma animação de saída em vez do fechamento seco do navegador
modal.addEventListener('cancel', (evento) => {
    evento.preventDefault();
    fecharBeneficio();
});

modal.addEventListener('close', () => {
    document.documentElement.classList.remove('modal-aberto');
});
