# Parte comum a todas as páginas

Tudo aqui vale para as 11 páginas. As explicações por página só falam do que é específico dela.

## 1. O esqueleto HTML (igual em todas)

```html
<head> meta charset, meta viewport, <title>, CSS (reset → variables → base → pages/x), fontes, theme.js, menu.js (defer), progresso.js </head>
<body data-voltar-ao-topo>
  <header class="navbar">  logo · <nav> links · botão ☰ · botão tema  </header>
  <main> ... <section>s ... </main>
  <footer class="footer"> marca · redes · copyright </footer>
</body>
```

- `<meta name="viewport" content="width=device-width, initial-scale=1.0">` é o que faz o celular usar a largura real da tela (sem ele, a página aparece "encolhida" e as media queries não funcionam).
- `<nav aria-label="Menu principal">` + a classe `active` no link da página atual mostram onde a pessoa está.
- `data-voltar-ao-topo` no `<body>` é um "interruptor": se existir, o `menu.js` cria o botão de voltar ao topo.

## 2. Ordem dos CSS e por que importa

`reset.css` (zera estilos do navegador) → `variables.css` (cores) → `base.css` (navbar, rodapé, botões) → `pages/<pagina>.css`.
O CSS aplica a regra **mais específica**, e, em empate, **a que vem por último**. Por isso a página sempre vem depois da base: ela pode sobrescrever o que for preciso.

## 3. `variables.css` — o sistema de cores

Usa **variáveis CSS**: `--color-text: #4A1515;` e depois `color: var(--color-text);`.
O **modo escuro** não reescreve o site: só redefine as variáveis. Há dois blocos com o mesmo conteúdo:
1. `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {...} }` — segue o sistema, **a não ser que** a pessoa tenha escolhido claro à mão.
2. `:root[data-theme="dark"] {...}` — escolha manual (botão).

> **Parte difícil:** por que dois blocos iguais? Porque CSS não permite "se (sistema escuro) OU (atributo escuro)" num bloco só. O `:not([data-theme="light"])` garante que a escolha manual sempre vença o sistema.

## 4. `theme.js` — como o tema funciona

1. Roda no `<head>` (antes de a página ser pintada) para evitar o "piscão" branco.
2. `resolveTheme()`: usa o valor salvo no `localStorage` (`cherry-wellness-theme`); se não houver, pergunta ao sistema com `window.matchMedia("(prefers-color-scheme: dark)")`.
3. `applyTheme()` coloca `data-theme="dark|light"` no `<html>` → o CSS reage sozinho.
4. Adiciona a classe `js` no `<html>`. O CSS do menu mobile só esconde os links se `.js` existir — assim, **sem JavaScript, o menu continua visível** (acessibilidade/robustez).
5. Depois do `DOMContentLoaded` liga o botão: alterna, salva e atualiza `aria-pressed` (leitor de tela sabe se o escuro está ligado).

## 5. `menu.js`

- **Menu ☰:** `definir(aberto)` liga/desliga a classe `.menu-aberto` na navbar e atualiza `aria-expanded`/`aria-label`. Fecha com **Esc** (e devolve o foco ao botão) e ao clicar em um link. No CSS, os três risquinhos viram um "X" com `transform` no `.menu-aberto`.
- **Voltar ao topo:** cria o `<button>` por JS, adiciona ao `<body>` e alterna `.is-visivel` quando `scrollY > 600`. O listener de scroll usa `{ passive: true }` (avisa o navegador que não vai bloquear a rolagem → mais fluido). Ao clicar, `scrollTo({top:0, behavior:'smooth'})`, ou `'auto'` se a pessoa pediu menos movimento.

## 6. `reveal.js` — animação ao rolar

- No HTML: `data-reveal="up|left|right|scale"`. No CSS (`base.css`), esses elementos começam com `opacity: 0` + deslocamento; ao ganhar `.is-visible` voltam ao normal com `transition`.
- O JS usa **`IntersectionObserver`**: um "vigia" que avisa quando o elemento entra na tela (`threshold: 0.15` = 15% visível). Depois de aparecer, `unobserve` (não precisa mais vigiar).
- **Cascata:** em `[data-reveal-group]`, cada filho recebe `--reveal-delay` = posição × 0,12 s (máx. 0,6 s) — por isso os cards entram um depois do outro.
- `window.CherryReveal.refresh()` existe para quem cria elementos depois (a página de emblemas).
- `prefers-reduced-motion: reduce` no CSS anula tudo.

## 7. `progresso.js` — o "caderninho" de emblemas

Objeto global `CherryProgresso` (padrão "módulo": uma função que se executa na hora `(function(){...})()` e só publica o que quer em `window`).
- `CHAVES` traduz apelido → nome real no `localStorage` (`prato → emblemaPrato`...).
- `ler/gravar` têm `try/catch`: em aba anônima o `localStorage` pode lançar erro; o site continua, só não lembra.
- `ganhou(nome)`, `marcar(nome)`, `contarBase()` (quantos dos 3 emblemas), `temTodosBase()` (libera a batalha final).
- Precisa ser carregado **antes** dos scripts dos jogos, senão `CherryProgresso` não existiria.

## 8. `base.css` — blocos principais

| Bloco | Ideia |
|---|---|
| Tipografia | `h1,h2` em Fraunces; subtítulos em Times; texto em Atkinson Hyperlegible (feita para legibilidade). `text-wrap: balance` equilibra as linhas dos títulos. |
| `@view-transition` | Troca de página com fade nativo (MPA View Transitions), com fallback `pageEnter`. |
| Navbar | `flex-direction: column` no celular; vira `row` com `justify-content: space-between` a partir de 600px. O sublinhado animado dos links é um `::after` com `transform: scaleX(0→1)`. |
| Botões | `.btn-secondary` tem um `::before` que cresce de `width:0` a `100%` no hover (efeito de "preencher"). |
| Divisor | `.checkerboard-divider` desenha o xadrez só com 4 `linear-gradient` a 45° — sem imagem. |
| Rodapé | `flex` em coluna no celular, em linha a partir de 640px. |
| `stat-tile`, `.card` | Componentes reaproveitados (números em destaque, cards). |
| Utilitários | `.accent-green/red/sage`, `.link-limpo`, `.svg-oculto`. Definem `--stat-accent`/`--chart-color`, usados pelos componentes. |

**Mobile first:** o CSS base é o do celular; `@media (min-width: X)` acrescenta o do tablet/desktop. Há `:focus-visible` com contorno amarelo para navegação por teclado.

## 9. Gráficos de barras (sem biblioteca)

Em `jogo-movimento.html` e `alimentacao.html`: `<figure>` → `<ul class="chart-bars">` → cada `<li>` tem um `.chart-bar-track` (trilho) e um `.chart-bar-fill` cuja `width` é a própria porcentagem do dado (`style="width: 24.3%"`). A cor vem de `var(--chart-color)`, herdada da classe `accent-*`. É acessível: `aria-labelledby` liga o `<figure>` ao título, e a fonte vem em `<p class="chart-source">`.
