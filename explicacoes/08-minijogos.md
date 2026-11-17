# Os minijogos (prato, ritmo, respiração)

Padrão comum: cada jogo vence → `CherryProgresso.marcar('...')` → emblema. Os de ritmo e respiração usam o mesmo desenho de **loop de jogo** e a tela de resultado de `minijogo.js`.

---
## jogo-prato.html — "Monte seu Prato" (`JS/pages/jogo-prato.js`)

**HTML:** grade `#comidas-grid` com 6 alimentos (cada um é um emoji dentro de `.emoji-arrastavel`), o prato `#prato-alvo`, contador `#prato-contador`, aviso `role="status" aria-live="polite"` (leitor de tela anuncia), botões e `#area-resultado` (`hidden`).

**Arrastar e soltar feito à mão (a parte mais difícil)** — sem biblioteca, para funcionar em **mouse e toque**:
1. `mousedown`/`touchstart` chama `iniciarArrasto`. `e.preventDefault()` impede o navegador de selecionar texto/rolar.
2. O emoji vira `position: fixed` e é movido a cada `mousemove`/`touchmove` com `left/top` = posição do dedo − metade do tamanho (para ficar centrado no cursor).
3. `e.clientX || e.touches[0].clientX`: no mouse existe `clientX`; no toque ele fica em `touches[0]`.
4. `dentroDoPrato(x, y)` compara o ponto com `getBoundingClientRect()` do prato (caixa que contorna o elemento).
5. Ao soltar (`mouseup`/`touchend`) **remove os listeners** (senão acumulariam a cada arrasto), e se estava dentro do prato → `adicionarAoPrato`. No `touchend` as coordenadas estão em `changedTouches`.
6. `{ passive: false }` no `touchstart/touchmove` é obrigatório para o `preventDefault` funcionar em toque.
7. O alimento no prato é um `<button>`: tocar nele o remove (teclado também funciona).

**Cálculo:** objeto `valoresNutricionais` (alface 25, frango 20, arroz 15, azeite 20, linguiça −10, refri −20). O prato ideal soma 80 → `Math.round(pontos / 80 * 100)`, limitado entre 0 e 100. **≥ 80% = vitória e emblema**.

**Truques:** `void elemento.offsetWidth` força o navegador a recalcular o layout para **reiniciar uma animação CSS**; o dobro `requestAnimationFrame` espera a página pintar antes de mudar a `width` da barra (senão a transição não aconteceria).

---
## jogo-ritmo.html — "Ritmo em Movimento" (`JS/pages/jogo-ritmo.js`)

Jogo de ritmo em 4 pistas. Setas sobem; a pessoa aperta a tecla quando passam pelo receptor.

**Loop de jogo (`gameLoop`)** usa `requestAnimationFrame(timestamp)`:
- `deltaMs = timestamp − lastTimestamp` (tempo desde o quadro anterior), limitado a 100 ms. Todo movimento é `velocidade(px/s) × deltaMs/1000`. **Por quê?** Se movesse "X px por quadro", em monitor de 144 Hz o jogo seria 2,4× mais rápido que em 60 Hz. Com `delta time`, a velocidade é a mesma em qualquer tela.
- O limite de 100 ms evita as setas "teletransportarem" quando a aba volta de segundo plano.
- Dois cronômetros acumuladores: `spawnTimer` (nasce uma seta quando passa de `spawnInterval`) e `speedUpTimer` (a cada 5 s acelera +6 px/s e reduz o intervalo, com mínimo 667 ms). O `-=` em vez de `= 0` não "perde" o excesso de tempo.
- Percorre `notes` **de trás para a frente** (`for i = length-1; i>=0; i--`) para poder `splice` (remover) sem pular elementos.

**Acerto (`checkHit`)**: acha a seta da pista dentro da zona `[receptorY−50, receptorY+90]`. Distância ao centro: ≤15 px = PERFECT (+100, +8 energia), ≤35 = GOOD (+50, +5), senão OK (+20, +2). Apertar sem seta por perto: −3 de energia; seta que escapa: −6.
**Fim:** energia ≥100 vitória (emblema), ≤0 derrota. Recorde em `localStorage` (`recordeRitmo`).
**Controles:** objeto `keys` mapeia teclas (setas e WASD, maiúsculas e minúsculas) → índice da pista; botões na tela com `touchstart` e `click`.
**Dificuldades:** mudam velocidade inicial/intervalo; o Difícil adiciona receptores balançando (classes `mov-alt-N`) e setas que "teleportam" (20% de chance).
**Sons:** o som de acerto é cortado em 670 ms com `setTimeout(pause)`, para não embolar; `.play().catch(() => {})` ignora o erro de autoplay bloqueado.

---
## jogo-respiracao.html — "Respire e Recarregue" (`JS/pages/jogo-respiracao.js`)

Mesma arquitetura do ritmo, mas as "notas" são metades de pulmão que andam **na horizontal**, de dois lados, em direção ao pulmão central. **Q** = metade da esquerda, **E** = da direita.
- `DIFICULDADES` guarda velocidade, intervalo, aceleração e intervalo mínimo de cada nível (fácil/médio/difícil) em um só objeto; `iniciarJogo(nivel)` lê dele.
- **Ponto de encaixe (`alvoDaPista`):** não é o meio do pulmão, é o centro de cada lobo. `LOBE_OFFSET_RATIO = 39.4/200` converte a posição do lobo no desenho SVG (viewBox de 200) em fração da largura real, então funciona em qualquer tamanho de tela.
- A largura da peça (`el.offsetWidth`) é lida **depois** de inserir no DOM, porque vem do CSS (menor no celular).
- Acertos por distância em px: `PERFECT_PX=16`, `GOOD_PX=36`, `OK_PX=62`. Peça que passa de `alvo ± OK_PX` conta como erro (−6 fôlego).
- O lado esquerdo reaproveita o mesmo `<use href="#lobo-pulmao">` **espelhado** com `transform="translate(60,0) scale(-1,1)"` (um desenho só, dois lados).
- Fôlego 100 = emblema Bem-Estar Mental; 0 = derrota.

---
## `minijogo.js` (tela de resultado)
`mostrarTelaResultado(overlay, {vitoria, titulo, mensagem})` monta ícone + título + botões dentro do overlay. Usa `textContent` para o título (seguro) e `innerHTML` para a mensagem (precisa de `<strong>`). "Jogar de novo" = `location.reload()`, a forma mais simples de zerar o estado.
