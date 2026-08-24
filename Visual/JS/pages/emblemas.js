document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('container-conquistas');

    const ganhouPrato = localStorage.getItem('emblemaPrato');
    const ganhouMovimento = localStorage.getItem('emblemaMovimento');

    let htmlFinal = '';

    if (ganhouPrato === 'ganhou') {
        htmlFinal += `
            <div class="emblema-card" data-reveal="scale">
                <div class="emblema-img-area">
                    <img src="IMG/Emblemas/Masterchef.png" alt="Prato Saudável">
                </div>
                <h3 class="emblema-titulo">Prato Saudável</h3>
                <p class="emblema-descricao">Concedido por montar um prato nutricionalmente balanceado com 80% ou mais de aproveitamento saudável.</p>
                <a href="jogo-prato.html" class="btn-primary">Visitar Jogo</a>
            </div>
        `;
    }

    if (ganhouMovimento === 'ganhou') {
        htmlFinal += `
            <div class="emblema-card" data-reveal="scale">
                <div class="emblema-img-area">
                    <img src="IMG/Emblemas/Ritmo.png" alt="Ritmo em Movimento">
                </div>
                <h3 class="emblema-titulo">Ritmo em Movimento</h3>
                <p class="emblema-descricao">Concedido por manter a agilidade e acompanhar a aceleração do ritmo no jogo de movimento!</p>
                <a href="jogo-movimento.html" class="btn-primary">Visitar Jogo</a>
            </div>
        `;
    }

    if (!ganhouPrato && !ganhouMovimento) {
        htmlFinal = `
            <div class="sem-emblemas" data-reveal="up">
                Você não tem nenhum emblema ainda! Jogue os minijogos para desbloquear.
            </div>
        `;
    }

    container.innerHTML = htmlFinal;

    if (window.CherryReveal) window.CherryReveal.refresh();
});
