// ajuste 1vh
function fixVh(){ const vh = innerHeight*0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

const $ = (id)=>document.getElementById(id);
const DATA_URL = '../data/videos.json';

let DATA = [];
let catAtiva = 'todos';
let q = '';

document.addEventListener('DOMContentLoaded', async ()=>{
  const foto = localStorage.getItem('usuario_foto'); if (foto) { const img = $('fotoPerfilTop'); if (img) img.src = foto; }
  $('btnVoltar')?.addEventListener('click', (e)=>{ e.preventDefault(); history.length>1?history.back():location.href='suporte.html'; });

  await carregar();

  document.querySelectorAll('.chip').forEach(ch=>{
    ch.addEventListener('click', ()=>{
      document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
      ch.classList.add('active');
      catAtiva = ch.dataset.cat;
      render();
    });
  });

  $('q').addEventListener('input', (e)=>{ q = (e.target.value||'').toLowerCase(); render(); });

  // delegação: assistir
  $('lista').addEventListener('click', (e)=>{
    const btn = e.target.closest('.btn-watch');
    const card = e.target.closest('.card');
    const holder = btn || card;
    if(!holder) return;
    const id = holder.dataset.id;
    location.href = `video.html?id=${encodeURIComponent(id)}`;
  });

  render();
});

async function carregar(){
  try{
    const res = await fetch(DATA_URL, { cache:'no-store' });
    DATA = await res.json();
  }catch{ DATA = []; }
}

function render(){
  const box = $('lista');
  let list = [...DATA];

  if(catAtiva !== 'todos') list = list.filter(v => v.categoria === catAtiva);

  if(q){
    list = list.filter(v =>
      (v.titulo||'').toLowerCase().includes(q) ||
      (v.descricao||'').toLowerCase().includes(q)
    );
  }

  if(!list.length){
    box.innerHTML = '';
    $('vazio').hidden = false;
    return;
  }
  $('vazio').hidden = true;

  box.innerHTML = list
    .sort((a,b)=> (b.atualizadoISO||'').localeCompare(a.atualizadoISO||''))
    .map(cardHtml).join('');
}

function cardHtml(v){
  const data = v.atualizadoISO ? new Date(v.atualizadoISO).toLocaleDateString('pt-BR',{day:'2-digit',month:'short'}) : '';
  const thumb = v.thumb || '../img/placeholder-video.jpg';
  return `
    <article class="card">
      <img src="${escapeHtml(thumb)}" alt=""
           onerror="this.onerror=null;this.src='../img/placeholder-video.jpg'">
      <div>
        <div class="ctitle">${escapeHtml(v.titulo||'Vídeo')}</div>
        <div class="cmeta">
          ${v.categoria||''}${v.duracao?` • ${v.duracao}`:''}${data?` • ${data}`:''}
        </div>
      </div>
      <button class="btn-watch" data-id="${String(v.id)}">ASSISTIR</button>
    </article>
  `;
}

function escapeHtml(s){ return String(s||'').replace(/[&<>]/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;' }[c])); }
