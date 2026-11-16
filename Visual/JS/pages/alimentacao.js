/* =====================================================================
   alimentacao.js — Página "Prato & Saúde" 🥗
   ---------------------------------------------------------------------
   Usado em: alimentacao.html

   A página tem um bloco de texto para cada nutriente (proteínas,
   carboidratos, gorduras, vitaminas). Só um aparece por vez: a pessoa
   clica num nutriente e a gente mostra o bloco dele.

   Também dá para chegar já com um nutriente aberto pelo link, por
   exemplo: alimentacao.html?nutriente=proteinas (os cards da home
   usam isso).
   ===================================================================== */

// Mostra o bloco do nutriente escolhido e esconde os outros
function mostrarNutriente(idNutriente) {
    // Some com a mensagem "escolha um nutriente" do começo
    let msgInicial = document.getElementById('mensagem-inicial');
    if (msgInicial) msgInicial.style.display = 'none';

    // Esconde todos os blocos...
    let todosOsBlocos = document.querySelectorAll('.nutriente-bloco');
    todosOsBlocos.forEach(function (bloco) {
        bloco.classList.add('content-escondido');
    });

    // ...e mostra só o que a pessoa pediu, rolando a tela até ele
    let blocoAlvo = document.getElementById('content-' + idNutriente);
    if (blocoAlvo) {
        blocoAlvo.classList.remove('content-escondido');
        blocoAlvo.scrollIntoView({ behavior: 'smooth' });
    }
}

// Quando a página carrega, confere se veio um ?nutriente=... no link
window.addEventListener('DOMContentLoaded', () => {
    const URLParams = new URLSearchParams(window.location.search);
    const nutrienteNoLink = URLParams.get('nutriente');

    if (nutrienteNoLink) {
        mostrarNutriente(nutrienteNoLink);
    }
});
