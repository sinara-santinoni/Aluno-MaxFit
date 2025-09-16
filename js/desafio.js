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

// Somente mostramos desafios criados por mim ou que eu esteja participando.
const ALLOWED_ORIGINS = ['eu','participando'];

// ===== estado =====
let filtro = 'ativos'; // 'todos' | 'ativos' | 'concluidos'

// ===== init =====
document.addEventListener('DOMContentLoaded', () => {
  // topo
  $('btnVoltar')?.addEventListener('click', (e)=>{ e.preventDefault(); if(history.length>1) history.back(); else location.href='../index.html'; });
  const foto = localStorage.getItem('usuario_foto'); if (foto) $('fotoPerfil').src = foto;

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
  $('btnCriar').addEventListener('click', ()=> location.href='criarDesafio.html');
  $('btnParticipar').addEventListener('click', ()=>{
    alert('Em breve você poderá participar de desafios criados por outros usuários (via backend).');
  });

  // 1x: remove qualquer item que não seja "eu" ou "participando" (ex.: demo/sistema)
  purgeNotAllowed();

  render();
});

// remove do storage itens com origem não permitida
function purgeNotAllowed(){
  const list = loadList();
  const clean = list.filter(x => ALLOWED_ORIGINS.includes(x.origem));
  if (clean.length !== list.length) saveList(clean);
}

// ===== render =====
function render(){
  const box = $('listaDesafios');
  let list = loadList().filter(x => ALLOWED_ORIGINS.includes(x.origem)); // segurança extra

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
  const data = d.ateISO ? new Date(d.ateISO).toLocaleDateString('pt-BR',{day:'2-digit',month:'long'}) : '—';
  const logo = d.logo || '../img/logo.png';
  return `
  <div class="card">
    <img class="logo" src="${logo}" alt="">
    <div>
      <div class="ctitle">${escapeHtml(d.titulo || 'Desafio')}</div>
      <div class="deadline">Até ${data}</div>
    </div>
  </div>`;
}

function escapeHtml(s){ return String(s||'').replace(/[&<>]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c])); }
