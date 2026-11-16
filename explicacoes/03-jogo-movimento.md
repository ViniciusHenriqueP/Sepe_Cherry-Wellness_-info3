# jogo-movimento.html — Pré-treino, mente e números

**Arquivos:** `jogo-movimento.html`, `CSS/pages/jogo-movimento.css`, `JS/pages/jogo-movimento.js`, `JS/beneficio-modal.js` + `CSS/beneficio-modal.css`.

> Apesar do nome "jogo", é uma página de conteúdo (parte 2 de "Vida em movimento"). O jogo mesmo é o `jogo-ritmo.html`, ao qual esta página aponta no fim.

## Seções (todas dentro do `<main>`)
1. `.hero-section-clean` — `<h1>Vida em Movimento</h1>`.
2. `#pre-treino` — imagem comparando músculo hidratado × desidratado (com legendas em `<span>` + SVG) e o texto do pré-treino (`<h2>`).
3. `#beneficios-mente` — cards com botão **"Saiba mais"** (`.beneficio-mais[data-beneficio="humor"]`).
4. `#numeros` — gráfico de barras com dados da OMS (ver "parte comum", item 9).
5. `.minijogo-cta` — convite para o Ritmo em Movimento.
6. `.fontes-section` — referências.

## Pop-up "Por que isso acontece?"
- `jogo-movimento.js` é só **dados**: um objeto `beneficios` com `titulo`, `lead`, `pontos` (lista de pares `[termo, explicação]`), `pratica` e `video` (`{id do YouTube, titulo, canal}`). No fim chama `iniciarBeneficioModal(beneficios, '.card...')`.
- A mecânica fica em `beneficio-modal.js` (compartilhada com Saúde mental). Veja o arquivo `09-pop-up-beneficio-modal.md`.

## CSS
- Um `@media (max-width: 768px)` ajusta imagem, legendas e espaçamentos para celular.
- As barras do gráfico usam as classes de `base.css`; só a `width` está no HTML, porque é o próprio dado.
