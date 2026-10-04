const $=id=>document.getElementById(id);
const money=n=>isFinite(n)?n.toLocaleString('en-US',{style:'currency',currency:$('cur').value,maximumFractionDigits:0}):'—';
function calc(v){const t=1-v.tax/100;const y=v.cost*12+(t>0?v.net*12/t:Infinity);const h=(52-v.off)*v.hpw*v.bill/100;const r=h>0?y/h:Infinity;const n=v.net/160;return{y,h,r,d:r*8,m:y/12,p:r*v.proj*1.2,n,loss:y-n*h}}
function run(){const v={net:+$('net').value,cost:+$('cost').value,tax:+$('tax').value,hpw:+$('hpw').value,bill:+$('bill').value,off:+$('off').value,proj:+$('proj').value};const r=calc(v);
$('hour').textContent=money(r.r)+' /hr';$('day').textContent=money(r.d);$('mrev').textContent=money(r.m);$('yrev').textContent=money(r.y);
$('bh').textContent=isFinite(r.h)?Math.round(r.h).toLocaleString('en-US'):'—';$('pp').textContent=money(r.p);$('naive').textContent=money(r.n)+' /hr';$('loss').textContent=money(r.loss)}
document.querySelectorAll('.calc input,.calc select').forEach(i=>i.addEventListener('input',run));run();