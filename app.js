import { resizeImages, saveQueue, loadQueue, postJSON } from "./utils.js";

const form = document.getElementById("recordForm");
const dt = document.getElementById("dt");
const nama = document.getElementById("nama");
const kelas = document.getElementById("kelas");
const jenis = document.getElementById("jenis");
const catatan = document.getElementById("catatan");
const pelapor = document.getElementById("pelapor");
const gambar = document.getElementById("gambar");

const queueList = document.getElementById("queueList");
const queueCount = document.getElementById("queueCount");
const btnReset = document.getElementById("btnReset");
const btnSync = document.getElementById("btnSync");
const btnExport = document.getElementById("btnExport");
const btnClear = document.getElementById("btnClear");

const endpointLabel = document.getElementById("endpointLabel");
endpointLabel.textContent = CONFIG.APPS_SCRIPT_ENDPOINT || "(belum ditetapkan)";

// init datetime now
(function initNow(){
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  dt.value = local;
})();

let queue = loadQueue();
renderQueue();

form.addEventListener("submit", async (e)=>{
  e.preventDefault();
  const images = await resizeImages(gambar.files, CONFIG.MAX_PHOTO_WIDTH);
  const row = {
    dt: dt.value,
    nama: nama.value.trim(),
    kelas: kelas.value.trim(),
    jenis: jenis.value,
    catatan: catatan.value.trim(),
    pelapor: pelapor.value.trim(),
    images // array dataURL
  };
  if(!row.nama || !row.kelas || !row.jenis || !row.pelapor || !row.dt){
    alert("Sila lengkapkan semua medan wajib.");
    return;
  }
  queue.push(row);
  saveQueue(queue);
  renderQueue();
  form.reset();
  // reset datetime to now
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset()*60000).toISOString().slice(0,16);
  dt.value = local;
});

btnReset.addEventListener("click", ()=> form.reset());

btnExport.addEventListener("click", ()=>{
  const blob = new Blob([JSON.stringify(queue, null, 2)], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {href:url, download:"rekod_disiplin_queue.json"});
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1000);
});

btnClear.addEventListener("click", ()=>{
  if(confirm("Kosongkan semua rekod belum hantar?")) {
    queue = [];
    saveQueue(queue);
    renderQueue();
  }
});

btnSync.addEventListener("click", async ()=>{
  if(!CONFIG.APPS_SCRIPT_ENDPOINT){
    alert("Sila tetapkan APPS_SCRIPT_ENDPOINT dalam fail config.js terlebih dahulu.");
    return;
  }
  if(queue.length===0){ alert("Tiada rekod untuk dihantar."); return; }
  btnSync.disabled = true;
  btnSync.textContent = "Menghantar...";

  try{
    // Hantar batch dalam satu POST
    const payload = { action:"appendRows", rows: queue };
    const res = await postJSON(CONFIG.APPS_SCRIPT_ENDPOINT, payload);
    if(res && res.ok){
      alert("Berjaya dihantar ke Google Sheet.");
      queue = [];
      saveQueue(queue);
      renderQueue();
    }else{
      throw new Error(res?.error || "Gagal hantar.");
    }
  }catch(err){
    console.error(err);
    alert("Ralat semasa hantar: "+err.message);
  }finally{
    btnSync.disabled = false;
    btnSync.textContent = "Hantar & Sync ke Google Sheet";
  }
});

function renderQueue(){
  queueCount.textContent = String(queue.length);
  queueList.innerHTML = "";
  if(queue.length===0){
    queueList.innerHTML = '<p class="muted">Tiada rekod dalam senarai.</p>';
    return;
  }
  queue.forEach((r, idx)=>{
    const div = document.createElement("div");
    div.className = "item";
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = `${r.nama} • ${r.kelas} • ${r.jenis}`;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = `${new Date(r.dt).toLocaleString()} • Pelapor: ${r.pelapor}`;
    const note = document.createElement("div");
    note.textContent = r.catatan || "(tiada catatan)";
    const pics = document.createElement("div");
    pics.style.display = "flex"; pics.style.gap = "6px"; pics.style.flexWrap = "wrap";
    (r.images||[]).forEach(src=>{
      const im = new Image();
      im.src = src; im.style.height = "60px"; im.style.borderRadius = "8px";
      pics.appendChild(im);
    });
    const row = document.createElement("div");
    row.style.display = "flex"; row.style.gap = "8px"; row.style.marginTop = "8px";
    const btnDel = document.createElement("button");
    btnDel.textContent = "Padam"; btnDel.className = "btn ghost";
    btnDel.onclick = ()=>{ queue.splice(idx,1); saveQueue(queue); renderQueue(); };
    row.appendChild(btnDel);

    div.append(title, meta, note, pics, row);
    queueList.appendChild(div);
  });
}
