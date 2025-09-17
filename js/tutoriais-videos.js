// ===== Tutoriais em vídeo (somente leitura; preenchido pelo personal via backend) =====
const $ = (id)=>document.getElementById(id);
function fixVh(){ const vh = innerHeight * 0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

// Chaves de armazenamento (ponto de integração com backend)
const FEED_KEY = 'tutorials:feed'; // array de vídeos publicados para o aluno

document.addEventListener('DOMContentLoaded', () => {
  // avatar
  const foto = localStorage.getItem('usuario_foto');
  if (foto) { const img = $('fotoPerfilTop'); if (img) img.src = foto; }

  // voltar
  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    history.length>1 ? history.back() : (location.href='suporte.html');
  });

  // Render
  renderVideos();

  // modal
  $('btnCloseModal').addEventListener('click', fecharModal);
  $('playerModal').addEventListener('click', (e)=>{
    if (e.target.classList.contains('modal-backdrop')) fecharModal();
  });

  // ==== DEV: exemplo de “semear” vídeos localmente (apenas p/ testes) ====
  // seedIfEmpty();
});

// --------- Renderização ----------
function loadFeed(){
  try { return JSON.parse(localStorage.getItem(FEED_KEY) || '[]'); }
  catch { return []; }
}

function renderVideos(){
  const list = loadFeed();
  const wrap = $('listaVideos');
  wrap.innerHTML = '';

  if (!list.length){
    $('vazio').hidden = false;
    return;
  }
  $('vazio').hidden = true;

  list.forEach(v => {
    const card = document.createElement('article');
    card.className = 'tcard';
    card.innerHTML = `
      ${v.thumb ? `<img class="thumb" src="${escapeHtml(v.thumb)}" alt="">`
                 : `<div class="thumb" style="display:grid;place-items:center;background:#fff3e8;"><ion-icon name="play-circle-outline" style="font-size:40px;color:#ff6a00"></ion-icon></div>`}
      <div>
        <div class="title-sm">${escapeHtml(v.title || 'Vídeo')}</div>
        <button class="watch">ASSISTIR</button>
      </div>
    `;
    card.querySelector('.watch').addEventListener('click', ()=> abrirModal(v));
    wrap.appendChild(card);
  });
}

function escapeHtml(s){ return String(s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

// --------- Player Modal ----------
function abrirModal(video){
  const modal = $('playerModal');
  const player = $('playerWrap');
  const title  = $('playerTitle');
  player.innerHTML = ''; // limpa
  title.textContent = video.title || '';

  if (isYouTube(video.url)){
    player.innerHTML = `<iframe src="${toYouTubeEmbed(video.url)}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
  } else {
    player.innerHTML = `<video src="${escapeHtml(video.url||'')}" controls playsinline></video>`;
  }
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden','false');
}

function fecharModal(){
  const modal = $('playerModal');
  $('playerWrap').innerHTML = ''; // remove player
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
}

function isYouTube(u){ return /youtu\.be|youtube\.com/i.test(u||''); }
function toYouTubeEmbed(u){
  if(!u) return '';
  // suporta https://youtu.be/ID e https://www.youtube.com/watch?v=ID
  const m1 = u.match(/youtu\.be\/([^?&]+)/i);
  const m2 = u.match(/[?&]v=([^?&]+)/i);
  const id = m1?.[1] || m2?.[1] || '';
  return id ? `https://www.youtube.com/embed/${id}` : u;
}

// --------- DEV helper (opcional) ----------
function seedIfEmpty(){
  const cur = loadFeed();
  if (cur.length) return;
  const sample = [
    {
      id: 1,
      title: 'Peck Deck',
      thumb: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=2Qz9b6J1gVY'
    },
    {
      id: 2,
      title: 'Leg Press',
      thumb: 'https://images.unsplash.com/photo-1599058917212-d750089bc03f?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=IZxyjW7MPJQ'
    },
    {
      id: 3,
      title: 'Flexão',
      thumb: 'https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=600&auto=format&fit=crop',
      url: 'https://www.youtube.com/watch?v=IODxDxX7oi4'
    }
  ];
  localStorage.setItem(FEED_KEY, JSON.stringify(sample));
  renderVideos();
}
