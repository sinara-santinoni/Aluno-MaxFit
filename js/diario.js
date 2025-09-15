// ===== Ajuste de 1vh no mobile =====
function fixVh(){ const vh = window.innerHeight * 0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

const $ = (id)=>document.getElementById(id);

// ===== Config & Storage =====
function alunoKey(){
  const id = localStorage.getItem('usuario_id') || 'default';
  return `diario:${id}`;
}
function loadEntries(){
  try{ const raw = localStorage.getItem(alunoKey()); return raw ? JSON.parse(raw) : []; }
  catch{ return []; }
}
function saveEntries(list){
  localStorage.setItem(alunoKey(), JSON.stringify(list));
}

// ===== Estado da tela =====
let selectedMood = 2; // padrão "bom"

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // foto pequena do topo
  const foto = localStorage.getItem('usuario_foto'); if (foto) $('fotoPerfil').src = foto;

  // back
  $('btnVoltar')?.addEventListener('click', (e)=>{ e.preventDefault(); if(history.length>1) history.back(); else location.href='../index.html'; });

  // data padrão = hoje
  const today = new Date(); $('data').value = today.toISOString().slice(0,10);

  // moods
  document.querySelectorAll('.mood').forEach(btn=>{
    if(Number(btn.dataset.mood) === selectedMood) btn.classList.add('active');
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.mood').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedMood = Number(btn.dataset.mood);
    });
  });

  // adicionar imagem
  $('btnAddImg').addEventListener('click', ()=> $('inputImg').click());
  $('inputImg').addEventListener('change', (e)=>{
    const f = e.target.files?.[0]; if(!f) return;
    const r = new FileReader();
    r.onload = ev => { $('previewImg').src = ev.target.result; $('previewImg').style.display='block'; };
    r.readAsDataURL(f);
  });

  // salvar
  $('btnSalvar').addEventListener('click', salvarEntrada);

  // render histórico
  renderHistorico();
});

// ===== Salvar =====
function salvarEntrada(){
  const data = $('data').value;
  const treino = $('treino').value.trim();
  const avaliacao = $('avaliacao').value;
  const objetivo = $('objetivo').value.trim();
  const feito = $('feito').value.trim();
  const senti = $('senti').value.trim();
  const img = $('previewImg').src || '';

  if(!data){ alert('Selecione a data.'); return; }
  if(!treino && !objetivo && !feito && !senti && !img){
    alert('Preencha ao menos um campo (treino, objetivo, o que foi feito, como me senti ou imagem).');
    return;
  }

  const item = {
    id: Date.now(),
    data, mood: selectedMood, treino, avaliacao, objetivo, feito, senti, img
  };

  const list = loadEntries();
  list.push(item);
  // ordena por data/hora (mais recente primeiro)
  list.sort((a,b)=> (b.data+a.id) > (a.data+b.id) ? 1 : -1);
  saveEntries(list);

  // limpa inputs (mantém data)
  $('treino').value = '';
  $('avaliacao').value = '';
  $('objetivo').value = '';
  $('feito').value = '';
  $('senti').value = '';
  $('previewImg').src = ''; $('previewImg').style.display='none';

  renderHistorico();
  alert('Entrada registrada!');
}

// ===== Render histórico =====
function renderHistorico(){
  const box = $('historico');
  const list = loadEntries().sort((a,b)=> (b.data+b.id) > (a.data+a.id) ? 1 : -1);

  if(list.length === 0){
    box.innerHTML = `<div class="item"><div class="item-sub">Sem registros ainda.</div></div>`;
    return;
  }

  const moodEmoji = ['😞','🙂','😀','😎'];
  const esc = (s)=> (s || '').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

  box.innerHTML = list.map(e=>{
    const dataPt = new Date(e.data).toLocaleDateString('pt-BR');
    const mood   = moodEmoji[e.mood] || '';

    let linhas = '';
    if (e.treino || e.avaliacao) {
      linhas += `<div class="item-row"><strong>Treino:</strong> ${esc(e.treino || '')}`
              +  (e.avaliacao ? ` — <span class="muted">Avaliação:</span> ${esc(e.avaliacao)}` : '')
              +  `</div>`;
    }
    if (e.objetivo) linhas += `<div class="item-row"><strong>Objetivo:</strong> ${esc(e.objetivo)}</div>`;
    if (e.feito)    linhas += `<div class="item-row"><strong>Feito:</strong> ${esc(e.feito)}</div>`;
    if (e.senti)    linhas += `<div class="item-row"><strong>Como me senti:</strong> ${esc(e.senti)}</div>`;

    const img = e.img ? `<img class="item-img" src="${e.img}" alt="">` : '';

    return `
      <div class="item">
        <div class="item-head">${dataPt} — ${mood}</div>
        ${linhas || `<div class="item-sub">Sem texto.</div>`}
        ${img}
      </div>
    `;
  }).join('');
}

