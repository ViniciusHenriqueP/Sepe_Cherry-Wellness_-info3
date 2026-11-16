# Explicação do código — Cherry Wellness

Site 100% estático (HTML + CSS + JavaScript puro), sem framework e sem servidor. Tudo que "lembra" algo (emblemas, tema, humor) fica no `localStorage` do navegador. A pasta principal é `Visual/`.
> **Versão detalhada, uma por página, com as partes difíceis explicadas:** pasta [`explicacoes/`](explicacoes/) (comece pelo `00-comum-a-todas-as-paginas.md`).


## 1. Como o site é organizado

```
Visual/
├── *.html        11 páginas (uma por arquivo)
├── CSS/          estilos compartilhados (reset, variables, base, modais, minijogo)
│   └── pages/    um CSS por página
├── JS/           scripts compartilhados (tema, menu, progresso, modais, música)
│   └── pages/    um JS por página
├── IMG/ AUDIO/   mídia
ferramentas/gerador-enigma.html   ferramenta interna do desafio secreto
```

Ordem de carregamento dos CSS em toda página: `reset.css` → `variables.css` → `base.css` → `pages/<pagina>.css`. Cada camada só acrescenta ao que veio antes.

## 2. Páginas (HTML)

Todas seguem o mesmo esqueleto semântico: `<header class="navbar">` (logo + `<nav>` + botões de menu e tema) → `<main>` (conteúdo em `<section>`s) → `<footer class="footer">` (marca, redes sociais, copyright).

| Página | Função |
|---|---|
| `index.html` | Home: hero com mascotes, cards das 3 áreas, números da OMS, dica do dia, progresso dos emblemas |
| `vida-em-movimento.html` | Benefícios do exercício para o corpo |
| `jogo-movimento.html` | Pré-treino, benefícios para a mente (pop-ups com vídeo), dados em gráfico, chamada para o minijogo |
| `alimentacao.html` | Nutrientes (um bloco por vez), dados em gráfico, chamada para o minijogo |
| `saudemental.html` | Lembretes, "Como você está hoje?", práticas, dados |
| `emblemas.html` | Estante de emblemas + acesso à Batalha Final e ao desafio secreto |
| `projeto.html` | História do projeto e equipe |
| `jogo-prato.html` · `jogo-ritmo.html` · `jogo-respiracao.html` | Os 3 minijogos (cada um dá um emblema) |
| `jogo-boss.html` | Batalha Final (só libera com os 3 emblemas) |

Detalhes de semântica: um único `<h1>` por página; `<ul>/<li>` para menus, cards e listas; `<figure>` nos gráficos; `aria-label`, `aria-expanded`, `aria-live` nos controles dinâmicos; imagens decorativas com `alt=""` e imagens de conteúdo com `alt` descritivo.

## 3. CSS

- **`reset.css`** — zera margens/estilos padrão do navegador.
- **`variables.css`** — *design tokens*: toda a paleta (`--color-*`), sombras, raios, fontes e transições. O **modo escuro** é só a redefinição dessas variáveis, em dois blocos: `@media (prefers-color-scheme: dark)` (preferência do sistema) e `[data-theme="dark"]` (escolha manual do botão). Mudar uma cor do site = mudar uma linha aqui.
- **`base.css`** — o que todas as páginas dividem: tipografia (Fraunces nos títulos, Times nos subtítulos, Atkinson Hyperlegible no texto), transição entre páginas (`@view-transition`), animação de entrada `[data-reveal]`, navbar, menu hambúrguer mobile, botão "voltar ao topo", botões, divisor quadriculado (feito só com `linear-gradient`), rodapé, cards e `stat-tile`. Respeita `prefers-reduced-motion`.
- **`beneficio-modal.css`, `minijogo.css`, `desafio-secreto.css`** — visual dos pop-ups e da tela de resultado dos jogos.
- **`pages/*.css`** — layout específico de cada página. A abordagem é *mobile first*: o CSS base é do celular e `@media (min-width: ...)` amplia para tablet/desktop (há media queries em todos os arquivos de página).
- Responsividade: `flex`/`grid`, `flex-wrap`, imagens com `max-width: 100%`, espaçamentos e fontes que mudam nos breakpoints, navbar que vira hambúrguer abaixo de 600px.
- O hero da home tem um fundo por CSS (`background-image` com a logo + véu `color-mix` na cor do tema, então funciona no claro e no escuro).

## 4. JavaScript

### Compartilhados (`JS/`)
- **`theme.js`** — roda no `<head>` (para não "piscar"). Lê o tema salvo, ou usa o do sistema; aplica `data-theme` no `<html>`; liga o botão `#theme-toggle`; adiciona a classe `.js` ao `<html>` (o CSS do menu mobile só ativa se o JS existir).
- **`menu.js`** — abre/fecha o menu ☰ no celular (alterna `.menu-aberto` e `aria-expanded`) e cria o botão "voltar ao topo" nas páginas com `data-voltar-ao-topo`, mostrando-o após rolar.
- **`reveal.js`** — `IntersectionObserver` que coloca `.is-visible` nos elementos `[data-reveal]` ao entrarem na tela; filhos de `[data-reveal-group]` aparecem em cascata.
- **`progresso.js`** — objeto `CherryProgresso`: único ponto de leitura/escrita dos emblemas no `localStorage`, com `try/catch` (aba anônima pode bloquear). Mantém as chaves antigas para ninguém perder progresso.
- **`beneficio-modal.js`** — monta o pop-up "Por que isso acontece?" (texto + vídeo do YouTube) a partir dos botões `.beneficio-mais[data-beneficio]`; cada página fornece o conteúdo.
- **`minijogo.js`** — tela compartilhada de "Você venceu / Tente de novo".
- **`trilha-sonora.js`** — música da batalha final, com botão de mudo salvo.
- **`desafio-secreto.js`** — para quem tem os 3 emblemas e vence no Difícil/Impossível: pede um e-mail e envia um enigma via EmailJS (a resposta fica só no template do EmailJS, não no código).

### Por página (`JS/pages/`)
- **`home.js`** — saudação por horário, dica do dia (índice calculado pela data, muda por dia) e contador de emblemas.
- **`alimentacao.js`** — mostra um nutriente por vez; lê `?nutriente=` da URL (os cards da home usam isso).
- **`saudemental.js`** — lembrete que troca a cada 7 s; seletor de humor salvo com a data (`humorDoDia`) e mensagem de feedback; textos dos pop-ups.
- **`jogo-movimento.js`** — dados dos pop-ups de benefícios.
- **`emblemas.js`** — monta a estante a partir do `CherryProgresso`, barra de progresso e liberação da Batalha Final.
- **`jogo-prato.js`** — arrastar alimentos (mouse e toque) até o prato; cada um tem pontos; ≥ 80% saudável dá o emblema.
- **`jogo-ritmo.js`** — jogo de ritmo em 4 pistas (setas/WASD ou toque); energia a 100% vence, a 0% perde; recorde no `localStorage`.
- **`jogo-respiracao.js`** — Q/E (ou botões) para encaixar metades de pulmão; barra de fôlego cheia dá o emblema.
- **`jogo-boss.js`** (maior arquivo) — batalha por turnos: turno do chefe é um desvio de obstáculos, turno do jogador é uma pergunta sobre o conteúdo do site (acerto causa dano, erro cura o chefe) ou ações; vencer o chefe dá o emblema final e pode liberar o desafio secreto.

## 5. Fluxo do progresso

Minijogo vencido → `CherryProgresso` grava o emblema → `home.js` e `emblemas.js` leem e atualizam a interface → com os 3 emblemas, a Batalha Final é liberada → vencê-la no Difícil/Impossível libera o desafio secreto.
