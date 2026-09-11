// Configuração — edite aqui (sem mexer no HTML)
var CONFIG = {
  PIX_CHAVE: 'SUA-CHAVE-PIX-AQUI',
  MP_LINK: 'https://link.mercadopago.com.br/SEU-LINK',
  STRIPE_LINK: 'https://buy.stripe.com/SEU-LINK',
  // Opcional: receba os leads por e-mail via Formspree (grátis).
  // Crie em https://formspree.io, pegue o endpoint e cole abaixo. Vazio = só localStorage.
  FORMSPREE_ENDPOINT: ''
};

(function () {
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

document.getElementById('lead').addEventListener('submit', function (e) {
  e.preventDefault();
  var f = new FormData(e.target);
  var nome = (f.get('nome') || '').toString().trim();
  var email = (f.get('email') || '').toString().trim();
  var dominio = (f.get('dominio') || '').toString().trim();
  var msg = document.getElementById('msg');
  if (!nome || !dominio) { msg.textContent = 'Preencha nome e domínio.'; return; }
  var lead = { nome: nome, email: email, dominio: dominio, cargo: f.get('cargo'), data: new Date().toISOString() };
  var leads = [];
  try { leads = JSON.parse(localStorage.getItem('osint_leads') || '[]'); } catch (err) { leads = []; }
  leads.push(lead);
  try { localStorage.setItem('osint_leads', JSON.stringify(leads)); } catch (err) {}
  if (CONFIG.FORMSPREE_ENDPOINT) {
    fetch(CONFIG.FORMSPREE_ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify(lead) })
      .then(function () { msg.textContent = 'Recebido, ' + nome + '. Retornaremos com o diagnóstico gratuito para ' + dominio + '.'; e.target.reset(); })
      .catch(function () { msg.textContent = 'Salvo localmente. Falha ao enviar ao e-mail — confira o endpoint.'; });
  } else {
    msg.textContent = 'Recebido, ' + nome + '. Retornaremos com o diagnóstico gratuito para ' + dominio + '.';
    e.target.reset();
  }
});
