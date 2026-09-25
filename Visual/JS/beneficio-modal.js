// Pop-up "Por que isso acontece?" compartilhado entre Vida em Movimento e Bem-Estar mental.
// Cada página chama iniciarBeneficioModal(conteudo, seletorDoCard) com o texto de cada
// chave; os botões dos cards têm class="beneficio-mais" e data-beneficio="chave".
// Cada chave pode ter um vídeo: { id: 'ID do YouTube', titulo, canal }.

const MODAL_HTML = `
    <div class="beneficio-modal-inner">
        <button type="button" class="beneficio-modal-fechar" data-fechar aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
        </button>
        <div class="beneficio-modal-topo">
            <span class="beneficio-modal-icone" data-campo="icone"></span>
            <span class="beneficio-modal-kicker" data-campo="kicker"></span>
            <h2 id="beneficio-modal-titulo" data-campo="titulo"></h2>
            <p class="beneficio-modal-lead" data-campo="lead"></p>
        </div>
        <h3 class="beneficio-modal-secao" data-campo="secao"></h3>
        <ol class="beneficio-modal-pontos" data-campo="pontos"></ol>
        <div class="beneficio-modal-pratica">
            <h3 class="beneficio-modal-secao">Na prática</h3>
            <p data-campo="pratica"></p>
        </div>
        <div class="beneficio-modal-video" data-campo="video" hidden>
            <h3 class="beneficio-modal-secao">Assista</h3>
            <div data-campo="player"></div>
            <p class="video-legenda">
                <span data-campo="video-titulo"></span>
                <a data-campo="video-link" target="_blank" rel="noopener">Abrir no YouTube ↗</a>
            </p>
        </div>
        <button type="button" class="btn-primary beneficio-modal-ok" data-fechar>Entendi</button>
    </div>`;

const ICONE_PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z"></path></svg>';

function iniciarBeneficioModal(conteudo, seletorCard, opcoes = {}) {
    const kicker = opcoes.kicker || 'Por que isso acontece?';
    const secao = opcoes.secao || 'Como funciona no corpo';

    const modal = document.createElement('dialog');
    modal.className = 'beneficio-modal';
    modal.setAttribute('aria-labelledby', 'beneficio-modal-titulo');
    modal.innerHTML = MODAL_HTML;
    document.body.append(modal);

    const campo = (nome) => modal.querySelector(`[data-campo="${nome}"]`);
    campo('kicker').textContent = kicker;
    campo('secao').textContent = secao;

    function montarCapaDoVideo(video) {
        const capa = document.createElement('button');
        capa.type = 'button';
        capa.className = 'video-capa';
        capa.setAttribute('aria-label', `Reproduzir vídeo: ${video.titulo}`);

        const miniatura = document.createElement('img');
        miniatura.src = `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`;
        miniatura.alt = '';
        miniatura.loading = 'lazy';

        const play = document.createElement('span');
        play.className = 'video-capa-play';
        play.innerHTML = ICONE_PLAY;

        capa.append(miniatura, play);

        // Só carrega o player do YouTube quando a pessoa decide assistir
        capa.addEventListener('click', () => {
            const frame = document.createElement('div');
            frame.className = 'video-frame';
            const iframe = document.createElement('iframe');
            iframe.src = `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
            iframe.title = video.titulo;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;
            frame.append(iframe);
            capa.replaceWith(frame);
        });

        return capa;
    }

    function abrir(botao) {
        const dados = conteudo[botao.dataset.beneficio];
        if (!dados) return;

        // Reaproveita o mesmo ícone SVG do card clicado
        const iconeCard = botao.closest(seletorCard).querySelector('svg');
        campo('icone').replaceChildren(iconeCard.cloneNode(true));

        campo('titulo').textContent = dados.titulo;
        campo('lead').textContent = dados.lead;
        campo('pratica').textContent = dados.pratica;

        campo('pontos').replaceChildren();
        dados.pontos.forEach(([termo, explicacao], i) => {
            const item = document.createElement('li');
            item.style.setProperty('--ponto-delay', `${0.12 + i * 0.08}s`);
            const titulo = document.createElement('strong');
            titulo.textContent = termo;
            const texto = document.createElement('p');
            texto.textContent = explicacao;
            item.append(titulo, texto);
            campo('pontos').append(item);
        });

        const video = dados.video;
        campo('video').hidden = !video;
        campo('player').replaceChildren();
        if (video) {
            campo('player').append(montarCapaDoVideo(video));
            campo('video-titulo').textContent = `${video.titulo} — ${video.canal}`;
            campo('video-link').href = `https://www.youtube.com/watch?v=${video.id}`;
        }

        modal.classList.remove('is-closing');
        modal.showModal();
        document.documentElement.classList.add('modal-aberto');
        modal.querySelector('.beneficio-modal-inner').scrollTop = 0;
    }

    function fechar() {
        if (!modal.open || modal.classList.contains('is-closing')) return;

        const reduzirMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduzirMovimento) {
            modal.close();
            return;
        }

        // Espera a animação de saída terminar antes de fechar de fato
        modal.classList.add('is-closing');
        modal.addEventListener('animationend', function aoTerminar(evento) {
            if (evento.target !== modal) return; // ignora animações dos filhos
            modal.removeEventListener('animationend', aoTerminar);
            modal.classList.remove('is-closing');
            modal.close();
        });
    }

    document.querySelectorAll('.beneficio-mais').forEach((botao) => {
        botao.addEventListener('click', () => abrir(botao));
    });

    modal.querySelectorAll('[data-fechar]').forEach((botao) => {
        botao.addEventListener('click', fechar);
    });

    // Clique fora da caixa (no fundo escurecido) fecha
    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) fechar();
    });

    // Esc: usa a mesma animação de saída em vez do fechamento seco do navegador
    modal.addEventListener('cancel', (evento) => {
        evento.preventDefault();
        fechar();
    });

    modal.addEventListener('close', () => {
        document.documentElement.classList.remove('modal-aberto');
        // Remove o player para o vídeo não continuar tocando com o pop-up fechado
        campo('player').replaceChildren();
    });
}
