// ====== Utils UI
    function show(id) { document.getElementById(id).classList.remove('hidden'); }
    function hide(id) { document.getElementById(id).classList.add('hidden'); }
    function goHome() {
      ['screen-home','screen-discreto-entrada','screen-discreto-tabela','screen-discreto-texto','screen-classes'].forEach(hide);
      show('screen-home');
    }
    function goDiscreto() {
      ['screen-home','screen-discreto-tabela','screen-discreto-texto','screen-classes'].forEach(hide);
      show('screen-discreto-entrada');
      renderChecksDiscreto();
    }
    function backToDiscreto(){
      ['screen-discreto-tabela','screen-discreto-texto'].forEach(hide);
      show('screen-discreto-entrada');
    }
    function showDiscretoTabela(){ hide('screen-discreto-texto'); show('screen-discreto-tabela'); }
    function showDiscretoTexto(){ hide('screen-discreto-tabela'); show('screen-discreto-texto'); }
    function goClasses() {
      ['screen-home','screen-discreto-entrada','screen-discreto-tabela','screen-discreto-texto'].forEach(hide);
      show('screen-classes');
      renderChecksClasses();
    }

    // ====== Rounding & formatting
    function arred2(x){ return Math.round(x*100)/100; } // regra 0-4 / 5-9
    function numBR(x){ return arred2(x).toFixed(2).replace('.',','); }
    function formatarValor(x, unidade){
      const v = numBR(x);
      return (unidade==='R$') ? `${unidade} ${v}` : `${v} ${unidade}`;
    }
    // Unidade da variância segundo especificação do usuário
    function unidadeVariancia(u){
      if(u==='R$') return 'R$²';
      if(u==='°C') return '°C²';
      if(u==='Km/h') return '(Km/h)²';
      if(u==='m²') return '(m²)²';
      // fallback genérico:
      return `(${u})²`;
    }

    // ====== Checkboxes (seleção de resultados)
    function renderChecksDiscreto(){
      const cont = document.getElementById('checksDiscreto');
      cont.innerHTML = '';
      const ops = [
        ['selAllDiscreto','Selecionar todos',true,'all'],
        ['dMedia','Média',true],
        ['dMediana','Mediana',true],
        ['dModa','Moda',true],
        ['dVar','Variância',true],
        ['dDP','Desvio Padrão',true],
        ['dCV','Coeficiente de Variação',true],
      ];
      ops.forEach(([id,label,chk,kind])=>{
        const div = document.createElement('div');
        div.innerHTML = `<label><input type="checkbox" id="${id}" ${chk?'checked':''} ${kind==='all'?'':'class="dItem"'} onchange="${kind==='all'?'toggleAllDiscreto(this.checked)':''}"> ${label}</label>`;
        cont.appendChild(div);
      });
    }
    function toggleAllDiscreto(on){
      document.querySelectorAll('#checksDiscreto .dItem').forEach(cb=>cb.checked=on);
    }

    function renderChecksClasses(){
      const cont = document.getElementById('checksClasses');
      cont.innerHTML = '';
      const ops = [
        ['selAllClasses','Selecionar todos',true,'all'],
        ['cMedia','Média',true],
        ['cMediana','Mediana',true],
        ['cModaBruta','Moda Bruta',true],
        ['cModaCzuber','Moda de Czuber',true],
        ['cVar','Variância',true],
        ['cDP','Desvio Padrão',true],
        ['cCV','Coeficiente de Variação',true],
      ];
      ops.forEach(([id,label,chk,kind])=>{
        const div = document.createElement('div');
        div.innerHTML = `<label><input type="checkbox" id="${id}" ${chk?'checked':''} ${kind==='all'?'':'class="cItem"'} onchange="${kind==='all'?'toggleAllClasses(this.checked)':''}"> ${label}</label>`;
        cont.appendChild(div);
      });
    }
    function toggleAllClasses(on){
      document.querySelectorAll('#checksClasses .cItem').forEach(cb=>cb.checked=on);
    }

    // ====== DISCRETO: TABELA
    function gerarTabelaDiscreto(){
      const n = +document.getElementById('nDiscreto').value;
      if(n<1 || n>30){ alert('Escolha entre 1 e 30 linhas.'); return; }
      let html = `<table><thead><tr><th>xi (valor)</th><th>fi (freq.)</th></tr></thead><tbody>`;
      for(let i=1;i<=n;i++){
        html += `<tr>
          <td><input type="number" step="any" id="dxi${i}" /></td>
          <td><input type="number" step="1" id="dfi${i}" /></td>
        </tr>`;
      }
      html += `</tbody></table>`;
      document.getElementById('tabelaDiscretoContainer').innerHTML = html;
    }
    function limparTabelaDiscreto(){
      document.getElementById('tabelaDiscretoContainer').innerHTML='';
      document.getElementById('resultadoDiscretoTabela').innerHTML='';
    }

    function coletarDiscretoFromTabela(){
      const cont = document.getElementById('tabelaDiscretoContainer');
      if(!cont.querySelector('table')) return {vals:[],freqs:[]};
      const vals=[], freqs=[];
      const inputs = cont.querySelectorAll('tbody tr');
      inputs.forEach(tr=>{
        const xi = tr.children[0].querySelector('input').value;
        const fi = tr.children[1].querySelector('input').value;
        if(xi!=='' && fi!==''){
          vals.push(parseFloat(xi));
          freqs.push(parseFloat(fi));
        }
      });
      return {vals,freqs};
    }

    function calcularDiscretoFromTabela(){
      const {vals,freqs} = coletarDiscretoFromTabela();
      if(vals.length===0){ alert('Preencha ao menos uma linha com xi e fi.'); return; }
      const unidade = document.getElementById('unidadeDiscreto').value;
      const checks = {
        media: document.getElementById('dMedia').checked,
        mediana: document.getElementById('dMediana').checked,
        moda: document.getElementById('dModa').checked,
        variancia: document.getElementById('dVar').checked,
        dp: document.getElementById('dDP').checked,
        cv: document.getElementById('dCV').checked,
      };
      const res = calcularDiscreto(vals, freqs);
      renderResultadosDiscreto(res, unidade, checks, 'resultadoDiscretoTabela');
    }

    // ====== DISCRETO: TEXTO
    function limparTextoDiscreto(){
      document.getElementById('textoDiscreto').value='';
      document.getElementById('freqPreview').innerHTML='';
      document.getElementById('resultadoDiscretoTexto').innerHTML='';
    }
    function parseTextoValores(str){
      // pega números com ponto/virgula decimal; separadores ; , espaços ou quebras
      const tokens = str.match(/[-+]?\d+(?:[.,]\d+)?/g) || [];
      return tokens.map(t=>parseFloat(t.replace(',','.'))).filter(v=>!Number.isNaN(v));
    }
    function calcularDiscretoFromTexto(){
      const txt = document.getElementById('textoDiscreto').value || '';
      const unidade = document.getElementById('unidadeDiscreto').value;
      const checks = {
        media: document.getElementById('dMedia').checked,
        mediana: document.getElementById('dMediana').checked,
        moda: document.getElementById('dModa').checked,
        variancia: document.getElementById('dVar').checked,
        dp: document.getElementById('dDP').checked,
        cv: document.getElementById('dCV').checked,
      };
      const arr = parseTextoValores(txt);
      if(arr.length===0){ alert('Digite valores no campo de texto.'); return; }
      // contar frequências
      const mapa = new Map();
      arr.forEach(v=> mapa.set(v, (mapa.get(v)||0)+1) );
      const vals = Array.from(mapa.keys());
      const freqs = Array.from(mapa.values());
      // preview tabela de frequências
      let prev = `<div class="card"><table><thead><tr><th>xi</th><th>fi</th></tr></thead><tbody>`;
      vals.forEach((v,i)=>{ prev += `<tr><td>${numBR(v)}</td><td>${freqs[i]}</td></tr>`; });
      prev += `</tbody></table></div>`;
      document.getElementById('freqPreview').innerHTML = `<div class="muted">Frequências detectadas automaticamente:</div>${prev}`;
      const res = calcularDiscreto(vals, freqs);
      renderResultadosDiscreto(res, unidade, checks, 'resultadoDiscretoTexto');
    }

    // ====== CÁLCULOS DISCRETOS
    function calcularDiscreto(vals, freqs){
      // ordenar por xi
      const comb = vals.map((v,i)=>({xi:+v, fi:+freqs[i]})).filter(o=>!Number.isNaN(o.xi)&&!Number.isNaN(o.fi));
      comb.sort((a,b)=>a.xi-b.xi);
      const N = comb.reduce((s,o)=>s+o.fi,0);
      const soma = comb.reduce((s,o)=>s + o.xi*o.fi, 0);
      const media = soma/N;

      // mediana (primeiro ponto em que cumul >= N/2)
      let acc=0, mediana = comb[0].xi;
      const alvo = N/2;
      for(const o of comb){ acc += o.fi; if(acc>=alvo){ mediana = o.xi; break; } }

      // moda(s)
      const maxFi = Math.max(...comb.map(o=>o.fi));
      const modas = comb.filter(o=>o.fi===maxFi).map(o=>o.xi);

      // variância populacional
      const variancia = comb.reduce((s,o)=> s + o.fi * Math.pow(o.xi - media, 2), 0) / N;
      const dp = Math.sqrt(variancia);
      const cv = (dp/media)*100;

      return { media, mediana, modas, variancia, dp, cv };
    }

    function renderResultadosDiscreto(res, unidade, checks, targetId){
      let html = `<div class="card"><table><thead><tr><th>Medida</th><th>Valor</th></tr></thead><tbody>`;
      if(checks.media) html += `<tr><td>Média</td><td>${formatarValor(res.media, unidade)}</td></tr>`;
      if(checks.mediana) html += `<tr><td>Mediana</td><td>${formatarValor(res.mediana, unidade)}</td></tr>`;
      if(checks.moda){
        const list = res.modas.map(m=>formatarValor(m, unidade)).join('; ');
        html += `<tr><td>Moda</td><td>${list}</td></tr>`;
      }
      if(checks.variancia) html += `<tr><td>Variância</td><td>${formatarValor(res.variancia, unidadeVariancia(unidade))}</td></tr>`;
      if(checks.dp) html += `<tr><td>Desvio Padrão</td><td>${formatarValor(res.dp, unidade)}</td></tr>`;
      if(checks.cv) html += `<tr><td>Coeficiente de Variação</td><td>${numBR(res.cv)} %</td></tr>`;
      html += `</tbody></table></div>`;
      document.getElementById(targetId).innerHTML = html;
    }

    // ====== CLASSES
    function handleClassInputChange(rowIndex, changedField) {
      validarLimitesClasse(rowIndex, changedField);
      if (rowIndex === 1) {
          autoPreencherClasses();
      }
    }

    function validarLimitesClasse(rowIndex, changedField) {
        const liInput = document.getElementById(`cli${rowIndex}`);
        const lsInput = document.getElementById(`cls${rowIndex}`);

        const li = parseFloat(liInput.value);
        const ls = parseFloat(lsInput.value);

        if (!isNaN(li) && !isNaN(ls) && li > ls) {
            alert('O Limite Inferior (LI) não pode ser maior que o Limite Superior (LS).');
            if (changedField === 'li') {
                liInput.value = '';
            } else {
                lsInput.value = '';
            }
        }
    }

    function autoPreencherClasses() {
        const n = +document.getElementById('nClasses').value;
        const li1_input = document.getElementById('cli1');
        const ls1_input = document.getElementById('cls1');

        if (!li1_input || !ls1_input) return;

        const li1 = parseFloat(li1_input.value);
        const ls1 = parseFloat(ls1_input.value);

        if (isNaN(li1) || isNaN(ls1) || li1 >= ls1) {
            return;
        }

        const h = ls1 - li1;
        let currentLS = ls1;
        for (let i = 2; i <= n; i++) {
            const nextLI_input = document.getElementById(`cli${i}`);
            const nextLS_input = document.getElementById(`cls${i}`);

            if (nextLI_input && nextLS_input) {
                nextLI_input.value = currentLS;
                nextLS_input.value = currentLS + h;
                currentLS = currentLS + h;
            }
        }
    }

    function gerarTabelaClasses(){
      const n = +document.getElementById('nClasses').value;
      if(n<1 || n>30){ alert('Escolha entre 1 e 30 classes.'); return; }
      let html = `<table><thead><tr><th>LI</th><th>LS</th><th>fi</th></tr></thead><tbody>`;
      for(let i=1;i<=n;i++){
        html += `<tr>
          <td><input type="number" step="any" id="cli${i}" onchange="handleClassInputChange(${i}, 'li')" /></td>
          <td><input type="number" step="any" id="cls${i}" onchange="handleClassInputChange(${i}, 'ls')" /></td>
          <td><input type="number" step="1" id="cfi${i}" /></td>
        </tr>`;
      }
      html += `</tbody></table>`;
      document.getElementById('tabelaClassesContainer').innerHTML = html;
    }
    function limparClasses(){
      document.getElementById('tabelaClassesContainer').innerHTML='';
      document.getElementById('resultadoClasses').innerHTML='';
    }

    function coletarClasses(){
      const cont = document.getElementById('tabelaClassesContainer');
      if(!cont.querySelector('table')) return [];
      const rows = cont.querySelectorAll('tbody tr');
      const arr=[];
      rows.forEach(tr=>{
        const LI = tr.children[0].querySelector('input').value;
        const LS = tr.children[1].querySelector('input').value;
        const fi = tr.children[2].querySelector('input').value;
        if(LI!=='' && LS!=='' && fi!==''){
          arr.push({LI:+LI, LS:+LS, fi:+fi});
        }
      });
      // ordenar por LI
      arr.sort((a,b)=>a.LI-b.LI);
      return arr;
    }

    function calcularClasses(){
      const dados = coletarClasses();
      if(dados.length===0){ alert('Preencha ao menos uma classe com LI, LS e fi.'); return; }
      const unidade = document.getElementById('unidadeClasses').value;
      const checks = {
        media: document.getElementById('cMedia').checked,
        mediana: document.getElementById('cMediana').checked,
        modaBruta: document.getElementById('cModaBruta').checked,
        modaCzuber: document.getElementById('cModaCzuber').checked,
        variancia: document.getElementById('cVar').checked,
        dp: document.getElementById('cDP').checked,
        cv: document.getElementById('cCV').checked,
      };

      // pontos médios, N
      const pm = dados.map(c => (c.LI + c.LS)/2);
      const N = dados.reduce((s,c)=>s+c.fi,0);
      const soma = dados.reduce((s,c,i)=> s + pm[i]*c.fi, 0);
      const media = soma/N;

      // mediana por fórmula: Md = L + ((N/2 - F<)/fclasse)*h
      // achar classe mediana
      let F=0, idxMed=0;
      const alvo = N/2;
      for(let i=0;i<dados.length;i++){
        const prev = F;
        F += dados[i].fi;
        if(F >= alvo){ idxMed = i; break; }
      }
      const Lm = dados[idxMed].LI;
      const fMed = dados[idxMed].fi;
      const Fprev = dados.slice(0, idxMed).reduce((s,c)=>s+c.fi, 0);
      const hMed = dados[idxMed].LS - dados[idxMed].LI;
      const mediana = Lm + ((N/2 - Fprev)/fMed)*hMed;

      // moda bruta: ponto médio da classe modal
      const fmax = Math.max(...dados.map(c=>c.fi));
      const idxModa = dados.findIndex(c=>c.fi===fmax);
      const modaBruta = (dados[idxModa].LI + dados[idxModa].LS)/2;

      // moda Czuber: Mo = L + (Δ1/(Δ1+Δ2))*h
      const Lmo = dados[idxModa].LI;
      const hMo = dados[idxModa].LS - dados[idxModa].LI;
      const f0 = (idxModa>0)? dados[idxModa-1].fi : 0;
      const f1 = dados[idxModa].fi;
      const f2 = (idxModa<dados.length-1)? dados[idxModa+1].fi : 0;
      const d1 = f1 - f0;
      const d2 = f1 - f2;
      let modaCzuber = Lmo;
      if((d1+d2)!==0){
        modaCzuber = Lmo + (d1/(d1+d2))*hMo;
      } else {
        // se empate/perfis planos, usa ponto médio como fallback
        modaCzuber = (dados[idxModa].LI + dados[idxModa].LS)/2;
      }

      // variância (aproximação via pontos médios)
      const variancia = dados.reduce((s,c,i)=> s + c.fi * Math.pow(pm[i]-media,2), 0)/N;
      const dp = Math.sqrt(variancia);
      const cv = (dp/media)*100;

      renderResultadosClasses(
        { media, mediana, modaBruta, modaCzuber, variancia, dp, cv },
        unidade, checks
      );
    }

    function renderResultadosClasses(res, unidade, checks){
      let html = `<div class="card"><table><thead><tr><th>Medida</th><th>Valor</th></tr></thead><tbody>`;
      if(checks.media) html += `<tr><td>Média</td><td>${formatarValor(res.media, unidade)}</td></tr>`;
      if(checks.mediana) html += `<tr><td>Mediana</td><td>${formatarValor(res.mediana, unidade)}</td></tr>`;
      if(checks.modaBruta) html += `<tr><td>Moda Bruta</td><td>${formatarValor(res.modaBruta, unidade)}</td></tr>`;
      if(checks.modaCzuber) html += `<tr><td>Moda de Czuber</td><td>${formatarValor(res.modaCzuber, unidade)}</td></tr>`;
      if(checks.variancia) html += `<tr><td>Variância</td><td>${formatarValor(res.variancia, unidadeVariancia(unidade))}</td></tr>`;
      if(checks.dp) html += `<tr><td>Desvio Padrão</td><td>${formatarValor(res.dp, unidade)}</td></tr>`;
      if(checks.cv) html += `<tr><td>Coeficiente de Variação</td><td>${numBR(res.cv)} %</td></tr>`;
      html += `</tbody></table></div>`;
      document.getElementById('resultadoClasses').innerHTML = html;
    }

    // Inicial
    goHome();