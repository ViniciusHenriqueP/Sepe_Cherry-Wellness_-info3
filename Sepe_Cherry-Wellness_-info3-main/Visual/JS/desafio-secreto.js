// Desafio secreto: quem tem os três emblemas e vence a Cereja Podre no modo
// Difícil ou Impossível pode pedir, por email, um enigma cuja resposta é a
// palavra-chave do prêmio presencial. O envio é feito pelo EmailJS direto do
// navegador; o enigma (e a palavra-chave) ficam só no template do painel do
// EmailJS, nunca neste código. Veja ferramentas/gerador-enigma.html.
// Usa o visual do pop-up de CSS/beneficio-modal.css.

// Cole aqui os códigos do painel do EmailJS (passo a passo no gerador)
const EMAILJS = {
    publicKey: '3mlyTPsccw3JGjG_-',
    serviceId: 'service_96u0vzh',
    templateId: 'template_ocodz8t'
};

const EMBLEMAS_BASE = ['emblemaPrato', 'emblemaMovimento', 'emblemaMental'];

// Guarda o modo em que a pessoa venceu (o Impossível nunca é rebaixado)
function liberarDesafioSecreto(modo) {
    if (localStorage.getItem('desafioSecreto') !== 'Impossível') {
        localStorage.setItem('desafioSecreto', modo);
    }
}

function desafioLiberado() {
    return EMBLEMAS_BASE.every(chave => localStorage.getItem(chave) === 'ganhou')
        && Boolean(localStorage.getItem('desafioSecreto'));
}

const DESAFIO_HTML = `
    <div class="beneficio-modal-inner">
        <button type="button" class="beneficio-modal-fechar" data-fechar aria-label="Fechar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12"></path>
            </svg>
        </button>
        <div class="beneficio-modal-topo">
            <span class="beneficio-modal-icone">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="10" rx="2"></rect>
                    <path d="M8 11V7a4 4 0 0 1 8 0v4M12 15v2"></path>
                </svg>
            </span>
            <span class="beneficio-modal-kicker">Desafio secreto</span>
            <h2 id="desafio-titulo">O cofre da Cereja Podre</h2>
            <p class="beneficio-modal-lead">Você tem todos os emblemas e derrotou a Cereja Podre no modo
                <strong data-campo="modo"></strong>. Antes de cair, ela trancou a palavra-chave de um
                <strong>prêmio de verdade</strong> num cofre. Deixe seu email e mandamos o enigma para você abrir.</p>
        </div>

        <form class="desafio-form" data-etapa="form" novalidate>
            <label for="desafio-email">Seu email</label>
            <input type="email" id="desafio-email" name="email" required maxlength="254" autocomplete="email"
                placeholder="voce@exemplo.com">
            <p class="desafio-status" data-campo="status" role="status" aria-live="polite"></p>
            <button type="submit" class="btn-primary desafio-enviar">Receber o enigma</button>
        </form>

        <div class="desafio-enviado" data-etapa="enviado" hidden>
            <p>Enigma enviado para <strong data-campo="email"></strong>. Se não aparecer em alguns minutos,
                confira a caixa de spam.</p>
            <p>Quando descobrir a palavra-chave, mostre para a equipe do Cherry Wellness e retire seu prêmio.
                Não conte para ninguém!</p>
            <div class="desafio-botoes">
                <button type="button" class="btn-secondary" data-outro>Usar outro email</button>
                <button type="button" class="btn-primary" data-fechar>Fechar</button>
            </div>
        </div>
    </div>`;

let desafioModal = null;

function montarDesafioModal() {
    const modal = document.createElement('dialog');
    modal.className = 'beneficio-modal desafio-modal';
    modal.setAttribute('aria-labelledby', 'desafio-titulo');
    modal.innerHTML = DESAFIO_HTML;
    document.body.append(modal);

    const campo = (nome) => modal.querySelector(`[data-campo="${nome}"]`);
    const form = modal.querySelector('[data-etapa="form"]');
    const enviado = modal.querySelector('[data-etapa="enviado"]');
    const input = form.querySelector('input');
    const botaoEnviar = form.querySelector('.desafio-enviar');

    function mostrarEtapa(etapa) {
        form.hidden = etapa !== 'form';
        enviado.hidden = etapa !== 'enviado';
        if (etapa === 'enviado') campo('email').textContent = localStorage.getItem('desafioEnviadoPara');
    }

    function status(texto, erro = false) {
        campo('status').textContent = texto;
        campo('status').classList.toggle('is-erro', erro);
    }

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const email = input.value.trim();

        if (!input.checkValidity() || !email) {
            status('Digite um email válido.', true);
            input.focus();
            return;
        }
        if (Object.values(EMAILJS).some(valor => valor.startsWith('COLE_'))) {
            status('O envio de emails ainda não foi configurado no site. Avise a equipe!', true);
            return;
        }

        botaoEnviar.disabled = true;
        status('Enviando o enigma...');
        try {
            const resposta = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    service_id: EMAILJS.serviceId,
                    template_id: EMAILJS.templateId,
                    user_id: EMAILJS.publicKey,
                    template_params: { to_email: email, modo: localStorage.getItem('desafioSecreto') }
                })
            });
            if (!resposta.ok) throw new Error(await resposta.text());

            localStorage.setItem('desafioEnviadoPara', email);
            status('');
            mostrarEtapa('enviado');
        } catch (erro) {
            console.error('Falha ao enviar o enigma:', erro);
            status('Não deu para enviar agora. Verifique sua internet e tente de novo.', true);
        } finally {
            botaoEnviar.disabled = false;
        }
    });

    modal.querySelector('[data-outro]').addEventListener('click', () => {
        mostrarEtapa('form');
        input.value = '';
        input.focus();
    });

    function fechar() {
        if (!modal.open || modal.classList.contains('is-closing')) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            modal.close();
            return;
        }
        // Espera a animação de saída terminar antes de fechar de fato
        modal.classList.add('is-closing');
        modal.addEventListener('animationend', function aoTerminar(evento) {
            if (evento.target !== modal) return;
            modal.removeEventListener('animationend', aoTerminar);
            modal.classList.remove('is-closing');
            modal.close();
        });
    }

    modal.querySelectorAll('[data-fechar]').forEach(botao => botao.addEventListener('click', fechar));
    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) fechar();
    });
    modal.addEventListener('cancel', (evento) => {
        evento.preventDefault();
        fechar();
    });
    modal.addEventListener('close', () => document.documentElement.classList.remove('modal-aberto'));

    return {
        abrir() {
            campo('modo').textContent = localStorage.getItem('desafioSecreto');
            status('');
            mostrarEtapa(localStorage.getItem('desafioEnviadoPara') ? 'enviado' : 'form');
            modal.classList.remove('is-closing');
            modal.showModal();
            document.documentElement.classList.add('modal-aberto');
        }
    };
}

function abrirDesafioSecreto() {
    if (!desafioLiberado()) return;
    if (!desafioModal) desafioModal = montarDesafioModal();
    desafioModal.abrir();
}
