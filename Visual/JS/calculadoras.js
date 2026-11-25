/* =====================================================================
   calculadoras.js — Calculadoras de saúde 🧮
   ---------------------------------------------------------------------
   Usado em: vida-em-movimento.html (IMC e % de gordura) e
             alimentacao.html (água por dia e gasto de calorias).
   Visual em: CSS/calculadoras.css

   Como funciona (captação → processamento → feedback):
   1. Cada <form data-calculo="nome"> é um formulário.
   2. Ao enviar, lemos os campos, conferimos se os números fazem sentido
      e chamamos a função de mesmo nome na tabela "calculos" lá embaixo.
   3. A função devolve { titulo, valor, texto, tom } e mostramos no
      <output> do cartão (leitores de tela leem sozinho: aria-live).
   Os números são só uma ESTIMATIVA e não substituem um profissional.
   ===================================================================== */
(function () {
    "use strict";

    var nf = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
    var fmt = function (n) { return nf.format(n); };

    // Cada cálculo declara os limites aceitos, para validar antes de calcular
    var limites = {
        peso: [20, 300, 'o peso (entre 20 e 300 kg)'],
        altura: [100, 230, 'a altura (entre 100 e 230 cm)'],
        cintura: [40, 200, 'a cintura (entre 40 e 200 cm)'],
        idade: [10, 100, 'a idade (entre 10 e 100 anos)'],
        minutos: [0, 300, 'os minutos de exercício (entre 0 e 300)']
    };

    var calculos = {
        imc: function (d) {
            var imc = d.peso / Math.pow(d.altura / 100, 2);
            var faixa = imc < 18.5 ? ['abaixo do peso', 'atencao']
                : imc < 25 ? ['peso adequado', 'ok']
                    : imc < 30 ? ['sobrepeso', 'atencao']
                        : ['obesidade', 'alerta'];
            var pesoMin = 18.5 * Math.pow(d.altura / 100, 2);
            var pesoMax = 24.9 * Math.pow(d.altura / 100, 2);
            return {
                titulo: 'Seu IMC é ' + fmt(imc),
                valor: faixa[0],
                texto: 'Para a sua altura, a faixa de peso adequada vai de ' + fmt(pesoMin) + ' a ' + fmt(pesoMax) +
                    ' kg. Para quem tem menos de 18 anos, o IMC é lido em curvas de crescimento: converse com um profissional de saúde.',
                tom: faixa[1]
            };
        },

        // RFM = Relative Fat Mass (Woolcott e Bergman, 2018): estima o % de gordura só com altura e cintura
        gordura: function (d) {
            var mulher = d.sexo === 'f';
            var rfm = 64 - 20 * (d.altura / d.cintura) + (mulher ? 12 : 0);
            // Faixas (adultos): [limite superior, nome, tom]
            var faixas = mulher
                ? [[13, 'gordura essencial', 'atencao'], [20, 'atlética', 'ok'], [24, 'em forma', 'ok'], [31, 'aceitável', 'atencao'], [100, 'acima do recomendado', 'alerta']]
                : [[5, 'gordura essencial', 'atencao'], [13, 'atlética', 'ok'], [17, 'em forma', 'ok'], [24, 'aceitável', 'atencao'], [100, 'acima do recomendado', 'alerta']];
            var f = faixas.find(function (x) { return rfm <= x[0]; });
            return {
                titulo: 'Gordura corporal estimada: ' + fmt(rfm) + '%',
                valor: f[1],
                texto: 'Cálculo pelo método RFM (massa gorda relativa), pensado para adultos. Ele é uma estimativa: só uma avaliação com profissional dá o valor exato.',
                tom: f[2]
            };
        },

        agua: function (d) {
            // 35 ml por kg + 350 ml a cada 30 min de exercício
            var ml = d.peso * 35 + (d.minutos / 30) * 350;
            var copos = Math.round(ml / 250);
            return {
                titulo: 'Beba cerca de ' + fmt(ml / 1000) + ' litros por dia',
                valor: '≈ ' + copos + ' copos de 250 ml',
                texto: 'Conta usada: 35 ml por kg de peso, mais 350 ml a cada 30 minutos de exercício. Em dias quentes, beba um pouco mais. A água também vem de frutas e legumes.',
                tom: 'ok'
            };
        },

        calorias: function (d) {
            // Mifflin-St Jeor: gasto em repouso (TMB) × fator de atividade
            var tmb = 10 * d.peso + 6.25 * d.altura - 5 * d.idade + (d.sexo === 'f' ? -161 : 5);
            var total = tmb * Number(d.atividade);
            return {
                titulo: 'Você gasta cerca de ' + Math.round(total).toLocaleString('pt-BR') + ' kcal por dia',
                valor: 'em repouso: ' + Math.round(tmb).toLocaleString('pt-BR') + ' kcal',
                texto: 'Fórmula de Mifflin-St Jeor multiplicada pelo seu nível de atividade. Use como referência para entender que o prato precisa de energia, não para fazer dieta sem acompanhamento.',
                tom: 'ok'
            };
        }
    };

    function mostrarErro(form, campo, mensagem) {
        var saida = form.querySelector('.calc-resultado');
        saida.className = 'calc-resultado calc-resultado--erro';
        saida.innerHTML = '';
        var p = document.createElement('p');
        p.textContent = 'Confira ' + mensagem + '.';
        saida.append(p);
        if (campo) { campo.setAttribute('aria-invalid', 'true'); campo.focus(); }
    }

    function aoEnviar(evento) {
        evento.preventDefault();
        var form = evento.currentTarget;
        var dados = {};
        form.querySelectorAll('[aria-invalid]').forEach(function (c) { c.removeAttribute('aria-invalid'); });

        // 1) Captação + validação
        var campos = form.elements;
        for (var i = 0; i < campos.length; i++) {
            var c = campos[i];
            if (!c.name || c.type === 'submit') continue;
            if (c.type === 'radio') { if (c.checked) dados[c.name] = c.value; continue; }
            if (c.tagName === 'SELECT') { dados[c.name] = c.value; continue; }
            var v = parseFloat(String(c.value).replace(',', '.'));
            var lim = limites[c.name];
            if (isNaN(v) || (lim && (v < lim[0] || v > lim[1]))) {
                return mostrarErro(form, c, lim ? lim[2] : c.name);
            }
            dados[c.name] = v;
        }
        if (dados.cintura && dados.altura && dados.cintura >= dados.altura) {
            return mostrarErro(form, form.elements.cintura, 'a cintura (ela precisa ser menor que a altura)');
        }

        // 2) Processamento
        var r = calculos[form.dataset.calculo](dados);

        // 3) Feedback ao usuário
        var saida = form.querySelector('.calc-resultado');
        saida.className = 'calc-resultado calc-resultado--' + r.tom;
        saida.innerHTML = '';
        ['titulo', 'valor', 'texto'].forEach(function (parte) {
            var el = document.createElement(parte === 'titulo' ? 'strong' : 'p');
            el.className = 'calc-' + parte;
            el.textContent = r[parte];
            saida.append(el);
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('form[data-calculo]').forEach(function (form) {
            form.addEventListener('submit', aoEnviar);
            // Limpar também limpa o resultado
            form.addEventListener('reset', function () {
                var saida = form.querySelector('.calc-resultado');
                saida.className = 'calc-resultado';
                saida.textContent = saida.dataset.padrao;
            });
            var saida = form.querySelector('.calc-resultado');
            saida.dataset.padrao = saida.textContent.trim();
        });
    });
})();
