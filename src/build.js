// RateRight static site generator.  Usage: node build.js   (output in ./dist)
// Optional env: BASE_URL, GC_CODE (GoatCounter), FORM_URL (email form action).
// Optional file monetize.json: { "shop": {"url","title","blurb","button"}, "affiliates": [{"name","url","blurb"}] }
const fs = require('fs'), path = require('path');
const P = require('./data.js'), G = require('./guia.js');

const BRAND = 'RateRight';
const BASE = process.env.BASE_URL || 'https://paxeko530.github.io/preco-hora';
const PFX = new URL(BASE).pathname.replace(/\/$/, '');
const GC = process.env.GC_CODE || '';
const FORM = process.env.FORM_URL || '';
const OUT = path.join(__dirname, 'dist');
let M = {};
try { M = JSON.parse(fs.readFileSync(path.join(__dirname, 'monetize.json'), 'utf8')); } catch (e) {}

const w = (f, c) => { const p = path.join(OUT, f); fs.mkdirSync(path.dirname(p), {recursive: true}); fs.writeFileSync(p, c); };
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const url = p => PFX + p;
const CSS = fs.readFileSync(path.join(__dirname, 'style.src.css'), 'utf8') + `
select{padding:10px 12px;border-radius:9px;border:1px solid var(--line);background:var(--bg);color:var(--tx);font-size:1rem;width:100%}`;

const JS = `const $=id=>document.getElementById(id);
const money=n=>isFinite(n)?n.toLocaleString('en-US',{style:'currency',currency:$('cur').value,maximumFractionDigits:0}):'—';
function calc(v){const t=1-v.tax/100;const y=v.cost*12+(t>0?v.net*12/t:Infinity);const h=(52-v.off)*v.hpw*v.bill/100;const r=h>0?y/h:Infinity;const n=v.net/160;return{y,h,r,d:r*8,m:y/12,p:r*v.proj*1.2,n,loss:y-n*h}}
function run(){const v={net:+$('net').value,cost:+$('cost').value,tax:+$('tax').value,hpw:+$('hpw').value,bill:+$('bill').value,off:+$('off').value,proj:+$('proj').value};const r=calc(v);
$('hour').textContent=money(r.r)+' /hr';$('day').textContent=money(r.d);$('mrev').textContent=money(r.m);$('yrev').textContent=money(r.y);
$('bh').textContent=isFinite(r.h)?Math.round(r.h).toLocaleString('en-US'):'—';$('pp').textContent=money(r.p);$('naive').textContent=money(r.n)+' /hr';$('loss').textContent=money(r.loss)}
document.querySelectorAll('.calc input,.calc select').forEach(i=>i.addEventListener('input',run));run();`;

function layout({title, desc, path: p, body, ld, script}) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${BASE}${p}"><link rel="stylesheet" href="${url('/style.css')}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="${BRAND}">
${ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : ''}</head>
<body><div class="w">
<nav><a class="logo" href="${url('/')}">${BRAND}</a><span class="links"><a href="${url('/guides/how-to-calculate-hourly-rate/')}">How it works</a><a href="${url('/guides/pricing-mistakes/')}">7 mistakes</a></span></nav>
${body}
<footer>This tool is for information only and is not tax, legal or financial advice. Starting values are illustrative and are not market rates. Some links may be affiliate links: if you buy through them we may earn a commission at no extra cost to you.
<br><a href="${url('/privacy/')}">Privacy</a></footer>
</div>${script === false ? '' : `<script src="${url('/calc.js')}"></script>`}${GC ? `<script data-goatcounter="https://${GC}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>` : ''}</body></html>`;
}

const calc = (d = {}) => `<section class="grid calc" aria-label="Calculator">
<div class="card">
<label for="cur">Currency</label><select id="cur"><option>USD</option><option>EUR</option><option>GBP</option></select>
<label for="net">Desired net income per month</label><input id="net" type="number" min="0" value="${d.net ?? 4000}">
<label for="cost">Fixed business costs per month</label><input id="cost" type="number" min="0" value="${d.cost ?? 500}">
<label for="tax">Taxes and contributions on profit (%)</label><input id="tax" type="number" min="0" max="80" value="30">
<label for="hpw">Working hours per week</label><input id="hpw" type="number" min="1" max="80" value="40">
<label for="bill">Billable share of those hours (%)</label><input id="bill" type="number" min="10" max="100" value="${d.bill ?? 60}">
<label for="off">Weeks off per year</label><input id="off" type="number" min="0" max="40" value="6">
<p class="note">Your tax rate depends on where you live and how you are registered. Check it with an accountant.</p></div>
<div class="card" aria-live="polite"><div class="note">Minimum hourly rate</div><div class="big" id="hour">—</div>
<div class="row"><span>Day rate (8 hours)</span><b id="day">—</b></div>
<div class="row"><span>Revenue needed per month</span><b id="mrev">—</b></div>
<div class="row"><span>Revenue needed per year</span><b id="yrev">—</b></div>
<div class="row"><span>Billable hours per year</span><b id="bh">—</b></div>
<label for="proj">Project estimate (hours)</label><input id="proj" type="number" min="1" value="20">
<div class="row"><span>Project price (+20% risk buffer)</span><b id="pp">—</b></div></div></section>
<section class="card" style="margin-bottom:16px"><strong>The most common mistake</strong><p style="margin:.4em 0 0">Dividing your desired income by 160 hours gives <b id="naive">—</b>. Charging that would leave you about <b id="loss">—</b> short every year.</p></section>`;

// ---- Monetization blocks (render only when configured in monetize.json / env) ----
const shopBlock = M.shop && M.shop.url ? `<section class="card cta"><h2 style="margin-top:0">${esc(M.shop.title || 'Run the rest of your freelance business')}</h2><p>${esc(M.shop.blurb || '')}</p><a class="btn" href="${esc(M.shop.url)}" rel="noopener">${esc(M.shop.button || 'Learn more')}</a></section>` : '';
const affBlock = (M.affiliates || []).length ? `<section><h2>Tools freelancers use</h2><div class="cards">${M.affiliates.map(a => `<a class="card" href="${esc(a.url)}" rel="sponsored noopener"><strong>${esc(a.name)}</strong><br><span class="note">${esc(a.blurb || '')}</span></a>`).join('')}</div><p class="note">Affiliate links: we may earn a commission if you sign up, at no extra cost to you.</p></section>` : '';
const mailBlock = FORM ? `<section class="card" style="margin-top:16px"><strong>Free guide: 7 mistakes that make freelancers undercharge</strong>
<form class="mail" method="post" action="${FORM}"><input type="email" name="email" placeholder="you@example.com" required aria-label="Email"><button class="btn" type="submit">Send me the guide</button></form>
<p class="note">No spam. By subscribing you accept the <a href="${url('/privacy/')}">privacy policy</a>.</p></section>` : '';
const cta = shopBlock + mailBlock + affBlock;

const faqBlock = faq => `<h2>Frequently asked questions</h2>${faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('')}`;
const faqLd = faq => ({'@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({'@type': 'Question', name: q, acceptedAnswer: {'@type': 'Answer', text: a}}))});

// ---------- Home ----------
const homeFaq = [['How do you calculate a freelancer\'s hourly rate?', 'Add your desired net income to your business costs, adjust for tax, then divide by the hours you can really bill in a year, after subtracting time off and non-billable work.'], ['Why not just divide my desired salary by 160 hours?', 'Because only part of your hours are billable: there are proposals, admin, learning and gaps between projects. Ignoring that makes you charge less than you need.']];
w('index.html', layout({
  title: `How much should a freelancer charge per hour? Free calculator | ${BRAND}`,
  desc: 'Work out the hourly and day rate you need to charge as a freelancer to reach your target net income. Free, no sign-up, takes 30 seconds.',
  path: '/', ld: faqLd(homeFaq),
  body: `<span class="pill" style="margin-top:20px">Free tool · no sign-up</span>
<h1>How much should you charge per hour as a freelancer?</h1>
<p class="sub">Most freelancers divide the income they want by 160 hours and undercharge. This calculator accounts for taxes, business costs, time off and the hours you cannot bill.</p>
${calc()}${cta}
<h2>Calculator by profession</h2><div class="cards">${P.map(p => `<a class="card" href="${url('/rates/' + p.slug + '/')}"><strong>${p.Name}</strong><br><span class="note">Starting values and tips for your field</span></a>`).join('')}</div>
<h2>How the calculation works</h2>
<p>Annual revenue = annual costs + annual net income ÷ (1 − tax rate). That figure is divided by your real billable hours: weeks worked × hours per week × billable share.</p>
<p>Want each step explained? Read the <a href="${url('/guides/how-to-calculate-hourly-rate/')}">full guide</a>.</p>
${faqBlock(homeFaq)}`
}));

// ---------- Professions ----------
for (const p of P) {
  const others = P.filter(o => o.slug !== p.slug).slice(0, 4);
  w(`rates/${p.slug}/index.html`, layout({
    title: `How much should a ${p.name} charge per hour? Calculator | ${BRAND}`,
    desc: `Work out the hourly and day rate for a ${p.name}, with typical costs for the profession, taxes and non-billable time.`,
    path: `/rates/${p.slug}/`, ld: faqLd(p.faq),
    body: `<div class="crumbs"><a href="${url('/')}">Home</a> › ${p.Name}</div>
<h1>How much should a ${p.name} charge per hour?</h1>
<p class="sub">A calculator with starting values for this profession. Adjust them to your situation: they are illustrative, not a price list.</p>
${calc(p)}
<h2>Typical costs for a ${p.name}</h2><ul class="l">${p.costs.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
<p class="note">Add up your real costs and enter the monthly total in the fixed costs field.</p>
<h2>Where billable time goes missing</h2><p>${esc(p.lost)}</p>
<h2>How to set your price</h2><p>${esc(p.unit)}</p>
<ul class="l">${p.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
${cta}${faqBlock(p.faq)}
<h2>Other professions</h2><div class="cards">${others.map(o => `<a class="card" href="${url('/rates/' + o.slug + '/')}">${o.Name}</a>`).join('')}</div>`
  }));
}

// ---------- Guides ----------
const guideBody = () => `<h1>${esc(G.title)}</h1><p class="sub">${esc(G.intro)}</p><p class="note">${esc(G.example)}</p>
${G.errors.map((e, i) => `<h2>${i + 1}. ${esc(e[0])}</h2><p>${esc(e[1])}</p><p>${esc(e[2])}</p><p><b>How to fix it:</b> ${esc(e[3])}</p>`).join('')}
<h2>Checklist</h2><ul class="l">${G.checklist.map(c => `<li>☐ ${esc(c)}</li>`).join('')}</ul><p>${esc(G.close)}</p>`;
w('guides/pricing-mistakes/index.html', layout({
  title: `${G.title} | ${BRAND}`, desc: 'The 7 most common freelance pricing mistakes, with worked examples and a checklist.',
  path: '/guides/pricing-mistakes/', script: false,
  body: `<div class="crumbs"><a href="${url('/')}">Home</a> › Guide</div>${guideBody()}${cta}`
}));
w('../guide-pdf.html', `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(G.title)}</title><style>${CSS}
body{background:#fff;color:#14171d}h1{font-size:2rem}h2{font-size:1.25rem;break-after:avoid}p,li{font-size:11pt}@page{margin:18mm}</style></head><body><div class="w">${guideBody()}</div></body></html>`);

const howFaq = [['What is a realistic billable percentage?', 'It depends on the profession and the stage of your business. Beginners tend to have lower figures because they spend more time finding clients. Measure yours for a month.'], ['Should VAT or sales tax be part of the calculation?', 'Usually not. It is collected from the client and passed on to the tax authority, so it is not your income. Work out your price without it and add it to the invoice. Confirm your case with an accountant.']];
w('guides/how-to-calculate-hourly-rate/index.html', layout({
  title: `How to calculate your freelance hourly rate, step by step | ${BRAND}`,
  desc: 'A 5-step guide to your freelance hourly rate: net income, costs, tax, billable hours and a risk buffer.',
  path: '/guides/how-to-calculate-hourly-rate/', ld: faqLd(howFaq),
  body: `<div class="crumbs"><a href="${url('/')}">Home</a> › Guide</div>
<h1>How to calculate your freelance hourly rate, step by step</h1>
<p class="sub">Five steps to a figure that covers your costs, your taxes and the income you want, without guessing.</p>
<h2>1. Set the net income you want</h2><p>This is what is left for you after tax and costs. Start from your monthly personal expenses and add a margin for savings.</p>
<h2>2. Add up your business costs</h2><p>Software, accountant, equipment, training, insurance, travel. Divide annual costs by 12 for a monthly figure.</p>
<h2>3. Account for taxes</h2><p>Taxes and contributions apply to your profit and depend on where you live and how you are registered. Use a prudent percentage and confirm it with an accountant. VAT or sales tax, if it applies, is not part of the calculation: it is collected from the client and passed on.</p>
<h2>4. Work out your truly billable hours</h2><p>Start with the weeks in the year, subtract vacations, holidays and sick days, multiply by weekly hours and apply your billable share. Proposals, admin and learning are not billable.</p>
<h2>5. Divide, then add a buffer</h2><p>Required revenue ÷ billable hours gives your minimum hourly rate. On fixed-price projects, add a risk buffer for short estimates.</p>
<p><a class="btn" href="${url('/')}">Open the calculator</a></p>
${cta}${faqBlock(howFaq)}`
}));

// ---------- Privacy ----------
w('privacy/index.html', layout({
  title: `Privacy policy | ${BRAND}`, desc: 'How we handle your data on this site.', path: '/privacy/', script: false,
  body: `<h1>Privacy policy</h1>
<p>The calculator runs entirely in your browser: the values you enter are not sent or stored anywhere.</p>
${FORM ? '<p>If you subscribe to the free guide, we use your email only to send you the guide and related messages about this site. You can ask for removal at any time by replying to one of the emails. Your address is processed by the form provider named at sign-up.</p>' : ''}
${GC ? '<p>To learn how many people visit and where they come from, we use GoatCounter, an analytics service that does not use cookies and does not track visitors across sites. According to the provider, it does not record personally identifiable data. The data collected is the page address, the referrer, the browser type and the screen size.</p><p>This site does not use advertising cookies.</p>' : '<p>This site does not use cookies or visitor analytics. If we add them, this page will be updated first.</p>'}
${(M.affiliates || []).length ? '<p>Some links on this site are affiliate links. If you sign up through them we may earn a commission at no extra cost to you.</p>' : ''}`
}));

// ---------- Static ----------
w('style.css', CSS);
w('calc.js', JS);
w('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
const urls = ['/', '/guides/how-to-calculate-hourly-rate/', '/guides/pricing-mistakes/', '/privacy/', ...P.map(p => `/rates/${p.slug}/`)];
w('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${BASE}${u}</loc></url>`).join('')}</urlset>`);
w('404.html', layout({title: `Page not found | ${BRAND}`, desc: 'Page not found.', path: '/404.html', script: false, body: `<h1>Page not found</h1><p><a href="${url('/')}">Back to home</a></p>`}));
console.log('Pages generated:', urls.length + 1);
