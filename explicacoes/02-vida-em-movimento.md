# vida-em-movimento.html — Benefícios para o corpo

**Arquivos:** `vida-em-movimento.html`, `CSS/pages/vida-em-movimento.css`. **Sem JS próprio** (só tema, menu e reveal).

## Estrutura
- `<main class="movimento-page">` com: **hero** (pill + `<h1>` + parágrafo + ilustração), divisor quadriculado e **`#beneficios-corpo`**.
- Os benefícios são um **grid de cards**; cada card tem um ícone SVG inline (`.icon-line`, `aria-hidden="true"` porque é decoração), um `<h3>` e uma frase.
- O `id="beneficios-corpo"` é o destino do link da home (`vida-em-movimento.html#beneficios-corpo`).

## CSS
- Grade responsiva por breakpoints: 1 coluna (celular) → `repeat(2, 1fr)` a 600px → `repeat(5, 1fr)` a 980px. `1fr` = "uma fração do espaço livre", então as colunas sempre se dividem igualmente.
- Os ícones usam `stroke: currentColor`: o traço assume a cor do texto, então mudam sozinhos no modo escuro.

## Parte "difícil"
SVG inline: `viewBox="0 0 24 24"` define um sistema de coordenadas próprio; o desenho escala para qualquer `width`/`height` sem perder qualidade. Cada `<path d="M12 3v8...">` é uma sequência de comandos (M = mover, v = linha vertical, c = curva).
