/**
 * Google Apps Script endpoint untuk rekod disiplin.
 * Arahan:
 * 1. Buat Google Sheet kosong (nama bebas).
 * 2. Cipta Apps Script baharu (Extensions -> Apps Script).
 * 3. Tampal kod ini, setkan SHEET_ID dan NAMA_SHEET.
 * 4. Deploy sebagai Web App: Execute as Me, Access: Anyone.
 */

const SHEET_ID   = "TUKAR-KE-ID-SPREADSHEET-ANDA";
const NAMA_SHEET = "Rekod";

function doPost(e){
  try{
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    if(action === "appendRows"){
      return jsonOut(appendRows_(body.rows));
    }else if(action === "summary"){
      return jsonOut(getSummary_());
    }else{
      return jsonOut(null, "Aksi tidak dikenali.");
    }
  }catch(err){
    return jsonOut(null, err.message||String(err));
  }
}

function appendRows_(rows){
  if(!rows || !rows.length) return {ok:true, inserted:0};
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(NAMA_SHEET) || ss.insertSheet(NAMA_SHEET);

  // Pastikan header
  const header = ["Timestamp","TarikhMasa","Nama","Kelas","Jenis","Catatan","Pelapor","Gambar1","Gambar2","Gambar3","Gambar4","Gambar5"];
  if(sh.getLastRow() === 0){
    sh.appendRow(header);
  }

  const values = [];
  rows.forEach(r => {
    const imgs = (r.images||[]).slice(0,5); // maks 5 foto
    while(imgs.length < 5) imgs.push("");
    values.push([new Date(), r.dt, r.nama, r.kelas, r.jenis, r.catatan, r.pelapor, ...imgs]);
  });
  sh.getRange(sh.getLastRow()+1,1,values.length, header.length).setValues(values);
  return {ok:true, inserted: values.length};
}

function getSummary_(){
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sh = ss.getSheetByName(NAMA_SHEET);
  if(!sh || sh.getLastRow()<2) return {ok:true, data:[]};

  const data = sh.getRange(2,1, sh.getLastRow()-1, sh.getLastColumn()).getValues();
  // col mapping: 1:Timestamp, 2:TarikhMasa, 3:Nama, 4:Kelas, 5:Jenis, 6:Catatan, 7:Pelapor
  const map = new Map(); // key = nama|kelas
  data.forEach(row=>{
    const nama = String(row[2]||"").trim();
    const kelas = String(row[3]||"").trim();
    if(!nama || !kelas) return;
    const key = `${nama}|${kelas}`;
    map.set(key, (map.get(key)||0)+1);
  });
  const out = [...map.entries()].map(([key,count])=>{
    const [nama,kelas] = key.split("|");
    return {nama, kelas, kekerapan: count};
  }).sort((a,b)=> b.kekerapan - a.kekerapan || a.nama.localeCompare(b.nama));
  return {ok:true, data: out};
}

function jsonOut(data, error){
  const res = {ok:!error, data, error: error||null};
  return ContentService.createTextOutput(JSON.stringify(res))
    .setMimeType(ContentService.MimeType.JSON);
}
