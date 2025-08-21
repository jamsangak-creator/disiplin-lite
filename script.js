
// ====== KONFIG ======
const API_URL = "https://script.google.com/macros/s/AKfycbyqfVwMo_F-qYRtHysAcysXyFEbQQi43kwAW4gH2xsymQAip8Un7ridmHbNg4iSXarCBQ/exec";

// ====== UTIL ======
const $ = (sel) => document.querySelector(sel);
function todayStr(){
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString().slice(0,10);
}
function debounce(fn, delay=250){
  let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); };
}

// ====== STATE ======
let lastSuggestions = [];

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  $("#tarikh").value = todayStr();

  // Load simpanan tempatan (kelas & pengguna)
  $("#kelas").value = localStorage.getItem("kelas") || "";
  $("#pengguna").value = localStorage.getItem("pengguna") || "";

  $("#kelas").addEventListener("input", ()=>{
    localStorage.setItem("kelas", $("#kelas").value.trim());
    hideSuggestions();
  });
  $("#pengguna").addEventListener("input", ()=>{
    localStorage.setItem("pengguna", $("#pengguna").value.trim());
  });

  // Autocomplete
  $("#murid").addEventListener("input", debounce(handleSearch, 200));
  $("#murid").addEventListener("focus", ()=>{
    if ($("#murid").value.length>=2) handleSearch();
  });
  document.addEventListener("click", (e)=>{
    if (!e.target.closest(".relative")) hideSuggestions();
  });

  // Submit
  $("#rekodForm").addEventListener("submit", submitForm);
  $("#clearBtn").addEventListener("click", clearForm);
});

// ====== AUTOCOMPLETE ======
async function handleSearch(){
  const kelas = $("#kelas").value.trim();
  const q = $("#murid").value.trim();
  const help = $("#muridHelp");
  if (!kelas){
    help.textContent = "Isi medan Kelas dahulu.";
    help.classList.remove("hidden");
    hideSuggestions();
    return;
  }
  if (q.length < 2){
    help.textContent = "Taip sekurang-kurangnya 2 huruf.";
    help.classList.remove("hidden");
    hideSuggestions();
    return;
  }
  help.classList.add("hidden");

  try{
    const url = `${API_URL}?kelas=${encodeURIComponent(kelas)}&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {method:"GET"});
    const json = await res.json();
    if (!json.ok) throw new Error("Respon tidak ok");

    lastSuggestions = json.data || [];
    renderSuggestions(lastSuggestions);
  }catch(err){
    console.error(err);
    showMsg("❌ Gagal mendapatkan senarai murid. Semak URL API & akses (Anyone).");
  }
}

function renderSuggestions(list){
  const box = $("#suggestions");
  box.innerHTML = "";
  if (!list.length){ hideSuggestions(); return; }
  list.forEach((row)=>{
    const div = document.createElement("div");
    div.className = "sugg";
    div.textContent = `${row.nama} — ${row.kelas}`;
    div.addEventListener("click", ()=>{
      $("#murid").value = row.nama;
      hideSuggestions();
      $("#jenis").focus();
    });
    box.appendChild(div);
  });
  box.classList.remove("hidden");
}
function hideSuggestions(){ $("#suggestions").classList.add("hidden"); }

// ====== SUBMIT ======
async function submitForm(e){
  e.preventDefault();
  hideSuggestions();

  const payload = {
    tarikh: $("#tarikh").value,
    kelas: $("#kelas").value.trim(),
    murid: $("#murid").value.trim(),
    jenis: $("#jenis").value.trim(),
    catatan: $("#catatan").value.trim(),
    pengguna: $("#pengguna").value.trim()
  };

  if (!payload.kelas || !payload.murid || !payload.jenis){
    showMsg("Sila lengkapkan semua medan wajib.");
    return;
  }

  const btn = $("#submitBtn");
  btn.disabled = true; btn.textContent = "Menghantar...";

  try{
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (json.ok){
      showMsg("✅ Rekod berjaya disimpan!");
      // kosongkan beberapa medan untuk next input
      $("#murid").value = "";
      $("#jenis").value = "";
      $("#catatan").value = "";
      $("#murid").focus();
    }else{
      showMsg("❌ Gagal menyimpan rekod.");
    }
  }catch(err){
    console.error(err);
    showMsg("❌ Ralat rangkaian/API. Pastikan Web App 'Anyone' & URL betul.");
  }finally{
    btn.disabled = false; btn.textContent = "Hantar";
  }
}

function clearForm(){
  $("#murid").value = "";
  $("#jenis").value = "";
  $("#catatan").value = "";
  hideSuggestions();
  showMsg("");
}

function showMsg(t){ $("#msg").textContent = t; }
