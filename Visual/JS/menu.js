/* =====================================================================
   menu.js — Menu do celular e botão "voltar ao topo" 📱⬆️
   ---------------------------------------------------------------------
   Usado em: TODAS as páginas (carregado com "defer" no <head>).
   Visual em: CSS/base.css (seções "MENU MOBILE" e "VOLTAR AO TOPO").

   1. Menu hambúrguer: em telas pequenas, os links da navbar ficam
      guardados atrás do botão ☰, para não ocuparem metade da tela.
      No computador o botão nem aparece.
   2. Voltar ao topo: nas páginas compridas (que têm
      <body data-voltar-ao-topo>), aparece um botãozinho no canto
      depois que a pessoa rola um pouco.
   ===================================================================== */
(function () {
    "use strict";

    // ----- 1. Menu hambúrguer -----
    function iniciarMenu() {
        var navbar = document.querySelector('.navbar');
        var botao = document.querySelector('.menu-toggle');
        var menu = document.getElementById('menu-principal');
        if (!navbar || !botao || !menu) return;

        // Abre ou fecha, e conta para os leitores de tela como ficou
        function definir(aberto) {
            navbar.classList.toggle('menu-aberto', aberto);
            botao.setAttribute('aria-expanded', String(aberto));
            botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
        }

        botao.addEventListener('click', function () {
            definir(!navbar.classList.contains('menu-aberto'));
        });

        // Apertou Esc com o menu aberto? Fecha e devolve o foco ao botão
        document.addEventListener('keydown', function (evento) {
            if (evento.key === 'Escape' && navbar.classList.contains('menu-aberto')) {
                definir(false);
                botao.focus();
            }
        });

        // Clicou num link (ex.: âncora da mesma página)? Fecha o menu
        menu.addEventListener('click', function (evento) {
            if (evento.target.closest('a')) definir(false);
        });
    }

    // ----- 1a. Batalha Final só aparece no menu com os 3 emblemas -----
    function liberarBatalhaFinal() {
        var liberada = window.CherryProgresso && window.CherryProgresso.temTodosBase();
        document.querySelectorAll('[data-requer-emblemas]').forEach(function (item) {
            item.hidden = !liberada;
        });
    }

    // ----- 1b. Submenus no toque: segurar o dedo, arrastar e soltar na opção -----
    // No computador o submenu abre com o mouse (hover) ou com o teclado, só em CSS.
    // No celular, um toque rápido abre a página do item; SEGURAR (0,35s) abre a
    // lista, e ao soltar o dedo sobre uma opção a pessoa vai para ela.
    function iniciarSubmenusNoToque() {
        document.querySelectorAll('.tem-submenu').forEach(function (item) {
            var link = item.querySelector(':scope > a');
            var timer = null;
            var aberto = false;
            var alvo = null;

            function marcar(novo) {
                if (novo === alvo) return;
                if (alvo) alvo.classList.remove('destaque');
                alvo = novo;
                if (alvo) alvo.classList.add('destaque');
            }

            function fechar() {
                clearTimeout(timer);
                aberto = false;
                marcar(null);
                item.classList.remove('submenu-aberto');
            }

            link.addEventListener('touchstart', function () {
                timer = setTimeout(function () {
                    aberto = true;
                    item.classList.add('submenu-aberto');
                }, 350);
            }, { passive: true });

            link.addEventListener('touchmove', function (evento) {
                if (!aberto) { clearTimeout(timer); return; }
                evento.preventDefault(); // não rola a página enquanto arrasta
                var toque = evento.touches[0];
                var sob = document.elementFromPoint(toque.clientX, toque.clientY);
                var opcao = sob && sob.closest('.submenu a');
                marcar(opcao && item.contains(opcao) ? opcao : null);
            }, { passive: false });

            link.addEventListener('touchend', function (evento) {
                clearTimeout(timer);
                if (!aberto) return; // toque rápido: segue o link normalmente
                evento.preventDefault();
                var destino = alvo;
                fechar();
                if (destino) window.location.href = destino.href;
            });

            link.addEventListener('touchcancel', fechar);
            link.addEventListener('contextmenu', function (e) { if (aberto) e.preventDefault(); });
        });
    }

    // ----- 2. Voltar ao topo -----
    function iniciarVoltarAoTopo() {
        if (!document.body.hasAttribute('data-voltar-ao-topo')) return;

        var botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'voltar-ao-topo';
        botao.setAttribute('aria-label', 'Voltar ao topo da página');
        botao.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"></path></svg>';
        document.body.append(botao);

        // Só aparece depois de rolar uns 600px (antes disso, o topo está pertinho)
        function atualizar() {
            botao.classList.toggle('is-visivel', window.scrollY > 600);
        }
        window.addEventListener('scroll', atualizar, { passive: true });
        atualizar();

        // Sobe suave — ou na hora, para quem prefere menos movimento
        botao.addEventListener('click', function () {
            var reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduzir ? 'auto' : 'smooth' });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        iniciarMenu();
        liberarBatalhaFinal();
        iniciarSubmenusNoToque();
        iniciarVoltarAoTopo();
    });
})();
