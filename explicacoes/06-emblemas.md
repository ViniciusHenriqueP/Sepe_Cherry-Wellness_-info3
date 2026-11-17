# emblemas.html — Emblemas & Minijogos

**Arquivos:** `emblemas.html`, `CSS/pages/emblemas.css`, `JS/pages/emblemas.js` (+ `progresso.js`, `desafio-secreto.js`, `reveal.js`).

## HTML
Quase vazio de propósito: `<h1>`, um `<div id="progresso-emblemas">` e um `<div id="container-conquistas">`. **Todo o conteúdo é montado pelo JS**, porque depende de quais emblemas a pessoa tem.

## JS (`emblemas.js`)
- `EMBLEMAS` é um **array de objetos** (id, imagem, título, descrição, jogo). É a "fonte da verdade": para criar um emblema novo, basta acrescentar um item (e a chave em `progresso.js`).
- `conquistados = EMBLEMAS.filter(e => CherryProgresso.ganhou(e.id))` — só os que a pessoa tem.
- `cardEmblema(e)` devolve um *template literal* (texto entre crases com `${...}`) com o HTML do card.
- `conquistados.map(cardEmblema).join('')` transforma a lista de objetos em uma string de HTML, e `container.innerHTML = ...` desenha tudo de uma vez.
- `barraDeProgresso(total)`: calcula a porcentagem, escolhe a frase em `frases[total]` e usa `role="progressbar"` + `aria-valuenow` (acessível).
- **Estados:** 0 emblemas → mostra botões para os 3 jogos; 3 emblemas (`temTodosBase()`) → acrescenta `cardChefe()`, cujo texto e botão ("Enfrentar o chefe" / "Revanche") mudam se já venceu; se `desafioLiberado()`, aparece o botão do desafio secreto.
- Como os cards são criados *depois* do carregamento, chama `CherryReveal.refresh()` para animá-los. O botão do desafio também é criado depois, por isso o `addEventListener` é feito **após** o `innerHTML`.

> **Cuidado conhecido:** `innerHTML` com dados que viessem do usuário seria um risco de segurança (XSS). Aqui os textos são constantes do próprio código, então é seguro.
