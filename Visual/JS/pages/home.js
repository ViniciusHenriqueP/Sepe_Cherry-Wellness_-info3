/* =====================================================================
   home.js — Os toques de carinho da página inicial 🍒
   ---------------------------------------------------------------------
   Usado em: index.html   (depende de JS/progresso.js)

   1. Saudação pelo horário: "Bom dia!", "Boa tarde!" ou "Boa noite!".
   2. Dica do dia: uma dica tirada do conteúdo do próprio site. Ela
      muda a cada dia (e não a cada recarga), para parecer um
      "conselho do dia" de verdade.
   3. Progresso: mostra quantos emblemas a pessoa já tem e convida
      a continuar.
   ===================================================================== */

// As dicas reaproveitam o que já ensinamos nas páginas do site
const DICAS = [
    'A OMS recomenda pelo menos 400g de frutas e vegetais por dia. Que tal uma fruta no lanche? 🍎',
    'Adultos precisam de 150 minutos de atividade moderada por semana — dá só uns 22 minutinhos por dia! 🚶',
    'O limite de sal recomendado é de 5g por dia, mais ou menos uma colher de chá. 🧂',
    'Respirar devagar avisa o corpo que está tudo bem. Tente agora: inspire em 4, solte em 6. 🫁',
    'Pausas das telas ajudam a reduzir o estresse e a melhorar o foco. Olhe pela janela um pouquinho. 🌳',
    'Se algo está pesando demais, conversar com alguém de confiança ajuda muito. Você não está só. 💚',
    'Aquecer antes do treino ajuda a prevenir lesões. Seu corpo agradece! 🤸',
    'Músculo hidratado tem menos risco de cãibras. Já bebeu água hoje? 💧',
    'Trocar o arroz branco pelo integral dá mais fibras e energia que dura mais. 🍚',
    'Uma pausa ativa de 10 a 20 minutos antes de estudar ajuda a manter a atenção. 📚',
    'Gorduras boas moram no azeite, no abacate e nas castanhas. 🥑',
    'Pequenos passos também são progresso. Seja gentil com você hoje. 🌱'
];

// ----- 1. Saudação -----
function mostrarSaudacao() {
    const el = document.getElementById('saudacao');
    if (!el) return;

    const hora = new Date().getHours();
    let texto = 'Boa noite! 🌙';
    if (hora >= 5 && hora < 12) texto = 'Bom dia! ☀️';
    else if (hora >= 12 && hora < 18) texto = 'Boa tarde! 🌤️';

    el.textContent = texto;
    el.hidden = false;
}

// ----- 2. Dica do dia -----
function mostrarDicaDoDia() {
    const el = document.getElementById('dica-texto');
    if (!el) return;

    // Conta quantos dias se passaram desde 1970 e usa isso para escolher
    // a dica: assim todo mundo vê a mesma dica no mesmo dia
    const diasDesde1970 = Math.floor(Date.now() / 86400000);
    el.textContent = DICAS[diasDesde1970 % DICAS.length];
}

// ----- 3. Progresso dos emblemas -----
function mostrarProgresso() {
    const el = document.getElementById('home-progresso');
    if (!el || !window.CherryProgresso) return;

    const total = CherryProgresso.contarBase();
    const cerejas = '🍒'.repeat(total) + '⚪'.repeat(3 - total);

    let convite = 'Jogue os minijogos e encha seu cesto de cerejas!';
    if (total > 0 && total < 3) convite = 'Bora continuar? Faltam ' + (3 - total) + ' para a Batalha Final!';
    if (total === 3) convite = CherryProgresso.ganhou('final')
        ? 'Você venceu a Cereja Podre. Que orgulho! 🏆'
        : 'Cesto cheio! A Batalha Final está esperando por você.';

    el.querySelector('.home-progresso-cerejas').textContent = cerejas;
    el.querySelector('.home-progresso-texto').textContent = total + ' de 3 emblemas';
    el.querySelector('.home-progresso-convite').textContent = convite;
}

document.addEventListener('DOMContentLoaded', function () {
    mostrarSaudacao();
    mostrarDicaDoDia();
    mostrarProgresso();
});
