// /Aluno-MaxFit/js/criardesafio.js
// JS para a página /pages/criardesafio.html

// ===== Ajuste de 1vh no mobile =====
function fixVh(){
  const vh = innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}
fixVh();
addEventListener('resize', fixVh);
addEventListener('orientationchange', fixVh);

// ===== Helpers =====
const $ = (id)=>document.getElementById(id);
const STORAGE_KEY = ()=> `desafios:${localStorage.getItem('usuario_id') || 'default'}`;

function loadList(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY()) || '[]'); }
  catch { return []; }
}
function saveList(list){
  localStorage.setItem(STORAGE_KEY(), JSON.stringify(list));
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', () => {
  // foto/nome do topo e do aluno
  const foto = localStorage.getItem('usuario_foto');
  if (foto) { $('fotoPerfilTop').src = foto; $('fotoAluno').src = foto; }
  $('nomeAluno').value = localStorage.getItem('usuario_nome') || 'Aluno';

  // botão voltar
  $('btnVoltar')?.addEventListener('click', (e)=>{
    e.preventDefault();
    if (history.length > 1) history.back();
    else location.href = 'desafio.html';
  });

  // verifica se veio com ?id=... (modo gerenciar existente)
  const url = new URL(location.href);
  const id  = url.searchParams.get('id');
  const btnIrEditar = $('btnIrEditar');
  const btnConcluir = $('btnConcluir');

  if (id) {
    // mostra botões extras
    if (btnIrEditar) {
      btnIrEditar.style.display = 'inline-block';
      btnIrEditar.href = `editarDesafio.html?id=${encodeURIComponent(id)}`;
    }
    if (btnConcluir) {
      btnConcluir.style.display = 'inline-block';
      btnConcluir.addEventListener('click', () => concluirDesafio(id));
    }
  }

  // submit: criar novo desafio
  $('formCriar').addEventListener('submit', (e)=>{
    e.preventDefault();

    const titulo = $('titulo').value.trim();
    const descricao = $('descricao').value.trim();
    const ateISO = $('ate').value; // yyyy-mm-dd

    if (!titulo){ alert('Informe o título do desafio.'); return; }
    if (!ateISO){ alert('Informe a data de término.'); return; }

    const novo = {
      id: Date.now(),
      titulo,
      descricao,
      ateISO,
      status: 'ativo',
      origem: 'eu', // importante: a listagem só mostra "eu" ou "participando"
      alunoNome: $('nomeAluno').value || (localStorage.getItem('usuario_nome') || 'Aluno'),
      alunoId: localStorage.getItem('usuario_id') || 'default',
      criadoEmISO: new Date().toISOString()
    };

    const list = loadList();
    list.push(novo);
    saveList(list);

    alert('Desafio criado com sucesso!');
    location.href = 'desafio.html';
  });
});

// ===== Concluir desafio existente =====
function concluirDesafio(id){
  const list = loadList();
  const idx = list.findIndex(d => String(d.id) === String(id));
  if (idx === -1){
    alert('Desafio não encontrado.');
    return;
  }
  list[idx].status = 'concluido';
  list[idx].concluidoEmISO = new Date().toISOString();
  saveList(list);

  alert('Desafio marcado como concluído!');
  location.href = 'desafio.html';
}
