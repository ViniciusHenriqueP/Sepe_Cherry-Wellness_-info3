# projeto.html — Nosso projeto

**Arquivos:** `projeto.html`, `CSS/pages/projeto.css`. **Sem JS próprio.**

## Seções (todas dentro de `<main class="projeto-pagina">`)
1. `.projeto-hero` — `<h1>`, descrição e dois botões-âncora (`#equipe`, `#como-funciona`).
2. `.projeto-nome` — o trocadilho "Cherry Wellness = seja saudável".
3. `#objetivo` — 3 `.projeto-card` (problema, ideia, público).
4. `#como-funciona` — **`<ol>` numerada** com 4 passos (usa `<ol>` porque a ordem importa).
5. `#equipe` — `<ul class="projeto-equipe">`; cada `<li class="membro membro--cor">` tem foto, `<h3>`, função e descrição.
6. Rodapé.

Os comentários `✏️ EDITAR` no HTML dizem onde trocar texto/foto — são para a equipe, não aparecem na tela.

## CSS (o mais "responsivo" do site)
- Equipe: 1 coluna → `repeat(2,1fr)` (600px) → `repeat(4,1fr)` (1000px).
- `grid-template-columns: repeat(auto-fit, minmax(240px, 1fr))` — **a parte difícil**: *"crie quantas colunas de pelo menos 240px couberem, e distribua o resto"*. É um grid que se adapta sozinho **sem media query**.
- As cores dos círculos vêm das classes `membro--vermelho/verde/salvia/amarelo`, que só trocam uma variável de cor.
- Imagem do hero com `clamp(260px, 36vw, 460px)`.
