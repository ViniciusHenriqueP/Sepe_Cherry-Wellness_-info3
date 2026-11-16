# index.html — Página inicial

**Arquivos:** `index.html`, `CSS/pages/home.css`, `JS/pages/home.js` (+ `progresso.js`).

## Estrutura (HTML)
1. **Navbar** (ver "parte comum").
2. **`.hero`** — `<h1>`, subtítulo, dois botões e a imagem dos mascotes. No celular a imagem fica **em cima** (`flex-direction: column-reverse`) e no desktop ao lado do texto.
   - Os botões estão dentro de `<ul><li>` para poderem usar `data-reveal` em cascata.
   - `Nossa Equipe` aponta para `projeto.html#equipe` (âncora: o `#equipe` é o `id` da seção de equipe).
   - `<p id="saudacao" hidden>` fica escondido até o JS preencher.
3. **`.cards-container`** — 3 cards (movimento, alimentação, mente), cada um com `<h3><a>`, lista de atalhos e botão. Os atalhos da alimentação usam `?nutriente=proteinas` (lido pela página de alimentação).
4. **`.stats-section`** — 3 `stat-tile` com números da OMS (links para a fonte).
5. **`.home-cantinho`** — "dica do dia" e progresso dos emblemas.
6. **Rodapé.**

## CSS (`home.css`)
- Hero: mobile é coluna; `@media (min-width: 600px)` vira linha. A imagem usa `max-width: clamp(250px, 40vw, 500px)` → **`clamp(min, ideal, max)`** cresce com a tela mas nunca passa dos limites (ótimo para imagem adaptável).
- Fundo do hero: `background-image` com **duas camadas** — um véu `linear-gradient` da cor do tema (por cima) e a logo (embaixo). `color-mix(in srgb, var(--color-bg) 94%, transparent)` mistura a cor do tema com transparência, então funciona no claro e no escuro.
- `@media (min-width: 700px)` usa `grid-template-columns: 1.4fr 1fr` (a coluna da esquerda é 1,4× a da direita).

## JS (`home.js`) — as 3 funções
1. **`mostrarSaudacao`:** `new Date().getHours()` → 5–11 "Bom dia", 12–17 "Boa tarde", resto "Boa noite"; depois tira o `hidden`.
2. **`mostrarDicaDoDia`** *(a mais "esperta")*: `Math.floor(Date.now() / 86400000)` = quantos dias desde 1970 (86 400 000 ms = 1 dia). `% DICAS.length` (resto da divisão) transforma esse número em um índice 0–11 que gira. Resultado: a dica muda **uma vez por dia** e é a mesma para todo mundo, sem sorteio e sem servidor.
3. **`mostrarProgresso`:** lê `CherryProgresso.contarBase()`; monta `'🍒'.repeat(total) + '⚪'.repeat(3-total)` e escolhe o convite conforme 0, 1–2 ou 3 emblemas (e se já venceu o chefe).
