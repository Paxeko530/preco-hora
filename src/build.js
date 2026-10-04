// Gerador do site estático. Uso: node build.js   (saída em ./dist)
const fs = require('fs'), path = require('path');
const P = require('./data.js');

const BASE = process.env.BASE_URL || 'https://paxeko530.github.io/preco-hora';
const PFX = new URL(BASE).pathname.replace(/\/$/, '');          // prefixo de caminho (GitHub Pages)
const SHOP = process.env.SHOP_URL || 'https://paxeko530.gumroad.com';
const FORM = process.env.FORM_URL || '';   // sem URL, o formulário de email não é publicado
const GC = process.env.GC_CODE || '';     // código GoatCounter; sem ele não há estatísticas
const OUT = path.join(__dirname, 'dist');

const w = (f, c) => { const p = path.join(OUT, f); fs.mkdirSync(path.dirname(p), {recursive: true}); fs.writeFileSync(p, c); };
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');

const CSS = `:root{--bg:#f6f7f9;--card:#fff;--line:#e2e5eb;--tx:#14171d;--mut:#5b6573;--ac:#16a34a;--ac2:#15803d;--ink:#fff}
@media (prefers-color-scheme:dark){:root{--bg:#0f1115;--card:#171a21;--line:#262b36;--tx:#e8eaf0;--mut:#9aa3b2;--ac:#4ade80;--ac2:#22c55e;--ink:#06210f}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--tx);font:16px/1.65 system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
.w{max-width:960px;margin:0 auto;padding:0 16px}
nav{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid var(--line);gap:12px;flex-wrap:wrap}
nav a{color:var(--tx);text-decoration:none}nav .logo{font-weight:800}nav .links a{margin-left:16px;color:var(--mut);font-size:.9rem}
h1{font-size:clamp(1.7rem,4.5vw,2.5rem);line-height:1.15;margin:.6em 0 .3em}h2{margin-top:2em}
.sub{color:var(--mut);max-width:680px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
@media(max-width:760px){.grid{grid-template-columns:1fr}}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:20px}
a.card{color:var(--tx);text-decoration:none}a.card:hover{border-color:var(--ac)}
label{display:block;font-size:.9rem;color:var(--mut);margin:12px 0 4px}
input{width:100%;padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg);color:var(--tx);font-size:1rem}
input:focus{outline:2px solid var(--ac);border-color:transparent}
.big{font-size:2.8rem;font-weight:800;color:var(--ac);line-height:1.1}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);gap:12px}.row:last-of-type{border:0}.row b{font-variant-numeric:tabular-nums;white-space:nowrap}
.note{font-size:.85rem;color:var(--mut)}
.btn{display:inline-block;background:var(--ac);color:var(--ink);font-weight:700;padding:12px 20px;border-radius:10px;text-decoration:none;border:0;cursor:pointer;font-size:1rem}.btn:hover{background:var(--ac2)}
.cta{border-color:var(--ac)}
form.mail{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}form.mail input{flex:1;min-width:200px}
details{border-bottom:1px solid var(--line);padding:12px 0}summary{cursor:pointer;font-weight:600}
ul.l{padding-left:20px}ul.l li{margin:6px 0}
footer{padding:32px 0 48px;color:var(--mut);font-size:.85rem;border-top:1px solid var(--line);margin-top:40px}footer a{color:var(--mut)}
.pill{display:inline-block;font-size:.75rem;border:1px solid var(--line);color:var(--mut);padding:2px 10px;border-radius:99px}
.crumbs{font-size:.85rem;color:var(--mut);padding-top:14px}.crumbs a{color:var(--mut)}`;

const JS = `const $=id=>document.getElementById(id);
const eur=n=>isFinite(n)?n.toLocaleString('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:0}):'—';
function calc(v){const t=1-v.tax/100;const y=v.cost*12+(t>0?v.net*12/t:Infinity);const h=(52-v.off)*v.hpw*v.bill/100;const r=h>0?y/h:Infinity;const n=v.net/160;return{y,h,r,d:r*8,m:y/12,p:r*v.proj*1.2,n,loss:y-n*h}}
function run(){const v={net:+$('net').value,cost:+$('cost').value,tax:+$('tax').value,hpw:+$('hpw').value,bill:+$('bill').value,off:+$('off').value,proj:+$('proj').value};const r=calc(v);
$('hour').textContent=eur(r.r)+' /h';$('day').textContent=eur(r.d);$('mrev').textContent=eur(r.m);$('yrev').textContent=eur(r.y);
$('bh').textContent=isFinite(r.h)?Math.round(r.h).toLocaleString('pt-PT'):'—';$('pp').textContent=eur(r.p);$('naive').textContent=eur(r.n)+' /h';$('loss').textContent=eur(r.loss)}
document.querySelectorAll('.calc input').forEach(i=>i.addEventListener('input',run));run();`;

const url = p => PFX + p;

function layout({title, desc, path: p, body, ld, script}) {
  return `<!doctype html>
<html lang="pt-PT"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${BASE}${p}"><link rel="stylesheet" href="${url('/style.css')}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:locale" content="pt_PT">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}</head>
<body><div class="w">
<nav><a class="logo" href="${url('/')}">Preço Hora</a><span class="links"><a href="${url('/guia/como-calcular-preco-hora/')}">Guia</a><a href="${url('/guia/7-erros-preco-freelancer/')}">7 erros</a><a href="${SHOP}" rel="noopener">Planilhas</a></span></nav>
${body}
<footer>Esta ferramenta é informativa e não constitui aconselhamento fiscal ou financeiro. Os valores de partida são ilustrativos e não representam taxas de mercado. Algumas ligações podem ser de afiliado: se comprar através delas, podemos receber uma comissão sem custo adicional para si.
<br><a href="${url('/privacidade/')}">Privacidade</a></footer>
</div>${script === false ? '' : `<script src="${url('/calc.js')}"></script>`}${GC ? `<script data-goatcounter="https://${GC}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>` : ''}</body></html>`;
}

const calc = (d = {}) => `<section class="grid calc" aria-label="Calculadora">
<div class="card">
<label for="net">Rendimento líquido desejado por mês (€)</label><input id="net" type="number" min="0" value="${d.net ?? 1800}">
<label for="cost">Custos fixos mensais (€)</label><input id="cost" type="number" min="0" value="${d.cost ?? 250}">
<label for="tax">Impostos e contribuições sobre o lucro (%)</label><input id="tax" type="number" min="0" max="80" value="30">
<label for="hpw">Horas de trabalho por semana</label><input id="hpw" type="number" min="1" max="80" value="40">
<label for="bill">Percentagem de horas faturáveis (%)</label><input id="bill" type="number" min="10" max="100" value="${d.bill ?? 60}">
<label for="off">Semanas sem trabalhar por ano</label><input id="off" type="number" min="0" max="40" value="6">
<p class="note">A taxa de impostos depende do seu regime; confirme com o contabilista.</p></div>
<div class="card" aria-live="polite"><div class="note">Preço mínimo por hora</div><div class="big" id="hour">—</div>
<div class="row"><span>Preço por dia (8 h)</span><b id="day">—</b></div>
<div class="row"><span>Faturação necessária / mês</span><b id="mrev">—</b></div>
<div class="row"><span>Faturação necessária / ano</span><b id="yrev">—</b></div>
<div class="row"><span>Horas faturáveis / ano</span><b id="bh">—</b></div>
<label for="proj">Projeto estimado em (horas)</label><input id="proj" type="number" min="1" value="20">
<div class="row"><span>Preço do projeto (+20% de risco)</span><b id="pp">—</b></div></div></section>
<section class="card" style="margin-bottom:16px"><strong>O erro mais comum</strong><p style="margin:.4em 0 0">Dividir o rendimento desejado por 160 horas dá <b id="naive">—</b>. Cobrando isso, ficaria com cerca de <b id="loss">—</b> a menos por ano do que precisa.</p></section>`;

const cta = `<section class="card cta"><h2 style="margin-top:0">Já sabe o preço. E o resto do negócio?</h2>
<p>Rendimento irregular exige controlo: faturação, impostos a pôr de lado, fundo de emergência. As nossas planilhas fazem isso por si.</p>
<a class="btn" href="${SHOP}" rel="noopener">Ver as planilhas para freelancers</a></section>
${FORM ? `<section class="card" style="margin-top:16px"><strong>Guia grátis: 7 erros que fazem o freelancer cobrar menos do que devia</strong>
<form class="mail" method="post" action="${FORM}"><input type="email" name="email" placeholder="o.seu@email.pt" required aria-label="Email"><button class="btn" type="submit">Quero o guia</button></form>
<p class="note">Sem spam. Ao subscrever aceita a <a href="${url('/privacidade/')}">política de privacidade</a>.</p></section>` : ''}`;

const faqBlock = faq => `<h2>Perguntas frequentes</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}`;
const faqLd = faq => ({'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});

// ---------- Home ----------
const homeFaq = [['Como se calcula o preço por hora de um freelancer?', 'Soma-se o rendimento líquido desejado com os custos fixos, ajusta-se aos impostos e divide-se pelas horas realmente faturáveis no ano, descontando férias e tempo não faturável.'], ['Porque não posso dividir o salário desejado por 160 horas?', 'Porque só parte das horas é faturável: há propostas, administração, formação e períodos sem projetos. Ignorar isso faz cobrar abaixo do necessário.']];
w('index.html', layout({
  title: 'Quanto cobrar à hora como freelancer? Calculadora grátis',
  desc: 'Calcule em 30 segundos o preço por hora e por dia que precisa de cobrar como freelancer para atingir o rendimento líquido que quer. Grátis, sem registo.',
  path: '/', ld: faqLd(homeFaq),
  body: `<span class="pill" style="margin-top:20px">Ferramenta grátis · sem registo</span>
<h1>Quanto deve cobrar à hora como freelancer?</h1>
<p class="sub">A maioria dos freelancers divide o salário que quer por 160 horas e cobra pouco. Esta calculadora desconta impostos, custos, férias e o tempo que não fatura.</p>
${calc()}${cta}
<h2>Calculadora por profissão</h2><div class="cards">${P.map(p => `<a class="card" href="${url('/preco-hora/' + p.slug + '/')}"><strong>${p.Name}</strong><br><span class="note">Valores de partida e dicas para a sua área</span></a>`).join('')}</div>
<h2>Como funciona o cálculo</h2>
<p>Faturação anual = custos anuais + rendimento líquido anual ÷ (1 − taxa de impostos). Esse valor divide-se pelas horas realmente faturáveis: semanas trabalhadas × horas por semana × percentagem faturável.</p>
<p>Quer perceber cada passo? Leia o <a href="${url('/guia/como-calcular-preco-hora/')}">guia completo</a>.</p>
${faqBlock(homeFaq)}`
}));

// ---------- Profissões ----------
for (const p of P) {
  const path_ = `/preco-hora/${p.slug}/`;
  const others = P.filter(o => o.slug !== p.slug).slice(0, 4);
  w(`preco-hora/${p.slug}/index.html`, layout({
    title: `Quanto cobrar à hora como ${p.name}? Calculadora`,
    desc: `Calcule o preço por hora e por dia de um ${p.name} em Portugal, com custos típicos da profissão, impostos e tempo não faturável.`,
    path: path_, ld: faqLd(p.faq),
    body: `<div class="crumbs"><a href="${url('/')}">Início</a> › ${p.Name}</div>
<h1>Quanto cobrar à hora como ${p.name}?</h1>
<p class="sub">Calculadora com valores de partida para esta profissão. Ajuste-os à sua realidade: são ilustrativos, não uma tabela de preços.</p>
${calc(p)}
<h2>Custos típicos de um ${p.name}</h2><ul class="l">${p.costs.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
<p class="note">Some os seus custos reais e coloque o total mensal no campo de custos fixos.</p>
<h2>Onde se perde tempo faturável</h2><p>${esc(p.lost)}</p>
<h2>Como definir o preço</h2><p>${esc(p.unit)}</p>
<ul class="l">${p.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
${cta}${faqBlock(p.faq)}
<h2>Outras profissões</h2><div class="cards">${others.map(o => `<a class="card" href="${url('/preco-hora/' + o.slug + '/')}">${o.Name}</a>`).join('')}</div>`
  }));
}

// ---------- Guia ----------
const guiaFaq = [['Qual a percentagem de horas faturáveis realista?', 'Depende da profissão e da fase do negócio. Quem começa tende a ter valores mais baixos porque dedica mais tempo a angariar clientes. Meça o seu durante um mês.'], ['Devo incluir o IVA no cálculo?', 'O IVA não é rendimento seu: é cobrado ao cliente e entregue ao Estado, se estiver no regime geral. Calcule o preço sem IVA e acrescente-o à fatura. Confirme o seu caso com o contabilista.']];
w('guia/como-calcular-preco-hora/index.html', layout({
  title: 'Como calcular o preço por hora de freelancer, passo a passo',
  desc: 'Guia em 5 passos para calcular o seu preço por hora: rendimento líquido, custos, impostos, horas faturáveis e margem de risco.',
  path: '/guia/como-calcular-preco-hora/', ld: faqLd(guiaFaq),
  body: `<div class="crumbs"><a href="${url('/')}">Início</a> › Guia</div>
<h1>Como calcular o preço por hora de freelancer, passo a passo</h1>
<p class="sub">Cinco passos para chegar a um valor que cobre os seus custos, os impostos e o rendimento que quer, sem adivinhar.</p>
<h2>1. Defina o rendimento líquido que quer</h2><p>É o valor que fica para si depois de impostos e custos. Comece pelas suas despesas pessoais mensais e acrescente uma margem para poupança.</p>
<h2>2. Some os custos do negócio</h2><p>Software, contabilista, equipamento, formação, seguros, deslocações. Divida os custos anuais por 12 para obter o valor mensal.</p>
<h2>3. Conte com os impostos</h2><p>Os impostos e contribuições incidem sobre o lucro e dependem do seu regime. Use uma percentagem prudente e confirme-a com o contabilista. O IVA, se aplicável, não entra no cálculo: é cobrado ao cliente e entregue ao Estado.</p>
<h2>4. Calcule as horas realmente faturáveis</h2><p>Parta das semanas do ano, desconte férias, feriados e doença, multiplique pelas horas semanais e aplique a percentagem faturável. Propostas, administração e formação não são faturadas.</p>
<h2>5. Divida e acrescente margem</h2><p>Faturação necessária ÷ horas faturáveis dá o seu preço mínimo à hora. Em projetos fechados, acrescente uma margem de risco para estimativas curtas.</p>
<p><a class="btn" href="${url('/')}">Abrir a calculadora</a></p>
${cta}${faqBlock(guiaFaq)}`
}));


const G = require('./guia.js');
const guideBody = (print) => `<h1>${esc(G.title)}</h1><p class="sub">${esc(G.intro)}</p><p class="note">${esc(G.example)}</p>
${G.errors.map((e,i)=>`<h2>${i+1}. ${esc(e[0])}</h2><p>${esc(e[1])}</p><p>${esc(e[2])}</p><p><b>Como corrigir:</b> ${esc(e[3])}</p>`).join('')}
<h2>Lista de verificação</h2><ul class="l">${G.checklist.map(c=>`<li>☐ ${esc(c)}</li>`).join('')}</ul><p>${esc(G.close)}</p>`;
w('guia/7-erros-preco-freelancer/index.html', layout({
  title: G.title, desc: 'Os 7 erros mais comuns ao definir preços como freelancer, com exemplos de cálculo e uma lista de verificação.',
  path: '/guia/7-erros-preco-freelancer/', script: false,
  body: `<div class="crumbs"><a href="${url('/')}">Início</a> › Guia</div>${guideBody()}${cta}`
}));
w('../guia-pdf.html', `<!doctype html><html lang="pt-PT"><head><meta charset="utf-8"><title>${esc(G.title)}</title><style>${CSS}
body{background:#fff;color:#14171d}h1{font-size:2rem}h2{font-size:1.25rem;break-after:avoid}p,li{font-size:11pt}@page{margin:18mm}</style></head><body><div class="w">${guideBody(true)}</div></body></html>`);

// ---------- Privacidade ----------
w('privacidade/index.html', layout({
  title: 'Política de privacidade', desc: 'Como tratamos os seus dados neste site.', path: '/privacidade/', script: false,
  body: `<h1>Política de privacidade</h1>
<p>A calculadora funciona inteiramente no seu navegador: os valores que introduz não são enviados nem guardados.</p>
<p>Se subscrever o guia grátis, tratamos o seu email apenas para lhe enviar o guia e comunicações relacionadas com este site. Pode pedir a remoção a qualquer momento respondendo a um dos emails. O endereço é processado através do fornecedor de formulários indicado no momento da subscrição.</p>
${GC ? `<p>Para saber quantas pessoas visitam o site e de onde vêm, usamos o GoatCounter, um serviço de estatísticas que não usa cookies nem acompanha os visitantes entre sites. Segundo o fornecedor, não regista dados pessoais identificáveis. Os dados recolhidos são o endereço da página, a origem da visita, o tipo de navegador e o ecrã.</p><p>Este site não usa cookies de publicidade.</p>` : `<p>Este site não usa cookies nem estatísticas de visitas. Se vier a adicioná-las, esta página será atualizada antes.</p>`}
`
}));

// ---------- Estáticos ----------
w('style.css', CSS);
w('calc.js', JS);
w('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
const urls = ['/', '/guia/7-erros-preco-freelancer/', '/guia/como-calcular-preco-hora/', '/privacidade/', ...P.map(p => `/preco-hora/${p.slug}/`)];
w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${BASE}${u}</loc></url>`).join('')}</urlset>`);
w('404.html', layout({title: 'Página não encontrada', desc: 'Página não encontrada.', path: '/404.html', script: false, body: `<h1>Página não encontrada</h1><p><a href="${url('/')}">Voltar ao início</a></p>`}));
console.log('Páginas geradas:', urls.length + 1);
