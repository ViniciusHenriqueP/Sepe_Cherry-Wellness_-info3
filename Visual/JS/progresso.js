/* =====================================================================
   progresso.js — O "caderninho" de conquistas da pessoa 🍒📒
   ---------------------------------------------------------------------
   Usado em: index.html, emblemas.html e em todos os minijogos.
   Precisa ser carregado ANTES dos scripts que usam CherryProgresso.

   Antes, cada jogo escrevia direto no localStorage com um nome solto
   ('emblemaPrato', 'emblemaMental'...). Bastava um erro de digitação
   para o emblema "sumir". Agora todo mundo passa por aqui.

   ⚠️ Os nomes das chaves continuam EXATAMENTE os mesmos de antes,
   para ninguém perder os emblemas que já tinha conquistado.

   Exemplos:
     CherryProgresso.marcar('prato');       // a pessoa ganhou!
     CherryProgresso.ganhou('prato');       // → true / false
     CherryProgresso.contarBase();          // → 0, 1, 2 ou 3
     CherryProgresso.temTodosBase();        // → liberou a batalha final?
   ===================================================================== */
(function () {
    "use strict";

    // Apelido amigável → nome real guardado no navegador
    var CHAVES = {
        prato: 'emblemaPrato',            // jogo-prato.html
        movimento: 'emblemaMovimento',    // jogo-ritmo.html
        mental: 'emblemaMental',          // jogo-respiracao.html
        final: 'emblemaFinal',            // venceu a Cereja Podre
        impossivel: 'emblemaImpossivel'   // venceu no modo Impossível
    };

    // Os três emblemas dos minijogos, que abrem a batalha final
    var BASE = ['prato', 'movimento', 'mental'];

    // Valor que indica "conquistado"
    var GANHOU = 'ganhou';

    // localStorage pode falhar (aba anônima, navegador bloqueando...).
    // Nesses casos o site continua funcionando, só não lembra o progresso.
    function ler(chave) {
        try { return localStorage.getItem(chave); } catch (e) { return null; }
    }
    function gravar(chave, valor) {
        try { localStorage.setItem(chave, valor); } catch (e) { /* sem problemas */ }
    }

    window.CherryProgresso = {
        CHAVES: CHAVES,
        BASE: BASE,

        // A pessoa já tem esse emblema?
        ganhou: function (nome) {
            return ler(CHAVES[nome]) === GANHOU;
        },

        // Registra a conquista 🎉
        marcar: function (nome) {
            gravar(CHAVES[nome], GANHOU);
        },

        // Quantos dos 3 emblemas dos minijogos ela já tem
        contarBase: function () {
            return BASE.filter(this.ganhou).length;
        },

        // Tem os três? Então a batalha final está liberada
        temTodosBase: function () {
            return this.contarBase() === BASE.length;
        }
    };
})();
