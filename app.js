// Configuração — edite aqui (sem mexer no HTML)
var CONFIG = {
  PIX_CHAVE: 'SUA-CHAVE-PIX-AQUI',
  MP_LINK: 'https://link.mercadopago.com.br/SEU-LINK',
  STRIPE_LINK: 'https://buy.stripe.com/SEU-LINK',
  // Opcional: receba os leads por e-mail via Formspree (grátis).
  // Crie em https://formspree.io, pegue o endpoint e cole abaixo. Vazio = só localStorage.
  FORMSPREE_ENDPOINT: '',
  // Backend da automação (Render, grátis). Vazio = confirmação de pagamento desabilitada.
  BACKEND_URL: 'https://site-osint-backend.onrender.com',
  // Seu WhatsApp comercial (só números, com DDI+DDD). Vazio = botão oculto.
  WHATSAPP: '',
  WHATSAPP_MSG: 'Olá! Quero o diagnóstico gratuito da minha empresa.'
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
  var pixEl = document.getElementById('pix-chave');
  if (pixEl && CONFIG.PIX_CHAVE !== 'SUA-CHAVE-PIX-AQUI') pixEl.textContent = CONFIG.PIX_CHAVE;
  var mp = document.getElementById('link-mp');
  if (mp && CONFIG.MP_LINK.indexOf('SEU-LINK') === -1) mp.href = CONFIG.MP_LINK;
  var st = document.getElementById('link-stripe');
  if (st && CONFIG.STRIPE_LINK.indexOf('SEU-LINK') === -1) st.href = CONFIG.STRIPE_LINK;
  var btnPix = document.getElementById('btn-pix');
  if (btnPix) btnPix.addEventListener('click', function () {
    if (CONFIG.PIX_CHAVE === 'SUA-CHAVE-PIX-AQUI') { alert('Chave Pix ainda não configurada.'); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(CONFIG.PIX_CHAVE).then(function () {
      btnPix.textContent = 'Chave copiada!';
    });
  });
})();

var formPix = document.getElementById('pix-auto');
if (formPix) formPix.addEventListener('submit', function (e) {
  e.preventDefault();
  var f = new FormData(e.target);
  var msg = document.getElementById('msg-pix');
  if (!CONFIG.BACKEND_URL) { msg.textContent = 'Pix automático ainda não configurado.'; return; }
  msg.textContent = 'Preparando checkout...';
  fetch(CONFIG.BACKEND_URL.replace(/\/$/, '') + '/api/iniciar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: f.get('email'), tipo: f.get('tipo'), alvo: f.get('alvo') })
  }).then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j.ok) { msg.textContent = j.erro || 'Falha ao preparar pagamento.'; return; }
      msg.textContent = 'Abrindo pagamento... após pagar, o relatório chega por e-mail.';
      window.open(j.url, '_blank', 'noopener');
    }).catch(function () { msg.textContent = 'Falha de conexão. Tente mais tarde.'; });
});

var formConfirmar = document.getElementById('confirmar');
if (formConfirmar) formConfirmar.addEventListener('submit', function (e) {
  e.preventDefault();
  var f = new FormData(e.target);
  var msg = document.getElementById('msg-pag');
  if (!CONFIG.BACKEND_URL) { msg.textContent = 'Confirmação automática ainda não configurada. Envie o comprovante pelo contato.'; return; }
  msg.textContent = 'Verificando pagamento...';
  fetch(CONFIG.BACKEND_URL.replace(/\/$/, '') + '/api/confirmar', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: f.get('email'), tipo: f.get('tipo'), alvo: f.get('alvo'), payment_id: f.get('payment_id') })
  }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
    .then(function (res) {
      msg.textContent = res.j.msg || res.j.erro || 'Resposta do servidor.';
      if (res.ok) e.target.reset();
    }).catch(function () { msg.textContent = 'Falha de conexão com o servidor. Tente mais tarde.'; });
});

document.getElementById('lead').addEventListener('submit', function (e) {
  e.preventDefault();
  var f = new FormData(e.target);
  var nome = (f.get('nome') || '').toString().trim();
  var contato = (f.get('contato') || '').toString().trim();
  var msg = document.getElementById('msg');
  if (!nome || !contato) { msg.textContent = 'Preencha nome e contato.'; return; }
  var lead = { nome: nome, contato: contato, data: new Date().toISOString() };
  var leads = [];
  try { leads = JSON.parse(localStorage.getItem('osint_leads') || '[]'); } catch (err) { leads = []; }
  leads.push(lead);
  try { localStorage.setItem('osint_leads', JSON.stringify(leads)); } catch (err) {}
  if (CONFIG.FORMSPREE_ENDPOINT) {
    fetch(CONFIG.FORMSPREE_ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
      .then(function () { msg.textContent = 'Recebido, ' + nome + '! Te chamo em instantes.'; e.target.reset(); })
      .catch(function () { msg.textContent = 'Salvo localmente. Falha ao enviar ao e-mail — confira o endpoint.'; });
  } else {
    msg.textContent = 'Recebido, ' + nome + '! Te chamo em instantes.';
    e.target.reset();
  }
});
