import { loadCache, saveCache, postJSON } from "./utils.js";

const summaryHost = document.getElementById("summary");
const filterText = document.getElementById("filterText");
const btnReload = document.getElementById("btnReload");

async function loadSummary(){
  if(!CONFIG.APPS_SCRIPT_ENDPOINT){
    summaryHost.innerHTML = `<p class="muted">Sila tetapkan APPS_SCRIPT_ENDPOINT dalam config.js untuk memuatkan laporan.</p>`;
    return;
  }
  summaryHost.innerHTML = `<p>Memuatkan...</p>`;
  try{
    const payload = { action:"summary" };
    const res = await postJSON(CONFIG.APPS_SCRIPT_ENDPOINT, payload);
    if(!res || !res.ok) throw new Error(res?.error||"Ralat tidak diketahui");
    const rows = res.data || [];
    saveCache("summary_cache", rows);
    render(rows);
  }catch(err){
    console.error(err);
    const cache = loadCache("summary_cache");
    if(cache){
      render(cache.data);
      summaryHost.insertAdjacentHTML("beforeend",
        `<p class="muted">Memaparkan data cache (offline). ${new Date(cache.ts).toLocaleString()}</p>`);
    }else{
      summaryHost.innerHTML = `<p class="muted">Gagal memuatkan laporan dan tiada cache tersedia.</p>`;
    }
  }
}

function render(rows){
  const q = (filterText.value||"").toLowerCase();
  const filtered = rows.filter(r => {
    const s = `${r.nama} ${r.kelas}`.toLowerCase();
    return s.includes(q);
  });

  if(filtered.length===0){
    summaryHost.innerHTML = `<p class="muted">Tiada rekod ditemui.</p>`;
    return;
  }

  const html = [`<table><thead><tr>
    <th>#</th><th>Nama</th><th>Kelas</th><th>Kekerapan</th>
  </tr></thead><tbody>`];
  filtered.forEach((r,i)=>{
    html.push(`<tr><td>${i+1}</td><td>${escapeHtml(r.nama)}</td><td>${escapeHtml(r.kelas)}</td><td>${r.kekerapan}</td></tr>`);
  });
  html.push(`</tbody></table>`);
  summaryHost.innerHTML = html.join("");
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, m => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[m]));
}

btnReload.addEventListener("click", loadSummary);
filterText.addEventListener("input", ()=>{
  const cache = loadCache("summary_cache");
  if(cache){ // re-render locally for instant filtering
    const rows = cache.data||[];
    const q = filterText.value.toLowerCase();
    const filtered = rows.filter(r => (`${r.nama} ${r.kelas}`.toLowerCase().includes(q)));
    const html = [`<table><thead><tr>
      <th>#</th><th>Nama</th><th>Kelas</th><th>Kekerapan</th>
    </tr></thead><tbody>`];
    filtered.forEach((r,i)=>{
      html.push(`<tr><td>${i+1}</td><td>${escapeHtml(r.nama)}</td><td>${escapeHtml(r.kelas)}</td><td>${r.kekerapan}</td></tr>`);
    });
    html.push(`</tbody></table>`);
    summaryHost.innerHTML = html.join("");
  }
});

loadSummary();
