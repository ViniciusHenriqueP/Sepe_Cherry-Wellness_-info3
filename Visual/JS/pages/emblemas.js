document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('container-conquistas');

    const ganhouPrato = localStorage.getItem('emblemaPrato');
    const ganhouMovimento = localStorage.getItem('emblemaMovimento');
    const ganhouMental = localStorage.getItem('emblemaMental');

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
                <a href="jogo-ritmo.html" class="btn-primary">Visitar Jogo</a>
            </div>
        `;
    }

    if (ganhouMental === 'ganhou') {
        htmlFinal += `
            <div class="emblema-card" data-reveal="scale">
                <div class="emblema-img-area">
                    <svg viewBox="0 0 160 160" width="140" height="140" aria-hidden="true">
                        <symbol id="lobo-pulmao-emblema" viewBox="0 0 60 100">
                            <path d="M16 8C34 2 50 14 52 34 54 50 50 64 44 76 38 88 28 96 18 92 10 89 10 80 14 72 20 60 20 52 14 44 8 36 8 24 16 8Z"></path>
                        </symbol>
                        <circle cx="80" cy="80" r="76" style="fill: var(--color-sage-panel-soft);"></circle>
                        <circle cx="80" cy="80" r="76" fill="none" style="stroke: var(--color-brand-mental);" stroke-width="4"></circle>
                        <path d="M80 26 L80 62" style="stroke: var(--color-brand-mental);" stroke-width="8" stroke-linecap="round" fill="none" />
                        <path d="M80 62 L62 76" style="stroke: var(--color-brand-mental);" stroke-width="8" stroke-linecap="round" fill="none" />
                        <path d="M80 62 L98 76" style="stroke: var(--color-brand-mental);" stroke-width="8" stroke-linecap="round" fill="none" />
                        <g transform="translate(85.73,69.76)">
                            <use href="#lobo-pulmao-emblema" width="46" height="78" style="fill: var(--color-brand-mental);" />
                        </g>
                        <g transform="translate(74.27,69.76) scale(-1,1)">
                            <use href="#lobo-pulmao-emblema" width="46" height="78" style="fill: var(--color-brand-mental);" />
                        </g>
                    </svg>
                </div>
                <h3 class="emblema-titulo">Bem-Estar Mental</h3>
                <p class="emblema-descricao">Concedido por manter o ritmo da respiração e encher a barra de fôlego no jogo Respire e Recarregue.</p>
                <a href="jogo-respiracao.html" class="btn-primary">Visitar Jogo</a>
            </div>
        `;
    }

    if (!ganhouPrato && !ganhouMovimento && !ganhouMental) {
        htmlFinal = `
            <div class="sem-emblemas" data-reveal="up">
                Você não tem nenhum emblema ainda! Jogue os minijogos para desbloquear.
            </div>
        `;
    }

    container.innerHTML = htmlFinal;

    if (window.CherryReveal) window.CherryReveal.refresh();
});
