const $=id=>document.getElementById(id);
const eur=n=>isFinite(n)?n.toLocaleString('pt-PT',{style:'currency',currency:'EUR',maximumFractionDigits:0}):'—';
function calc(v){const t=1-v.tax/100;const y=v.cost*12+(t>0?v.net*12/t:Infinity);const h=(52-v.off)*v.hpw*v.bill/100;const r=h>0?y/h:Infinity;const n=v.net/160;return{y,h,r,d:r*8,m:y/12,p:r*v.proj*1.2,n,loss:y-n*h}}
function run(){const v={net:+$('net').value,cost:+$('cost').value,tax:+$('tax').value,hpw:+$('hpw').value,bill:+$('bill').value,off:+$('off').value,proj:+$('proj').value};const r=calc(v);
$('hour').textContent=eur(r.r)+' /h';$('day').textContent=eur(r.d);$('mrev').textContent=eur(r.m);$('yrev').textContent=eur(r.y);
$('bh').textContent=isFinite(r.h)?Math.round(r.h).toLocaleString('pt-PT'):'—';$('pp').textContent=eur(r.p);$('naive').textContent=eur(r.n)+' /h';$('loss').textContent=eur(r.loss)}
document.querySelectorAll('.calc input').forEach(i=>i.addEventListener('input',run));run();