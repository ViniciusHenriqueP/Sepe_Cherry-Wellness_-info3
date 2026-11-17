/* =====================================================================
   reveal.js — Animação de "aparecer ao rolar a página" ✨
   ---------------------------------------------------------------------
   Usado em: páginas de conteúdo (home, alimentação, saúde mental,
   movimento, emblemas, projeto e vida-em-movimento.html).

   Como usar no HTML:
     <h2 data-reveal="up">Título</h2>        → sobe suavemente
     data-reveal="left" | "scale" ...         → outras direções (ver base.css)
     <ul data-reveal-group> ... </ul>         → os filhos aparecem um
                                                depois do outro, em cascata

   Quando o elemento entra na tela, ganha a classe .is-visible e o CSS
   (CSS/base.css) faz a animação. Quem prefere menos movimento no
   sistema (prefers-reduced-motion) vê tudo direto, sem animação.

   Se uma página cria elementos depois de carregar (ex.: emblemas.js),
   ela chama window.CherryReveal.refresh() para animá-los também.
   ===================================================================== */
(function () {
    "use strict";

    // O "vigia" que avisa quando um elemento entra na tela
    var observer = null;

    // Calcula um pequeno atraso para cada item de um grupo, criando o
    // efeito cascata (0s, 0.12s, 0.24s...). Limitado a 0.6s para ninguém
    // ficar esperando demais.
    function prepare(el, index) {
        if (!el.style.getPropertyValue("--reveal-delay")) {
            var group = el.closest("[data-reveal-group]");
            var siblings = group ? group.querySelectorAll("[data-reveal]") : null;
            var position = siblings ? Array.prototype.indexOf.call(siblings, el) : index;
            el.style.setProperty("--reveal-delay", Math.min(position * 0.12, 0.6) + "s");
        }
    }

    // Coloca cada elemento sob observação. Se o navegador for antigo e
    // não tiver IntersectionObserver, mostramos tudo de uma vez.
    function observe(elements) {
        elements.forEach(function (el, index) {
            prepare(el, index);

            if (!observer) {
                el.classList.add("is-visible");
                return;
            }

            observer.observe(el);
        });
    }

    // Procura elementos novos que ainda não apareceram
    function refresh() {
        observe(document.querySelectorAll("[data-reveal]:not(.is-visible)"));
    }

    document.addEventListener("DOMContentLoaded", function () {
        var elements = document.querySelectorAll("[data-reveal]");
        if (!elements.length) return;

        if ("IntersectionObserver" in window) {
            observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        // Já apareceu uma vez, não precisa vigiar mais
                        observer.unobserve(entry.target);
                    }
                });
            // threshold 0.15 = dispara quando 15% do elemento está visível
            }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
        }

        observe(elements);
    });

    // Deixa o refresh disponível para outros scripts
    window.CherryReveal = { refresh: refresh };
})();
