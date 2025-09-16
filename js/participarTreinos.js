// participarTreinos.js v2 — página propositalmente vazia
const $ = (id)=>document.getElementById(id);
function fixVh(){ const vh = innerHeight*0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

document.addEventListener('DOMContentLoaded', () => {
  const foto = localStorage.getItem('usuario_foto');
  if (foto) { const img = $('fotoPerfilTop'); if (img) img.src = foto; }

  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = 'desafio.html');
  });

  // Não renderizamos nada enquanto não houver outros usuários/backend.
  // Quando o backend existir, este arquivo passa a buscar e listar convites/públicos.
});
