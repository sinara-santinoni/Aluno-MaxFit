// ===== Suporte Nutricional – Google Places =====
const GOOGLE_API_KEY = ""; // <<< COLOQUE SUA CHAVE AQUI (pode ser a mesma da página psicológica)

const $ = (id)=>document.getElementById(id);
function fixVh(){ const vh = innerHeight * 0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

let placesService = null;
let paginationRef = null;

document.addEventListener('DOMContentLoaded', ()=>{
  const foto = localStorage.getItem('usuario_foto');
  if (foto) { const img = $('fotoPerfilTop'); if (img) img.src = foto; }

  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    history.length > 1 ? history.back() : (location.href = 'suporte.html');
  });

  if (!GOOGLE_API_KEY){
    $('apiHint').hidden = false;
  } else {
    $('apiHint').hidden = true;
    loadGoogleMapsScript(initPlaces);
  }

  $('btnGeo').addEventListener('click', usarMinhaLocalizacao);
  $('btnBuscar').addEventListener('click', onBuscar);
  $('btnMais').addEventListener('click', ()=> paginationRef?.nextPage());
});

function loadGoogleMapsScript(cb){
  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_API_KEY)}&libraries=places&callback=__gm_cb2`;
  window.__gm_cb2 = function(){ cb && cb(); delete window.__gm_cb2; };
  const s = document.createElement('script');
  s.src = src; s.async = true; s.defer = true;
  document.head.appendChild(s);
}

function initPlaces(){
  const dummy = document.createElement('div');
  dummy.style.display = 'none';
  document.body.appendChild(dummy);
  placesService = new google.maps.places.PlacesService(dummy);
}

function usarMinhaLocalizacao(){
  if (!navigator.geolocation) { alert('Geolocalização não suportada.'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const { latitude, longitude } = pos.coords;
    $('locInput').value = `Minha localização (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    $('locInput').dataset.lat = latitude;
    $('locInput').dataset.lng = longitude;
  }, ()=> alert('Não foi possível obter sua localização.'), { enableHighAccuracy:true, timeout:10000 });
}

function onBuscar(){
  if (!GOOGLE_API_KEY){ alert('Ative sua Google API Key no arquivo JS.'); return; }
  if (!placesService){ alert('Places não inicializado.'); return; }

  $('results').innerHTML = '';
  $('btnMais').style.display = 'none';

  const lat = parseFloat($('locInput').dataset.lat || '');
  const lng = parseFloat($('locInput').dataset.lng || '');
  const locText = $('locInput').value.trim();

  // termos que funcionam bem no BR
  const keyword = 'nutricionista OR "nutrição"';

  if (!isNaN(lat) && !isNaN(lng)){
    nearbySearch({ lat, lng, keyword, radius: 5000 });
  } else if (locText){
    textSearch({ query: `nutricionista ${locText}` });
  } else {
    alert('Digite uma localização ou use sua localização atual.');
  }
}

function nearbySearch({ lat, lng, keyword, radius=5000 }){
  const request = {
    location: new google.maps.LatLng(lat, lng),
    radius,
    keyword
  };
  placesService.nearbySearch(request, onPlacesResponse);
}

function textSearch({ query }){
  const request = { query };
  placesService.textSearch(request, onPlacesResponse);
}

function onPlacesResponse(results, status, pagination){
  if (status !== google.maps.places.PlacesServiceStatus.OK || !results){
    if (!$('results').children.length){
      $('results').innerHTML = `<div class="card">Nenhum resultado encontrado.</div>`;
    }
    return;
  }
  results.forEach(renderPlaceCard);
  paginationRef = pagination && pagination.hasNextPage ? pagination : null;
  $('btnMais').style.display = paginationRef ? 'inline-block' : 'none';
}

function renderPlaceCard(p){
  const name = p.name || 'Profissional';
  const rating = p.rating ? `${p.rating.toFixed(1)} ★` : '—';
  const userRatings = p.user_ratings_total ? `(${p.user_ratings_total})` : '';
  const addr = p.formatted_address || p.vicinity || '';
  const openNow = p.opening_hours?.isOpen ? p.opening_hours.isOpen() : p.opening_hours?.open_now;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <div class="card-title">${escapeHtml(name)}</div>
    <div class="meta">
      <span>${rating} ${userRatings}</span>
      <span class="sep">•</span>
      <span class="${openNow ? 'open':'closed'}">${openNow===true?'Aberto': openNow===false?'Fechado':'—'}</span>
    </div>
    ${addr ? `<div class="addr">${escapeHtml(addr)}</div>` : ''}
  `;
  $('results').appendChild(card);
}

function escapeHtml(s){ return String(s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
