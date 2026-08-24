(function () {
    "use strict";

    var STORAGE_KEY = "cherry-wellness-theme";
    var root = document.documentElement;

    function resolveTheme() {
        var saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "dark" || saved === "light") return saved;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
    }

    function currentTheme() {
        return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
    }

    applyTheme(resolveTheme());

    document.addEventListener("DOMContentLoaded", function () {
        var toggle = document.getElementById("theme-toggle");
        if (!toggle) return;

        toggle.setAttribute("aria-pressed", String(currentTheme() === "dark"));

        toggle.addEventListener("click", function () {
            var next = currentTheme() === "dark" ? "light" : "dark";
            localStorage.setItem(STORAGE_KEY, next);
            applyTheme(next);
            toggle.setAttribute("aria-pressed", String(next === "dark"));
        });
    });
})();
