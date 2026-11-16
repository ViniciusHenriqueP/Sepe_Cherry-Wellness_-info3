/* =====================================================================
   theme.js — Modo claro / modo escuro 🌞🌙
   ---------------------------------------------------------------------
   Usado em: TODAS as páginas (carregado no <head>).

   Por que no <head> e não no fim da página? Porque assim o tema certo
   é aplicado antes de a página aparecer, evitando aquele "piscão"
   branco quando a pessoa prefere o modo escuro.

   Como funciona:
   1. Se a pessoa já escolheu um tema antes, usamos o que ela escolheu
      (fica salvo no navegador, no localStorage).
   2. Se nunca escolheu, seguimos a preferência do sistema dela.
   3. O botão #theme-toggle da navbar alterna entre os dois.

   As cores de cada tema ficam em CSS/variables.css, no seletor
   [data-theme="dark"].
   ===================================================================== */
(function () {
    "use strict";

    // Nome da "gaveta" no navegador onde guardamos a escolha da pessoa
    var STORAGE_KEY = "cherry-wellness-theme";
    var root = document.documentElement; // a tag <html>

    // Descobre qual tema usar: primeiro a escolha salva, depois o sistema
    function resolveTheme() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    // Aplica o tema colocando data-theme="dark" ou "light" no <html>;
    // o CSS cuida do resto trocando as variáveis de cor
    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
    }

    // Lê qual tema está ativo agora
    function currentTheme() {
        return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    // Aplica já, antes da página ser desenhada
    applyTheme(resolveTheme());

    // Avisa o CSS que o JavaScript está funcionando. O menu do celular
    // só fica escondido atrás do botão ☰ quando essa classe existe;
    // sem JS, os links continuam sempre visíveis (ninguém fica preso).
    root.classList.add("js");

    // O botão só existe depois que o HTML carrega, então esperamos
    document.addEventListener("DOMContentLoaded", function () {
        var toggle = document.getElementById("theme-toggle");
        if (!toggle) return; // página sem botão? tudo bem, segue a vida

        // aria-pressed avisa leitores de tela se o modo escuro está ligado
        toggle.setAttribute("aria-pressed", String(currentTheme() === "dark"));

        // Clicou: troca o tema, salva a escolha e atualiza o botão
        toggle.addEventListener("click", function () {
            var next = currentTheme() === "dark" ? "light" : "dark";
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
            toggle.setAttribute("aria-pressed", String(next === "dark"));
        });
    });
})();
