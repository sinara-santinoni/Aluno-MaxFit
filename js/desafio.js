// ===== /Aluno-MaxFit/js/desafio.js =====
console.log('desafio.js v2 carregado');

// ===== altura correta no mobile =====
function fixVh(){ const vh = innerHeight * 0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

const $ = (id)=>document.getElementById(id);

// ===== storage =====
function userKey(){
  const id = localStorage.getItem('usuario_id') || 'default';
  return `desafios:${id}`;
}
function loadList(){
  try{ const raw = localStorage.getItem(userKey()); return raw ? JSON.parse(raw) : []; }
  catch{ return []; }
}
function saveList(list){
  localStorage.setItem(userKey(), JSON.stringify(list));
}

// Mostramos somente desafios criados por mim ou que eu esteja participando
const ALLOWED_ORIGINS = ['eu','participando'];

// ===== estado =====
let filtro = 'ativos'; // 'todos' | 'ativos' | 'concluidos'

// ===== init =====
document.addEventListener('DOMContentLoaded', () => {
  // topo
  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    if (history.length>1) history.back();
    else location.href='../index.html';
  });
  const foto = localStorage.getItem('usuario_foto');
  if (foto) $('fotoPerfil').src = foto;

  // filtros
  document.querySelectorAll('.chip').forEach(ch=>{
    ch.addEventListener('click', ()=>{
      document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      filtro = ch.dataset.f;
      render();
    });
  });

  // ações
  $('btnCriar').addEventListener('click', ()=> location.href='criardesafio.html');
  // >>> aqui estava o alert — agora vai direto pra página
  $('btnParticipar').addEventListener('click', ()=> {
    window.location.href = 'participarTreinos.html';
  });

  // clique nos cards (delegação) -> abre sheet de ações apenas para meus desafios
  $('listaDesafios').addEventListener('click', (e)=>{
    const card = e.target.closest('.card');
    if(!card) return;
    const id = card.dataset.id;
    const origem = card.dataset.origem || '';
    if(origem !== 'eu'){
      alert('Somente desafios criados por você podem ser editados.');
      return;
    }
    abrirSheetAcoes(id);
  });

  render();
});

// ===== render =====
function render(){
  const box = $('listaDesafios');
  let list = loadList().filter(x => ALLOWED_ORIGINS.includes(x.origem));

  if (filtro === 'ativos')     list = list.filter(x => x.status !== 'concluido');
  if (filtro === 'concluidos') list = list.filter(x => x.status === 'concluido');

  if(list.length === 0){
    const msg = (filtro === 'concluidos')
      ? 'Você ainda não concluiu desafios.'
      : 'Você ainda não está participando de desafios.';
    box.innerHTML = `<div class="empty">${msg}<br>Use <b>Criar desafios</b> ou aguarde um convite.</div>`;
    return;
  }

  box.innerHTML = list
    .sort((a,b)=> (a.ateISO||'').localeCompare(b.ateISO||''))  // ordena por prazo
    .map(cardHtml).join('');
}

function cardHtml(d){
  const data = d.ateISO
    ? new Date(d.ateISO).toLocaleDateString('pt-BR',{day:'2-digit',month:'long'})
    : '—';
  const logo = d.logo || '../img/logo.png';
  const owned = d.origem === 'eu' ? '1' : '0';
  const status = d.status === 'concluido' ? '<span class="badge done">Concluído</span>' : '';

  return `
  <div class="card" data-id="${String(d.id)}" data-origem="${d.origem||''}" data-owned="${owned}">
    <img class="logo" src="${logo}" alt="">
    <div>
      <div class="ctitle">${escapeHtml(d.titulo || 'Desafio')} ${status}</div>
      <div class="deadline">Até ${data}</div>
    </div>
  </div>`;
}

function escapeHtml(s){
  return String(s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
}

// ======= Sheet de ações =======
function abrirSheetAcoes(id){
  fecharSheetAcoes(); // garante que não duplica

  const wrap = document.createElement('div');
  wrap.className = 'sheet-backdrop';
  wrap.innerHTML = `
    <div class="sheet">
      <div class="sheet-handle"></div>
      <button class="sheet-btn" data-act="edit">Editar</button>
      <button class="sheet-btn" data-act="done">Marcar como concluído</button>
      <button class="sheet-btn danger" data-act="delete">Excluir</button>
      <button class="sheet-btn outline" data-act="cancel">Cancelar</button>
    </div>
  `;
  document.body.appendChild(wrap);

  wrap.addEventListener('click', (e)=>{ if (e.target === wrap) fecharSheetAcoes(); });

  wrap.querySelectorAll('.sheet-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const act = btn.dataset.act;
      if (act === 'edit'){
        location.href = `editarDesafio.html?id=${encodeURIComponent(id)}`;
      } else if (act === 'done'){
        concluirDesafio(id);
      } else if (act === 'delete'){
        excluirDesafio(id);
      } else {
        fecharSheetAcoes();
      }
    });
  });
}

function fecharSheetAcoes(){
  document.querySelectorAll('.sheet-backdrop').forEach(el=> el.remove());
}

// ===== Ações =====
function concluirDesafio(id){
  const list = loadList();
  const idx = list.findIndex(d => String(d.id) === String(id));
  if (idx === -1){ alert('Desafio não encontrado.'); return; }
  list[idx].status = 'concluido';
  list[idx].concluidoEmISO = new Date().toISOString();
  saveList(list);
  fecharSheetAcoes();
  render();
  alert('Desafio marcado como concluído!');
}

function excluirDesafio(id){
  if(!confirm('Deseja realmente excluir este desafio?')) return;
  const list = loadList().filter(d => String(d.id) !== String(id));
  saveList(list);
  fecharSheetAcoes();
  render();
  alert('Desafio excluído.');
}
