// ===== helpers e layout =====

console.log('ficha.js v4 carregado');



const $ = (id)=>document.getElementById(id);
function fixVh(){ const vh = innerHeight*0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

// ===== PONTO DE TROCA COM O BACKEND =====
// Agora NÃO cria demo. Apenas lê o que existir (ou []).

async function apiGetMyPlans(){
  const uid = localStorage.getItem('usuario_id') || 'default';
  const raw = localStorage.getItem(`plans:assign:${uid}`);
  return raw ? JSON.parse(raw) : [];
}

async function apiGetPlan(planId){
  const raw = localStorage.getItem(`plans:data:${planId}`);
  return raw ? JSON.parse(raw) : null;
}

// ===== renderização =====
function planCardHTML(p){
  const date = p.assignedAtISO
    ? new Date(p.assignedAtISO).toLocaleDateString('pt-BR', { day:'2-digit', month:'long' })
    : '—';
  return `
    <div class="plan-card" data-id="${p.id}">
      <div class="plan-title">${p.title || '—'}</div>
      <div class="plan-line">
        ${p.level ? `<span class="pill-mini">${p.level}</span>`:''}
        ${p.goal ? `<span class="sep">•</span><span>${p.goal}</span>`:''}
      </div>
      <div class="plan-assign">${p.assignedAtISO ? `Atribuído em ${date}` : ''}</div>
    </div>`;
}

function dayHTML(d, idx){
  const exHTML = (d.exercises||[]).map((ex,i)=>`
    <div class="ex-row">
      <div class="ex-name">${i+1}. ${ex.name || 'Exercício'}</div>
      <div class="ex-meta">
        <span>${ex.sets ?? '—'}x</span>
        <span>${ex.reps ?? '—'} reps</span>
        ${ex.rest_sec ? `<span>Desc ${ex.rest_sec}s</span>`:''}
        ${ex.tempo ? `<span>Tempo ${ex.tempo}</span>`:''}
      </div>
      ${ex.notes ? `<div class="ex-notes">${ex.notes}</div>`:''}
    </div>
  `).join('');

  return `
  <details class="day" ${idx===0?'open':''}>
    <summary class="day-head">
      <span class="day-name">${d.name || `Dia ${idx+1}`}</span>
      <ion-icon name="chevron-down-outline"></ion-icon>
    </summary>
    <div class="day-body">${exHTML || '<div class="ex-empty">Sem exercícios.</div>'}</div>
  </details>`;
}

// ===== navegação e boot =====
document.addEventListener('DOMContentLoaded', async ()=>{
  const foto = localStorage.getItem('usuario_foto');
  if (foto) $('fotoPerfilTop').src = foto;

  $('btnVoltar')?.addEventListener('click', (e)=>{ e.preventDefault(); history.length>1?history.back():location.href='../index.html'; });
  $('btnVoltarLista')?.addEventListener('click', ()=> toggleView('list'));

  // carrega lista (sem seed)
  const plans = await apiGetMyPlans();
  if (!plans.length){
    $('planEmpty').style.display = 'block';
    $('planList').innerHTML = '';
  } else {
    $('planEmpty').style.display = 'none';
    $('planList').innerHTML = plans.map(planCardHTML).join('');
  }

  // abre detalhe ao clicar num card
  $('planList').addEventListener('click', async (e)=>{
    const card = e.target.closest('.plan-card');
    if(!card) return;
    const plan = await apiGetPlan(card.dataset.id);
    if(!plan){ alert('Ficha não encontrada.'); return; }
    renderPlanDetail(plan);
    toggleView('detail');
  });
});

function renderPlanDetail(plan){
  $('planTitle').textContent = plan.title || '—';
  $('planMeta').textContent  = [plan.level, plan.goal].filter(Boolean).join(' • ');
  $('daysWrap').innerHTML    = (plan.days||[]).map(dayHTML).join('');
}

function toggleView(mode){
  if(mode==='detail'){
    $('secLista').style.display = 'none';
    $('secDetalhe').style.display = 'block';
  }else{
    $('secDetalhe').style.display = 'none';
    $('secLista').style.display = 'block';
  }
}
