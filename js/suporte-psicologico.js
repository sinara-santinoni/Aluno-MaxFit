// ===== Suporte Psicológico – integração com Google Places (Maps JS API / Places) =====
const GOOGLE_API_KEY = ""; // <<< COLOQUE SUA CHAVE AQUI

const $ = (id)=>document.getElementById(id);
function fixVh(){ const vh = innerHeight * 0.01; document.documentElement.style.setProperty('--vh', `${vh}px`); }
fixVh(); addEventListener('resize', fixVh); addEventListener('orientationchange', fixVh);

let placesService = null;
let paginationRef = null;   // para "ver mais"
let searchMode = null;      // 'nearby' ou 'text'

// carregar foto & voltar
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

// carrega Maps JS com library places
function loadGoogleMapsScript(cb){
  const src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_API_KEY)}&libraries=places&callback=__gm_cb`;
  window.__gm_cb = function(){ cb && cb(); delete window.__gm_cb; };
  const s = document.createElement('script');
  s.src = src; s.async = true; s.defer = true;
  document.head.appendChild(s);
}

function initPlaces(){
  // precisa de um container "map" ou qualquer div para o PlacesService
  const dummy = document.createElement('div');
  dummy.style.display = 'none';
  document.body.appendChild(dummy);
  placesService = new google.maps.places.PlacesService(dummy);
}

// ===== Ações UI =====
function usarMinhaLocalizacao(){
  if (!navigator.geolocation) { alert('Geolocalização não suportada.'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const { latitude, longitude } = pos.coords;
    $('locInput').value = `Minha localização (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    $('locInput').dataset.lat = latitude;
    $('locInput').dataset.lng = longitude;
  }, err=>{
    alert('Não foi possível obter sua localização.');
    console.error(err);
  }, { enableHighAccuracy:true, timeout:10000 });
}

function onBuscar(){
  if (!GOOGLE_API_KEY){ alert('Ative sua Google API Key no arquivo JS.'); return; }
  if (!placesService){ alert('Places não inicializado.'); return; }

  // limpa resultados
  $('results').innerHTML = '';
  $('btnMais').style.display = 'none';

  const lat = parseFloat($('locInput').dataset.lat || '');
  const lng = parseFloat($('locInput').dataset.lng || '');
  const locText = $('locInput').value.trim();
  const keyword = 'psicólogo'; // fixo conforme a tela

  if (!isNaN(lat) && !isNaN(lng)){
    // Busca por proximidade (5km) usando GPS
    nearbySearch({ lat, lng, keyword, radius: 5000 });
  } else if (locText){
    // Busca textual (psicólogo + local digitado)
    textSearch({ query: `${keyword} ${locText}` });
  } else {
    alert('Digite uma localização ou use sua localização atual.');
  }
}

// ===== Integração Places =====
function nearbySearch({ lat, lng, keyword, radius=5000 }){
  searchMode = 'nearby';
  const request = {
    location: new google.maps.LatLng(lat, lng),
    radius,
    keyword
  };
  placesService.nearbySearch(request, onPlacesResponse);
}

function textSearch({ query }){
  searchMode = 'text';
  const request = { query };
  placesService.textSearch(request, onPlacesResponse);
}

function onPlacesResponse(results, status, pagination){
  if (status !== google.maps.places.PlacesServiceStatus.OK || !results){
    if (status !== google.maps.places.PlacesServiceStatus.ZERO_RESULTS){
      console.warn('Places status:', status);
    }
    if (!$('results').children.length){
      $('results').innerHTML = `<div class="card">Nenhum resultado encontrado.</div>`;
    }
    return;
  }

  results.forEach(renderPlaceCard);

  // paginação
  paginationRef = pagination && pagination.hasNextPage ? pagination : null;
  $('btnMais').style.display = paginationRef ? 'inline-block' : 'none';
}

// ===== Render =====
function renderPlaceCard(p){
  const name = p.name || 'Psicólogo';
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
