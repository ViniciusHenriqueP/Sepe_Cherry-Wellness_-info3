# jogo-boss.html — Batalha Final (a parte mais complexa do site)

**Arquivos:** `jogo-boss.html`, `CSS/pages/jogo-boss.css`, `JS/pages/jogo-boss.js` (~1000 linhas), `JS/trilha-sonora.js`, `JS/desafio-secreto.js`, `JS/minijogo.js`.
Inspirada em *Undertale*: turnos alternados — o chefe ataca, depois é a sua vez.

## Ideia geral
O jogo é uma **máquina de estados** (`estado = 'inicio' | 'dialogo' | 'ataque' | 'pergunta' | 'fim'`) e o roteiro da luta é a função `async function batalha()`, que lê quase como uma história:
```js
narrar → falaBoss ... 
while (true) {
  await faseAtaque(padroes);      // chefe ataca (você desvia)
  if (vida <= 0) return derrota();
  const acao = await turnoJogador();   // LUTAR ou AÇÕES
  ... await fasePergunta();            // responde uma pergunta
  acertou → await atacarBoss(dano)   |  errou → chefe se cura/fala
}
```

## Conceitos difíceis, explicados

### 1. `async/await` e Promises como "pausas"
Cada etapa devolve uma **Promise** que só se resolve quando a etapa termina. Assim `await narrar('...')` **espera o texto terminar de digitar e a pausa passar** antes de ir para a linha seguinte. Sem isso, o roteiro viraria um emaranhado de callbacks.
- `digitar(el, texto)` escreve letra por letra com `setInterval`; `pausa(ms)` espera.
- **Pular com clique:** ambas guardam a função `fim` em `aoAvancar`. Um clique/Z/Enter chama `avancar()` → `aoAvancar()` → completa o texto ou encerra a pausa na hora.

### 2. O turno do chefe: loop com `canvas`
- A arena é um `<canvas>` lógico de 240×240 (`CAMPO`), escalado pelo CSS (`aspect-ratio: 1/1`), então o jogo usa as mesmas coordenadas em qualquer tela.
- `loop(t)` (a cada quadro): move o coração → roda os "atualizadores" dos ataques → move projéteis → checa colisões → desenha. Termina quando `vida <= 0` ou o tempo da dificuldade acaba (`duracao`).
- `faseAtaque` devolve uma Promise cujo `resolve` (`ataque.fim`) é chamado só no fim do loop — é a ponte entre o mundo dos quadros e o roteiro `async`.
- Movimento diagonal: se há `dx` e `dy`, multiplica por `Math.SQRT1_2` (≈0,707) para não andar mais rápido na diagonal.
- Delta time limitado a 50 ms, igual ao ritmo.

### 3. Padrões de ataque (`PADROES`)
Cada padrão é um objeto `{frase, criar(ritmo)}`. `criar` **devolve uma função** `(dt) => {...}` que guarda o próprio cronômetro por **closure** (a variável `timer` fica "presa" dentro da função). Assim vários ataques rodam juntos, cada um com seu estado, e o loop só chama `atualizadores.forEach(a => a(dt))`. Exemplos: `chuvaDoce` (emojis caindo), `paredesSofa` (barras com um vão, alternando os lados), `miraFastFood`, `tempoDeTela`.
O **ritmo** cresce a cada turno (`ritmo + turno × ritmoPorTurno`, até `ritmoMax`); ataques simultâneos são mais lentos (`× [1, 1, .85, .75][quantidade]`) para continuar possível desviar.

### 4. Colisão
- Emoji = círculo: `Math.hypot(dx, dy) < raioEmoji + raioCoração` (distância entre centros).
- Barra = retângulo: acha o **ponto do retângulo mais próximo do coração** com `Math.max(p.x, Math.min(coracao.x, p.x + p.w))` (a técnica "clamp") e mede a distância até ele.
- Ao levar dano: perde HP e ganha **invencibilidade** por alguns instantes (`invencivelAte = t + dificuldade.invencivel`); durante ela o coração pisca (`Math.floor(t/80) % 2`) e `checarColisoes` retorna cedo.

### 5. O turno do jogador
`escolherOpcao(itens)` mostra botões e **devolve uma Promise** com o índice escolhido (mouse, teclado ou analógico). Um mesmo código serve ao menu principal, ao menu de ações e às perguntas.
- Perguntas: a **primeira opção de cada pergunta é a certa** no código; `embaralhar` mistura na hora (`{texto, certa: i === 0}`). Uma fila embaralhada (`filaPerguntas.pop()`) evita repetir antes de acabar todas.
- **Tempo limite (modo Impossível):** a barra esvazia com uma `transition` CSS de `width` com a duração exata; um `setTimeout` chama `responder(-1)` (= tempo esgotado = erro).
- Ações: comer (cura), exercitar (coração 1,6× mais rápido no próximo turno), meditar (dobra o dano do próximo acerto); cada uma tem `usosRestantes` por dificuldade.
- Navegação por teclado em grade de 2 colunas (`navegarOpcoes`): descobre se está em 1 ou 2 colunas lendo `getComputedStyle(...).gridTemplateColumns`.

### 6. Controles (teclado, arrasto e analógico)
- `MAPA_TECLAS` liga setas/WASD a `esquerda/direita/cima/baixo`; um `Set` (`teclas`) guarda as pressionadas (`keydown` adiciona, `keyup` remove).
- **Analógico virtual (celular):** calcula o vetor do centro da base até o dedo, limita ao alcance (`largura × 0,35`) com proporção, e usa uma **zona morta** (`ZONA_MORTA = 0.15`) para ignorar toques minúsculos. A força (0 a 1) vira a velocidade — quanto mais longe do centro, mais rápido. Nos menus, o mesmo analógico "navega" (com histerese 0,6 / 0,3 para não disparar várias vezes).

### 7. Vitória e derrota
Chefe com HP 0 → `vitoria()` → `cutsceneTransformacao()` (partículas, clarão, o chefe vira uma cereja saudável) → `CherryProgresso.marcar('final')`; no Difícil/Impossível chama `liberarDesafioSecreto(modo)` e marca `impossivel` quando for o caso.

## Dificuldades (`DIFICULDADES`)
| | HP seu | Dano recebido | Dano ao chefe | Extras |
|---|---|---|---|---|
| Fácil | 30 | 2 | 34 | ritmo lento |
| Médio | 24 | 3 | 25 | combos de ataque |
| Difícil | 24 | 4 | 25 | duração maior, invencibilidade menor |
| Impossível | 20 | 4 | 20 | trio de ataques, 10 s por pergunta, chefe se cura 5 ao você errar |

## `trilha-sonora.js`
Toca arquivos de `AUDIO/` se existirem; **se não existirem, gera a música no navegador** (chiptune) com a **Web Audio API**: `frequencia(nota) = 440 × 2^((nota−69)/12)` converte o número MIDI da nota em Hz (fórmula padrão: cada 12 notas dobra a frequência). Navegadores só liberam áudio depois de um clique, por isso `obterContexto()` "acorda" o `AudioContext` (`resume()`). A escolha de mudo fica em `localStorage` (`bossMudo`).

## `desafio-secreto.js` (prêmio presencial)
- Vence no Difícil/Impossível → fica `localStorage.desafioSecreto` (o Impossível não é sobrescrito).
- O botão abre um `<dialog>` (mesmo visual do pop-up) com um formulário de e-mail.
- Envio via **EmailJS** direto do navegador (`fetch POST` para `api.emailjs.com`, com `serviceId`, `templateId`, `publicKey`). O **enigma e a resposta ficam só no template do EmailJS**, nunca no código — quem lê o código-fonte não acha a resposta.
- Validações: `input.checkValidity()` (o próprio `type="email"` do HTML), e se as chaves ainda começam com `COLE_` avisa que não foi configurado. `try/catch/finally` trata falha de rede e reabilita o botão.
- ⚠️ A `publicKey` do EmailJS é pública por natureza (é assim que o serviço funciona), mas configure o limite de envios e os domínios permitidos no painel do EmailJS.
