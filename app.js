// Configuração — edite aqui (sem mexer no HTML)
var CONFIG = {
  BACKEND_URL: 'https://site-osint-backend.onrender.com',
  HOTMART_URL: 'https://go.hotmart.com/F107580564I?dp=1',
  // Seu WhatsApp comercial (só números, com DDI+DDD). Vazio = botão oculto.
  WHATSAPP: '',
  WHATSAPP_MSG: 'Olá! Quero uma proposta para minha empresa.'
};

(function () {
  var wa = document.getElementById('wa-float');
  if (wa) {
    if (CONFIG.WHATSAPP) {
      wa.href = 'https://wa.me/' + CONFIG.WHATSAPP + '?text=' + encodeURIComponent(CONFIG.WHATSAPP_MSG);
    } else {
      wa.style.display = 'none';
    }
  }
})();

var btnHotmart = document.getElementById('btn-hotmart');
if (btnHotmart && CONFIG.HOTMART_URL) btnHotmart.href = CONFIG.HOTMART_URL;

var formPix = document.getElementById('pix-auto');
if (formPix) formPix.addEventListener('submit', function (e) {
  e.preventDefault();
  var f = new FormData(e.target);
  var msg = document.getElementById('msg-pix');
  if (!CONFIG.BACKEND_URL) { msg.textContent = 'Resgate indisponível no momento.'; return; }
  msg.textContent = 'Validando código...';
  fetch(CONFIG.BACKEND_URL.replace(/\/$/, '') + '/api/resgatar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: f.get('email'), codigo: f.get('codigo'), tipo: f.get('tipo'), alvo: f.get('alvo') })
  }).then(function (r) { return r.json(); })
    .then(function (j) {
      msg.textContent = j.ok ? j.msg : (j.erro || 'Falha ao resgatar.');
      if (j.ok) e.target.reset();
    }).catch(function () { msg.textContent = 'Falha de conexão. Tente mais tarde.'; });
});
