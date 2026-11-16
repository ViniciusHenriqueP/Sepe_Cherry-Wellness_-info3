# alimentacao.html — Prato & Saúde

**Arquivos:** `alimentacao.html`, `CSS/pages/alimentacao.css`, `JS/pages/alimentacao.js`.

## Estrutura
- Hero (`<h1>Prato & Saúde</h1>`), faixa "Escolhas que fazem a diferença" (`<h2>`), seleção de nutrientes, detalhes, gráfico de obesidade (Vigitel 2006 → 2023), chamada para o minijogo e fontes.
- **Nutrientes:** 4 links `.nutriente-link` (proteínas, carboidratos, gorduras, vitaminas) e 4 blocos `#content-proteinas`, `#content-carboidratos`... com a classe `.nutriente-bloco content-escondido`.

## Como o "mostrar um por vez" funciona (a parte difícil)
É uma troca de **classe**, não de conteúdo:
```js
function mostrarNutriente(id) {
  esconde #mensagem-inicial;
  todos os .nutriente-bloco  → adiciona .content-escondido  (CSS: display:none)
  #content-<id>              → remove  .content-escondido, scrollIntoView suave
}
```
- O clique é ligado no HTML com `onclick="mostrarNutriente('proteinas')"`.
- **Link direto:** ao carregar, `new URLSearchParams(window.location.search).get('nutriente')` lê o `?nutriente=...` da URL. Por isso `alimentacao.html?nutriente=gorduras` (usado nos cards da home) já abre o bloco certo.

## CSS
- `@keyframes surgimentoSuave` anima a entrada do bloco que aparece.
- `@media (min-width: 760px)` coloca os 4 nutrientes lado a lado; `@media (max-width: 768px)` ajusta títulos do hero.
