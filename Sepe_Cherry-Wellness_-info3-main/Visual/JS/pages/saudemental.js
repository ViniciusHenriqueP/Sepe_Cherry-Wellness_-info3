document.addEventListener('DOMContentLoaded', function () {
    iniciarLembrete();
    iniciarHumor();
});

/* ---------- Card "Lembrete!" com frases rotativas ---------- */
function iniciarLembrete() {
    const frases = [
        'Cuidar da mente é tão importante quanto cuidar do corpo.',
        'Você não precisa ter todas as respostas hoje.',
        'Pequenos passos também são progresso.',
        'Está tudo bem pedir ajuda quando você precisar.',
        'Respire fundo — você já superou dias difíceis antes.',
        'Sua saúde mental importa, todos os dias.'
    ];

    const card = document.getElementById('lembrete-card');
    const fraseEl = document.getElementById('lembrete-frase');
    const okBtn = document.getElementById('lembrete-ok');
    if (!card || !fraseEl) return;

    let indice = 0;
    let intervalo = null;

    function trocarFrase() {
        indice = (indice + 1) % frases.length;
        fraseEl.classList.add('is-changing');
        setTimeout(() => {
            fraseEl.textContent = frases[indice];
            fraseEl.classList.remove('is-changing');
        }, 350);
    }

    intervalo = setInterval(trocarFrase, 7000);

    if (okBtn) {
        okBtn.addEventListener('click', function () {
            clearInterval(intervalo);

            // Etapa 1: encolhe e desaparece
            card.classList.add('is-closing');

            // Etapa 2 (depois que o fade termina): recolhe o espaço que ele ocupava
            card.addEventListener('transitionend', function aoFechar(evento) {
                if (evento.propertyName !== 'opacity') return;
                card.removeEventListener('transitionend', aoFechar);
                card.classList.add('is-dismissed');
            });
        });
    }
}

/* ---------- Seletor de humor do dia ---------- */
function iniciarHumor() {
    const opcoes = document.querySelectorAll('.mood-option');
    const feedback = document.getElementById('mood-feedback');
    if (!opcoes.length) return;

    const mensagens = {
        triste: 'Sentir isso é válido. Que tal conversar com alguém de confiança hoje?',
        chateado: 'Dias assim acontecem. Seja gentil consigo mesmo.',
        neutro: 'Um dia tranquilo também é um bom dia.',
        bem: 'Que bom! Aproveite essa energia positiva.',
        otimo: 'Maravilha! Guarde esse sentimento com carinho.'
    };

    const HOJE = new Date().toISOString().slice(0, 10);
    const salvo = localStorage.getItem('humorDoDia');
    if (salvo) {
        try {
            const dados = JSON.parse(salvo);
            if (dados.data === HOJE) {
                const ativo = document.querySelector('.mood-option[data-mood="' + dados.mood + '"]');
                if (ativo) {
                    ativo.setAttribute('aria-pressed', 'true');
                    if (feedback) feedback.textContent = mensagens[dados.mood] || '';
                }
            }
        } catch (erro) { /* ignora dado corrompido */ }
    }

    opcoes.forEach(function (botao) {
        botao.addEventListener('click', function () {
            opcoes.forEach(o => o.setAttribute('aria-pressed', 'false'));
            botao.setAttribute('aria-pressed', 'true');

            const mood = botao.dataset.mood;
            localStorage.setItem('humorDoDia', JSON.stringify({ mood: mood, data: HOJE }));

            if (feedback) feedback.textContent = mensagens[mood] || '';
        });
    });
}

/* ---------- Pop-up "Por que isso ajuda?" das práticas ----------
   Mesmo pop-up de Vida em Movimento (JS/beneficio-modal.js); aqui fica só o texto de cada card. */
const praticas = {
    respiracao: {
        titulo: 'Respiração',
        lead: 'Respirar devagar é uma das poucas formas de "conversar" diretamente com o sistema nervoso e avisar ao corpo que não há perigo.',
        pontos: [
            ['Nervo vago', 'Quando a expiração fica mais longa que a inspiração, o nervo vago é estimulado. Ele ativa o sistema nervoso parassimpático, responsável pelo "modo descanso", e os batimentos do coração desaceleram.'],
            ['Menos alerta, menos cortisol', 'A respiração rápida e curta, comum na ansiedade, mantém o corpo em estado de alerta. Desacelerar o ritmo reduz a ativação do sistema de "luta ou fuga" e a liberação de hormônios do estresse, como cortisol e adrenalina.'],
            ['Equilíbrio do gás carbônico', 'Respirar rápido demais elimina gás carbônico em excesso, o que pode causar tontura, formigamento e aperto no peito, sensações que aumentam ainda mais a ansiedade. A respiração lenta devolve esse equilíbrio.']
        ],
        pratica: 'Experimente a respiração 4-6: inspire pelo nariz contando até 4 e solte o ar pela boca contando até 6. Repita por 2 a 5 minutos, sentado de forma confortável.',
        video: { id: '2KK_HMEx2BY', titulo: 'Técnica de respiração para ansiedade (apenas 2 minutos!)', canal: 'Dá Para Passar' }
    },
    desconecte: {
        titulo: 'Desconecte-se',
        lead: 'Celulares e redes sociais são feitos para prender a atenção. Pausas das telas devolvem ao cérebro o descanso de que ele precisa.',
        pontos: [
            ['Ciclo da dopamina', 'Cada notificação, curtida ou vídeo novo libera um pouco de dopamina, ligada à sensação de recompensa. O cérebro passa a buscar esse estímulo o tempo todo, e fica mais difícil se concentrar em tarefas menos "empolgantes".'],
            ['Atenção fragmentada', 'Trocar de aplicativo a todo momento obriga o cérebro a recomeçar o foco várias vezes. Isso gera cansaço mental e a sensação de ter feito muita coisa sem terminar nada.'],
            ['Luz das telas e sono', 'A luz das telas à noite reduz a produção de melatonina, o hormônio que prepara o corpo para dormir. Dormir menos ou pior deixa o humor mais instável e aumenta a ansiedade no dia seguinte.']
        ],
        pratica: 'Comece com pequenos acordos: deixar o celular longe na hora de estudar, desativar notificações que não são essenciais e evitar telas na última hora antes de dormir.',
        video: { id: 'IH5yEY9Ni8I', titulo: 'Micro-hábitos para eliminar seu vício em celular e redes sociais', canal: 'Eurekka' }
    },
    organizacao: {
        titulo: 'Organização mental',
        lead: 'Quando tudo fica só na cabeça, o cérebro gasta energia tentando não esquecer nada. Organizar libera espaço para pensar com clareza.',
        pontos: [
            ['Memória de trabalho limitada', 'A memória de trabalho, que usamos para manter informações "à mão", guarda poucas coisas ao mesmo tempo. Tarefas pendentes ficam voltando ao pensamento e ocupam esse espaço.'],
            ['Escrever alivia', 'Colocar pensamentos e tarefas no papel ajuda o cérebro a "soltar" essas informações. Anotar os planos do dia seguinte antes de dormir, por exemplo, ajuda a pegar no sono mais rápido.'],
            ['Problemas em partes menores', 'Dividir um problema grande em etapas pequenas reduz a sensação de sobrecarga. Cada etapa concluída dá sensação de progresso e motivação para continuar.']
        ],
        pratica: 'Faça uma lista do que precisa ser feito, escolha as 3 prioridades do dia e divida as tarefas grandes em passos que caibam em 20 a 30 minutos.',
        video: { id: 'iFukWMeeyow', titulo: 'Estresse, distimia, ecoansiedade e mais', canal: 'Drauzio Varella' }
    },
    cuidese: {
        titulo: 'Cuide-se',
        lead: 'Cuidar de si não é egoísmo: é o que dá base para enfrentar os desafios do dia a dia e se relacionar bem com as outras pessoas.',
        pontos: [
            ['Autocompaixão', 'Tratar a si mesmo com a mesma gentileza que você teria com um amigo diminui a autocrítica exagerada, que está ligada a mais estresse, ansiedade e desânimo.'],
            ['Pequenas conquistas contam', 'Reconhecer um avanço, mesmo pequeno, ativa o sistema de recompensa do cérebro. Isso reforça o hábito e aumenta a motivação e a autoconfiança.'],
            ['Necessidades básicas', 'Dormir bem, se alimentar, se movimentar e ter momentos de lazer e convivência são a base da saúde mental. Quando um desses pilares falha, fica mais difícil manter o equilíbrio emocional.']
        ],
        pratica: 'Ao fim do dia, anote três coisas que deram certo ou que você fez bem. E reserve um momento da semana para algo de que você gosta, sem culpa.',
        video: { id: '8LdLrgzzfRc', titulo: 'Aprenda a cuidar mais de você', canal: 'Nós da Questão (Marcos Lacerda, psicólogo)' }
    }
};

iniciarBeneficioModal(praticas, '.pratica-card', {
    kicker: 'Por que isso ajuda?',
    secao: 'Como funciona'
});
