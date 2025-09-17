const $ = (id)=>document.getElementById(id);
function fixVh(){ const vh = innerHeight * 0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

document.addEventListener('DOMContentLoaded', ()=>{
  const foto = localStorage.getItem('usuario_foto');
  if (foto) { const img = $('fotoPerfilTop'); if (img) img.src = foto; }

  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = 'suporte.html');
  });
});
