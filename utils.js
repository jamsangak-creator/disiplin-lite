// Utiliti umum
export async function resizeImages(files, maxW=1280) {
  const results = [];
  for (const f of files) {
    if (!f.type.startsWith("image/")) continue;
    const dataUrl = await fileToDataURL(f);
    const resized = await resizeDataURL(dataUrl, maxW);
    results.push(resized);
  }
  return results;
}

function fileToDataURL(file){
  return new Promise((resolve,reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function loadImage(src){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.onload = ()=>resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function resizeDataURL(dataUrl, maxW){
  const img = await loadImage(dataUrl);
  const scale = Math.min(1, maxW / img.width);
  const w = Math.round(img.width * scale);
  const h = Math.round(img.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export function saveQueue(queue){
  localStorage.setItem("disiplin_queue", JSON.stringify(queue));
}
export function loadQueue(){
  try {
    return JSON.parse(localStorage.getItem("disiplin_queue")||"[]");
  } catch { return []; }
}

export function saveCache(name, data){
  localStorage.setItem(name, JSON.stringify({ts: Date.now(), data}));
}
export function loadCache(name){
  try {
    const o = JSON.parse(localStorage.getItem(name)||"null");
    return o;
  } catch { return null; }
}

export async function postJSON(url, payload){
  const res = await fetch(url, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("HTTP "+res.status);
  return res.json();
}
