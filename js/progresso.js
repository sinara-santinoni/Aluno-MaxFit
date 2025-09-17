// ===== ajuste 1vh mobile =====
function fixVh(){ const vh = innerHeight*0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

const $ = (id)=>document.getElementById(id);

// ===== storage helpers =====
function userKey(){
  const id = localStorage.getItem('usuario_id') || 'default';
  return `progress:${id}`;
}
function loadList(){
  try{ return JSON.parse(localStorage.getItem(userKey()) || '[]'); }catch{ return []; }
}
function saveList(list){
  localStorage.setItem(userKey(), JSON.stringify(list));
}
function unique(arr){ return [...new Set(arr)]; }

// ===== state =====
let editingId = null;

// ===== init =====
document.addEventListener('DOMContentLoaded', () => {
  // back e avatar
  $('btnVoltar')?.addEventListener('click', (e)=>{ e.preventDefault(); history.length>1?history.back():location.href='../index.html'; });
  const foto = localStorage.getItem('usuario_foto'); if (foto) $('fotoPerfilTop').src = foto;

  // data default = hoje
  $('data').value = new Date().toISOString().slice(0,10);

  // form submit
  $('formProg').addEventListener('submit', onSubmit);

  // filtros
  $('btnLimparFiltro').addEventListener('click', ()=>{ $('filtroEx').value=''; render(); });
  $('filtroEx').addEventListener('input', render);

  // cancelar edição
  $('btnCancelarEd').addEventListener('click', resetForm);

  // primeira renderização
  refreshSuggestions();
  render();
});

// ===== submit / salvar =====
function onSubmit(e){
  e.preventDefault();

  const dateISO = $('data').value;
  const exercicio = ($('exercicio').value || '').trim();
  const peso = parseFloat($('peso').value);
  const reps = parseInt($('reps').value,10);
  const series = parseInt($('series').value,10);
  const rpe = $('rpe').value ? parseFloat($('rpe').value) : null;
  const obs = ($('obs').value || '').trim();

  if(!exercicio){ alert('Informe o exercício.'); return; }
  if(!(peso >= 0)){ alert('Informe o peso (kg).'); return; }
  if(!(reps > 0)){ alert('Informe as repetições.'); return; }
  if(!(series > 0)){ alert('Informe as séries.'); return; }

  const list = loadList();

  if(editingId){
    const idx = list.findIndex(x => String(x.id) === String(editingId));
    if(idx !== -1){
      list[idx] = { ...list[idx], dateISO, exercicio, peso, reps, series, rpe, obs, updatedAt: new Date().toISOString() };
    }
  }else{
    list.push({
      id: Date.now(),
      dateISO, exercicio, peso, reps, series, rpe, obs,
      createdAt: new Date().toISOString()
    });
  }

  saveList(list);
  resetForm();
  refreshSuggestions();
  render();
}

// ===== UI helpers =====
function resetForm(){
  editingId = null;
  $('btnSalvar').textContent = 'Registrar';
  $('btnCancelarEd').hidden = true;
  $('formProg').reset();
  $('data').value = new Date().toISOString().slice(0,10);
}
function refreshSuggestions(){
  const list = loadList();
  const exercises = unique(list.map(x=>x.exercicio).filter(Boolean)).sort((a,b)=>a.localeCompare(b,'pt-BR'));
  const dl = $('ex-list'); dl.innerHTML = exercises.map(e=>`<option value="${escapeHtml(e)}">`).join('');
}

// ===== render histórico =====
function render(){
  const wrap = $('histList');
  const filtro = ($('filtroEx').value || '').toLowerCase().trim();
  let list = loadList().sort((a,b)=> b.dateISO.localeCompare(a.dateISO) || b.createdAt?.localeCompare(a.createdAt||'') );

  if(filtro) list = list.filter(x => (x.exercicio||'').toLowerCase().includes(filtro));

  if(!list.length){
    wrap.innerHTML = '';
    $('vazio').hidden = false;
    return;
  }
  $('vazio').hidden = true;

  wrap.innerHTML = list.map(itemCard).join('');

  // actions
  wrap.querySelectorAll('[data-act="edit"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.closest('.hcard').dataset.id;
      startEdit(id);
    });
  });
  wrap.querySelectorAll('[data-act="delete"]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.closest('.hcard').dataset.id;
      removeEntry(id);
    });
  });
}

function itemCard(d){
  const date = d.dateISO ? new Date(d.dateISO).toLocaleDateString('pt-BR') : '—';
  const oneRm = estimate1RM(d.peso, d.reps);
  return `
  <article class="hcard" data-id="${String(d.id)}">
    <div>
      <div class="h-title">${escapeHtml(d.exercicio || 'Exercício')}</div>
      <div class="h-meta">${fmtKg(d.peso)} • ${d.reps} reps • ${d.series} séries ${d.rpe?`• RPE ${d.rpe}`:''}</div>
      ${d.obs ? `<div class="h-note">${escapeHtml(d.obs)}</div>`:''}
    </div>
    <div class="h-right">
      <div class="h-date">${date}</div>
      ${oneRm ? `<div class="h-1rm">1RM ~ ${oneRm} kg</div>`:''}
      <div class="h-actions">
        <button class="icon-btn" data-act="edit" title="Editar"><ion-icon name="create-outline"></ion-icon></button>
        <button class="icon-btn delete" data-act="delete" title="Excluir"><ion-icon name="trash-outline"></ion-icon></button>
      </div>
    </div>
  </article>`;
}

function startEdit(id){
  const item = loadList().find(x => String(x.id) === String(id));
  if(!item) return;

  editingId = item.id;
  $('btnSalvar').textContent = 'Salvar edição';
  $('btnCancelarEd').hidden = false;

  $('data').value = item.dateISO || new Date().toISOString().slice(0,10);
  $('exercicio').value = item.exercicio || '';
  $('peso').value = item.peso ?? '';
  $('reps').value = item.reps ?? '';
  $('series').value = item.series ?? '';
  $('rpe').value = item.rpe ?? '';
  $('obs').value = item.obs ?? '';
}

function removeEntry(id){
  if(!confirm('Excluir este registro?')) return;
  const list = loadList().filter(x => String(x.id) !== String(id));
  saveList(list);
  render();
}

// ===== utils =====
function fmtKg(n){ return `${(+n).toFixed(1)} kg`; }
function estimate1RM(peso, reps){
  const w = +peso, r = +reps;
  if(!(w>0) || !(r>0)) return '';
  const epley = w * (1 + r/30);
  return epley.toFixed(1);
}
function escapeHtml(s){ return String(s||'').replace(/[&<>]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c])); }
