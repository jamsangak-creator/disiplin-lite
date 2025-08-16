const KEY = 'dl_records_v1';
function nowDate(){const d=new Date();return d.toISOString().slice(0,10);}
function nowTime(){const d=new Date();return d.toTimeString().slice(0,5);}
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'[]');}catch{return [];}}
function save(list){localStorage.setItem(KEY, JSON.stringify(list));}
function addRecord(rec){const list=load(); list.push(rec); save(list);}
function byId(id){return document.getElementById(id);}
function render(filter=''){const list=load(); const tbody=document.querySelector('#table tbody'); tbody.innerHTML='';
 const q=filter.toLowerCase().trim(); const counts={}; for(const r of list){const k=(r.nama||'').toLowerCase().trim(); counts[k]=(counts[k]||0)+1;}
 let rows=0; for(const [i,r] of list.entries()){const text=[r.nama,r.kelas,r.jenis,r.catatan,r.tarikh,r.masa].join(' ').toLowerCase(); if(q && !text.includes(q)) continue; rows++;
  const tr=document.createElement('tr'); const count=counts[(r.nama||'').toLowerCase().trim()]||0;
  tr.innerHTML=`<td>${r.tarikh}</td><td>${r.masa}</td><td>${r.nama}</td><td>${r.kelas}</td><td>${r.jenis}</td><td>${r.catatan||''}</td>
  <td>${count>=3?'<span class="badge">≥3 amaran</span>':count}</td>
  <td class="row-actions"><button data-act="del" data-i="${i}">Buang</button></td>`; tbody.appendChild(tr);} 
 byId('stats').textContent=`${list.length} rekod disimpan. ${rows!==list.length?rows+' dipaparkan oleh carian.':''}`;
 const watch=Object.entries(counts).filter(([k,v])=>v>=3).sort((a,b)=>b[1]-a[1]);
 const ul=byId('watchlist'); ul.innerHTML=watch.length?'':'<li><small class="mute">Tiada pelajar dalam senarai perhatian.</small></li>';
 for(const [name,cnt] of watch){const li=document.createElement('li'); li.textContent=name.toUpperCase()+' — '+cnt+' amaran'; ul.appendChild(li);}}
function toCSV(){const list=load(); const headers=['tarikh','masa','nama','kelas','jenis','catatan']; const lines=[headers.join(',')];
 for(const r of list){const row=headers.map(h=>`${(r[h]||'').toString().replaceAll('"','""')}`); lines.push(row.map(x=>/[",\n]/.test(x)?'"'+x+'"':x).join(','));}
 return lines.join('\n');}
function fromCSV(text){const [headerLine,...rows]=text.split(/\r?\n/).filter(Boolean); const headers=headerLine.split(','); const idx=Object.fromEntries(headers.map((h,i)=>[h.trim(),i]));
 const list=load(); for(const line of rows){const cols=line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map(s=>s.replace(/^"|"$/g,'').replace(/""/g,'"'));
  const rec={tarikh:cols[idx.tarikh]||nowDate(), masa:cols[idx.masa]||'', nama:cols[idx.nama]||'', kelas:cols[idx.kelas]||'', jenis:cols[idx.jenis]||'', catatan:cols[idx.catatan]||''};
  if(rec.nama) list.push(rec);} save(list);}
document.addEventListener('DOMContentLoaded',()=>{
 byId('tarikh').value=nowDate(); byId('masa').value=nowTime();
 byId('reportForm').addEventListener('submit',(e)=>{e.preventDefault(); const rec={tarikh:byId('tarikh').value||nowDate(), masa:byId('masa').value||'', nama:byId('nama').value.trim(), kelas:byId('kelas').value.trim(), jenis:byId('jenis').value, catatan:byId('catatan').value.trim()};
  if(!rec.nama||!rec.kelas||!rec.jenis){alert('Sila lengkapkan Nama, Kelas dan Jenis Kesalahan.'); return;}
  addRecord(rec); e.target.reset(); byId('tarikh').value=nowDate(); byId('masa').value=nowTime(); render(byId('search').value);});
 byId('resetBtn').addEventListener('click',()=>{byId('reportForm').reset(); byId('tarikh').value=nowDate(); byId('masa').value=nowTime();});
 byId('search').addEventListener('input',(e)=>render(e.target.value));
 document.querySelector('#table tbody').addEventListener('click',(e)=>{const btn=e.target.closest('button[data-act="del"]'); if(!btn) return; const i=+btn.dataset.i; const list=load(); if(!Number.isInteger(i)||!list[i]) return; if(confirm('Padam rekod ini?')){list.splice(i,1); save(list); render(byId('search').value);}});
 byId('exportBtn').addEventListener('click',()=>{const blob=new Blob([toCSV()],{type:'text/csv'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='disiplin-lite.csv'; a.click(); URL.revokeObjectURL(a.href);});
 byId('importFile').addEventListener('change',(e)=>{const f=e.target.files[0]; if(!f) return; const reader=new FileReader(); reader.onload=()=>{fromCSV(reader.result); render(byId('search').value); alert('Import selesai.'); e.target.value='';}; reader.readAsText(f);});
 byId('clearBtn').addEventListener('click',()=>{if(confirm('Padam semua rekod pada peranti ini?')){localStorage.removeItem(KEY); render();}});
 if('serviceWorker' in navigator){navigator.serviceWorker.register('service-worker.js');}
 render();
});