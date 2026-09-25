// Tela de resultado compartilhada pelos minijogos de Ritmo e Respiração.
// Monta ícone + título + mensagem + botões dentro do overlay da área de jogo
// (estilos em CSS/minijogo.css). Pensada para caber sem rolagem mesmo na
// área de jogo baixa do celular.

const ICONE_VITORIA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z"></path><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"></path></svg>';
const ICONE_DERROTA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg>';

function mostrarTelaResultado(overlay, { vitoria, titulo, mensagem }) {
    const acoes = vitoria
        ? `<a href="emblemas.html" class="btn-game">Ver meu emblema</a>
           <button class="btn-game btn-game--ghost" type="button" onclick="location.reload()">Jogar de novo</button>`
        : '<button class="btn-game" type="button" onclick="location.reload()">Tentar de novo</button>';

    overlay.innerHTML = `
        <span class="resultado-icone${vitoria ? '' : ' is-derrota'}">${vitoria ? ICONE_VITORIA : ICONE_DERROTA}</span>
        <h2></h2>
        <p></p>
        <div class="resultado-acoes">${acoes}</div>`;
    overlay.querySelector('h2').textContent = titulo;
    overlay.querySelector('p').innerHTML = mensagem;
    overlay.style.display = 'flex';
}
