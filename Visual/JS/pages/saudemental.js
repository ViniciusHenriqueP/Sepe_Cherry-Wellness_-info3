document.addEventListener('DOMContentLoaded', function () {
    iniciarLembrete();
    iniciarHumor();
    iniciarMinijogoToast();
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

/* ---------- Botão do minijogo (placeholder) ---------- */
function iniciarMinijogoToast() {
    const botao = document.getElementById('minijogo-btn');
    const toast = document.getElementById('mental-toast');
    if (!botao || !toast) return;

    let timer = null;

    botao.addEventListener('click', function () {
        toast.textContent = 'Minijogo em construção — volte em breve! 🍒';
        toast.classList.add('is-visible');

        if (timer) clearTimeout(timer);
        timer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
    });
}
