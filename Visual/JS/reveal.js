(function () {
    "use strict";

    var observer = null;

    function prepare(el, index) {
        if (!el.style.getPropertyValue("--reveal-delay")) {
            var group = el.closest("[data-reveal-group]");
            var siblings = group ? group.querySelectorAll("[data-reveal]") : null;
            var position = siblings ? Array.prototype.indexOf.call(siblings, el) : index;
            el.style.setProperty("--reveal-delay", Math.min(position * 0.12, 0.6) + "s");
        }
    }

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
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
        }

        observe(elements);
    });

    window.CherryReveal = { refresh: refresh };
})();
