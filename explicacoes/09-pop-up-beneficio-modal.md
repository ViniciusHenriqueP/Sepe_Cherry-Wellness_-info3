# Pop-up "Por que isso acontece?" (`beneficio-modal.js`)

Usado em `jogo-movimento.html` e `saudemental.html`. Cada página só fornece **dados**; o pop-up é criado uma única vez.

## Como funciona, passo a passo
1. A página chama `iniciarBeneficioModal(conteudo, seletorDoCard, opcoes)`.
2. O JS cria um elemento **`<dialog>`** (a tag nativa de pop-up do HTML) e preenche com `MODAL_HTML`. Campos vazios têm `data-campo="titulo"`, `data-campo="lead"`...; a função auxiliar `campo(nome)` os encontra.
3. Cada botão `.beneficio-mais` tem `data-beneficio="humor"`. Ao clicar, `abrir(botao)` busca `conteudo["humor"]`, preenche os campos, **clona o ícone SVG do próprio card** (`cloneNode(true)`), cria a lista numerada dos pontos e chama **`modal.showModal()`**.
4. `showModal()` já dá, de graça: fundo escurecido (`::backdrop`), foco preso dentro do pop-up e fechamento com Esc. Isso é melhor (e mais acessível) que um `<div>` feito à mão.

## Partes difíceis
- **Animação de saída:** `dialog.close()` fecha na hora, sem animar. Então o evento `cancel` (Esc) é interceptado com `preventDefault()`, e `fechar()` adiciona a classe `.is-closing`, espera o evento `animationend` (checando `evento.target === modal` para ignorar animações dos filhos) e só então chama `close()`. Quem pediu menos movimento (`prefers-reduced-motion`) fecha direto.
- **Clique fora fecha:** o `<dialog>` ocupa a tela toda; se `evento.target === modal` (clicou no fundo, não em um filho), fecha.
- **Vídeo leve (lazy):** em vez de carregar o `<iframe>` do YouTube (pesado), mostra só a **miniatura** (`i.ytimg.com/vi/ID/hqdefault.jpg`) com um botão de play. Só ao clicar troca por um `<iframe>` de `youtube-nocookie.com` (modo com menos rastreamento) com `autoplay=1`.
- Ao fechar, `campo('player').replaceChildren()` remove o iframe — senão o vídeo continuaria tocando com o pop-up fechado.
- Os pontos entram em sequência: `--ponto-delay` = `0.12 + i × 0.08` s, lido pela animação no CSS.
- Todo o texto vem de `textContent` (não `innerHTML`), que impede injeção de HTML.

## CSS (`beneficio-modal.css`)
`::backdrop` com `backdrop-filter: blur(3px)`; `@keyframes modalEntra/modalSai/fundoEntra/fundoSai/pontoSurge`; `aspect-ratio: 16 / 9` no vídeo (mantém a proporção sem altura fixa); `prefers-reduced-motion` desliga as animações.
