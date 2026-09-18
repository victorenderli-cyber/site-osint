// Configuração — edite aqui (sem mexer no HTML)
var CONFIG = {
  BACKEND_URL: 'https://site-osint-backend.onrender.com',
  HOTMART_URL: 'https://go.hotmart.com/F107580564I?dp=1',
  // Link fixo de pagamento Asaas (cobrança Pix R$ 199,90). Se preenchido,
  // o botão de compra usa a Asaas em vez da Hotmart.
  ASAAS_LINK: 'https://www.asaas.com/c/6yclgzlgp3zwdl18',
  // Seu WhatsApp comercial (só números, com DDI+DDD). Vazio = botão oculto.
  WHATSAPP: '5555996236696',
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
if (btnHotmart && CONFIG.ASAAS_LINK) {
  btnHotmart.href = CONFIG.ASAAS_LINK;
  btnHotmart.textContent = 'Pagar R$ 199,90 no Pix';
} else if (btnHotmart && CONFIG.HOTMART_URL) btnHotmart.href = CONFIG.HOTMART_URL;

// Notícias de cibersegurança (atualiza a cada hora)
var NEWS_FEEDS = [
  { nome: 'The Hacker News', url: 'https://feeds.feedburner.com/TheHackersNews' },
  { nome: 'Krebs', url: 'https://krebsonsecurity.com/feed/' },
  { nome: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/feed/' }
];
function tempoAtras(d) {
  var s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 3600) return 'há ' + Math.max(Math.floor(s / 60), 1) + ' min';
  if (s < 86400) return 'há ' + Math.floor(s / 3600) + 'h';
  return 'há ' + Math.floor(s / 86400) + ' dias';
}
function carregarNoticias() {
  var grid = document.getElementById('news-grid');
  if (!grid) return;
  Promise.all(NEWS_FEEDS.map(function (f) {
    return fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(f.url))
      .then(function (r) { return r.json(); })
      .then(function (j) {
        try {
          var xml = new DOMParser().parseFromString(j.contents, 'text/xml');
          if (xml.querySelector('parsererror')) return [];
          var items = Array.prototype.slice.call(xml.querySelectorAll('item')).slice(0, 4);
          return items.map(function (it) {
            var t = it.querySelector('title');
            var l = it.querySelector('link');
            var g = it.querySelector('guid');
            var d = it.querySelector('pubDate') || it.querySelector('updated') || it.querySelector('date');
            var href = l ? (l.getAttribute('href') || l.textContent) : (g ? g.textContent : '');
            return {
              fonte: f.nome,
              titulo: t ? t.textContent.trim() : '',
              link: (href || '').trim(),
              data: new Date(d ? d.textContent : Date.now())
            };
          });
        } catch (e) { return []; }
      }).catch(function () { return []; });
  })).then(function (listas) {
    var todas = [].concat.apply([], listas).filter(function (n) { return n.titulo && n.link; });
    if (!todas.length) { grid.innerHTML = '<p class="mini">Feeds indisponíveis agora — tente mais tarde.</p>'; return; }
    todas.sort(function (a, b) { return b.data - a.data; });
    grid.innerHTML = todas.slice(0, 6).map(function (n) {
      return '<div class="card reveal vis"><span class="news-src">' + n.fonte + '</span>' +
        '<a href="' + n.link + '" target="_blank" rel="noopener">' + n.titulo + '</a>' +
        '<span class="news-time">' + tempoAtras(n.data) + '</span></div>';
    }).join('');
    var upd = document.getElementById('news-upd');
    if (upd) upd.textContent = '· atualizado às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  });
}
carregarNoticias();
setInterval(carregarNoticias, 3600000);

// Reveal on scroll + contadores do hero
(function () {
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  document.querySelectorAll('.card, .bloco h2').forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  document.querySelectorAll('.stats strong').forEach(function (el) {
    var m = el.textContent.match(/(\d+)(.*)/);
    if (!m) return;
    var alvo = parseInt(m[1], 10), suf = m[2], t0 = null;
    function tick(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(alvo * p) + suf;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
})();

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
