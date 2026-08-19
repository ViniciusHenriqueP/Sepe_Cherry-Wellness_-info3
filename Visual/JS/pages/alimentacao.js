function mostrarNutriente(idNutriente) {
    let msgInicial = document.getElementById('mensagem-inicial');
    if (msgInicial) msgInicial.style.display = 'none';

    let todosOsBlocos = document.querySelectorAll('.nutriente-bloco');
    todosOsBlocos.forEach(function (bloco) {
        bloco.classList.add('content-escondido');
    });

    let blocoAlvo = document.getElementById('content-' + idNutriente);
    if (blocoAlvo) {
        blocoAlvo.classList.remove('content-escondido');
        blocoAlvo.scrollIntoView({ behavior: 'smooth' });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const URLParams = new URLSearchParams(window.location.search);
    const nutrienteNoLink = URLParams.get('nutriente');

    if (nutrienteNoLink) {
        mostrarNutriente(nutrienteNoLink);
    }
});
