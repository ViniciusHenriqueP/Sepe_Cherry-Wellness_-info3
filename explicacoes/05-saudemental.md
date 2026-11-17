# saudemental.html — Bem-Estar mental

**Arquivos:** `saudemental.html`, `CSS/pages/saudemental.css`, `JS/pages/saudemental.js`, `JS/beneficio-modal.js`.
A navbar e o rodapé desta página usam `.navbar--mental` / `.footer--mental` (verde fixo, não muda com o tema).

## Estrutura
`#conversar` (`<h1>Não guarde tudo para você</h1>` + imagem + card) → card **Lembrete!** → `#emocoes` (humor do dia) → dados (`stat-tile`) → **Práticas** (4 cards com "Saiba mais") → chamada para o minijogo de respiração → Fontes.

## JS — três mecanismos

### 1. Lembrete rotativo (`iniciarLembrete`)
`setInterval(trocarFrase, 7000)` avança `indice = (indice + 1) % frases.length` (o `%` faz voltar ao início). A troca tem **fade**: adiciona `.is-changing`, espera 350 ms (`setTimeout`) e só então troca o texto.
Botão "Ok, entendi": `clearInterval` + `.is-closing` (encolhe/some). O fechamento em **duas etapas** usa `transitionend` filtrando `propertyName === 'opacity'` (senão o evento dispararia uma vez por propriedade animada) e só então `.is-dismissed` recolhe o espaço.

### 2. Humor do dia (`iniciarHumor`)
- Os botões têm `data-mood="triste|chateado|neutro|bem|otimo"` e `aria-pressed`.
- `HOJE = new Date().toISOString().slice(0,10)` → texto `"2026-11-09"`.
- Salva `{mood, data: HOJE}` com `JSON.stringify` no `localStorage`.
- Ao abrir, `JSON.parse`: **se a data salva é de hoje**, reaplica o humor; senão começa vazio. Isso dá o efeito "uma resposta por dia". Há `try/catch` caso o dado esteja corrompido.
- O texto de resposta vem do objeto `mensagens[mood]`.
- *Detalhe:* `toISOString()` usa UTC; perto da meia-noite (fuso do Brasil) o "dia" pode virar algumas horas antes. Para esta função é aceitável.

### 3. Pop-up das práticas
O objeto `praticas` (respiração, desconecte-se, organização, cuide-se) é o conteúdo; `iniciarBeneficioModal(praticas, ...)` faz o resto — ver `09-pop-up-beneficio-modal.md`.

## CSS
- Grades: 1 coluna → `1.4fr 1fr` (760px) para a intro; práticas `repeat(2,1fr)` (600px) → `repeat(4,1fr)` (980px).
- `.lembrete-card.is-closing` / `.is-dismissed` são os dois estágios do fechamento descritos acima.
