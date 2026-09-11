document.getElementById('lead').addEventListener('submit', function (e) {
  e.preventDefault();
  var f = new FormData(e.target);
  var nome = (f.get('nome') || '').toString().trim();
  var dominio = (f.get('dominio') || '').toString().trim();
  var msg = document.getElementById('msg');
  if (!nome || !dominio) { msg.textContent = 'Preencha nome e domínio.'; return; }
  var leads = [];
  try { leads = JSON.parse(localStorage.getItem('osint_leads') || '[]'); } catch (err) { leads = []; }
  leads.push({ nome: nome, email: f.get('email'), dominio: dominio, cargo: f.get('cargo'), data: new Date().toISOString() });
  try { localStorage.setItem('osint_leads', JSON.stringify(leads)); } catch (err) {}
  msg.textContent = 'Recebido, ' + nome + '. Retornaremos com o diagnóstico gratuito para ' + dominio + '.';
  e.target.reset();
});
