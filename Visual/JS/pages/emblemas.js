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
                    <img src="IMG/Emblemas/Respiracao.png" alt="Bem-Estar Mental">
                </div>
                <h3 class="emblema-titulo">Bem-Estar Mental</h3>
                <p class="emblema-descricao">Concedido por manter o ritmo da respiração e encher a barra de fôlego no jogo Respire e Recarregue.</p>
                <a href="jogo-respiracao.html" class="btn-primary">Visitar Jogo</a>
            </div>
        `;
    }

    // Com os três emblemas, libera a batalha final contra a Cereja Podre
    if (ganhouPrato === 'ganhou' && ganhouMovimento === 'ganhou' && ganhouMental === 'ganhou') {
        const venceuChefe = localStorage.getItem('emblemaFinal') === 'ganhou';
        const venceuImpossivel = localStorage.getItem('emblemaImpossivel') === 'ganhou';
        htmlFinal += `
            <div class="emblema-card emblema-card--boss" data-reveal="scale">
                <div class="emblema-img-area">
                    <svg viewBox="-10 -10 20 18" width="110" height="100" aria-hidden="true">
                        <path d="M0 6 C-2 4 -8 0 -8 -3 C-8 -6 -5 -8 -3 -8 C-1.5 -8 0 -7 0 -5 C0 -7 1.5 -8 3 -8 C5 -8 8 -6 8 -3 C8 0 2 4 0 6 Z" fill="#FF1A1A"></path>
                    </svg>
                </div>
                <h3 class="emblema-titulo">${venceuChefe ? 'Chefe Derrotado' : 'Batalha Final'}</h3>
                <p class="emblema-descricao">${venceuChefe
                    ? (venceuImpossivel
                        ? 'Você derrotou a Cereja Podre até no modo Impossível. Lenda do bem-estar!'
                        : 'Você derrotou a Cereja Podre usando tudo o que aprendeu no site. Que tal tentar o modo Impossível?')
                    : 'Você conquistou os três emblemas. Desvie dos ataques da Cereja Podre e acerte as perguntas para derrotá-la!'}</p>
                <a href="jogo-boss.html" class="btn-primary">${venceuChefe ? 'Revanche' : 'Enfrentar o chefe'}</a>
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
