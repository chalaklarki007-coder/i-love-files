// I LOVE FILES - Full Working Script
const $ = id => document.getElementById(id);

function setLang(lang){
  const htmlTag = document.getElementById('htmlTag');
  if(lang==='ur'){
    htmlTag.dir='rtl';
    $('hero_title').innerText='Sab Tools Ek Jagah';
    $('hero_desc').innerText='PDF, Word, Excel, Image, ZIP - Sab kuch';
    $('btn_merge').innerText='PDF Joro';
    $('btn_convert').innerText='Badlo';
    $('btn_zip').innerText='ZIP Banao';
  } else {
    htmlTag.dir='ltr';
    $('hero_title').innerText='All Document Tools in One Place';
    $('hero_desc').innerText='PDF, Word, Excel, Image, ZIP - Sab kuch ek jagah';
    $('btn_merge').innerText='Merge PDF';
    $('btn_convert').innerText='Convert';
    $('btn_zip').innerText='Create ZIP';
  }
}

// --- PDF MERGE ---
async function mergePDF(){
  const files = $('pdfFiles').files;
  if(!files.length) return alert('PDF files select karo');
  const mergedPdf = await PDFLib.PDFDocument.create();
  for(let file of files){
    const bytes = await file.arrayBuffer();
    const pdf = await PDFLib.PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach(p=> mergedPdf.addPage(p));
  }
  const mergedBytes = await mergedPdf.save();
  downloadBlob(mergedBytes, 'merged.pdf', 'application/pdf');
}

// --- PDF SPLIT (first page as demo) ---
async function splitPDF(){
  const files = $('pdfFiles').files;
  if(!files.length) return alert('PDF select karo');
  const bytes = await files[0].arrayBuffer();
  const pdf = await PDFLib.PDFDocument.load(bytes);
  const newPdf = await PDFLib.PDFDocument.create();
  const [firstPage] = await newPdf.copyPages(pdf, [0]);
  newPdf.addPage(firstPage);
  const out = await newPdf.save();
  downloadBlob(out, 'split-page-1.pdf', 'application/pdf');
}

async function rotatePDF(){
  const files = $('pdfFiles').files;
  if(!files.length) return alert('PDF select karo');
  const bytes = await files[0].arrayBuffer();
  const pdf = await PDFLib.PDFDocument.load(bytes);
  pdf.getPages().forEach(p=> p.setRotation(PDFLib.degrees(90)));
  const out = await pdf.save();
  downloadBlob(out, 'rotated.pdf', 'application/pdf');
}

// --- IMAGE CONVERT ---
async function convertImage(){
  const file = $('imgFile').files[0];
  const format = $('imgFormat').value;
  if(!file) return alert('Image select karo');
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img,0,0);
  const mime = format==='png'?'image/png': format==='jpeg'?'image/jpeg':'image/webp';
  canvas.toBlob(blob=>{
    downloadBlob(blob, `converted.${format}`, mime);
  }, mime);
}

async function compressImage(){
  const file = $('imgFile').files[0];
  if(!file) return alert('Image select karo');
  const img = await loadImage(file);
  const maxW = 1024;
  let w = img.width, h = img.height;
  if(w>maxW){ h = h*(maxW/w); w=maxW; }
  const canvas = document.createElement('canvas');
  canvas.width=w; canvas.height=h;
  canvas.getContext('2d').drawImage(img,0,0,w,h);
  canvas.toBlob(blob=>{
    downloadBlob(blob, 'compressed.jpg', 'image/jpeg');
  }, 'image/jpeg', 0.6);
}

function loadImage(file){
  return new Promise(res=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const img = new Image();
      img.onload = ()=> res(img);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// --- ZIP ---
async function createZIP(){
  const files = $('zipFiles').files;
  if(!files.length) return alert('Files select karo ZIP ke liye');
  const zip = new JSZip();
  for(let f of files){
    zip.file(f.name, await f.arrayBuffer());
  }
  const content = await zip.generateAsync({type:'blob'});
  downloadBlob(content, 'archive.zip', 'application/zip');
}

async function extractZIP(){
  const file = $('unzipFile').files[0];
  if(!file) return alert('ZIP file select karo');
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const folder = Object.keys(zip.files);
  alert('ZIP me files hain: '+ folder.join(', ') + '\nYe browser me extract ka demo hai - files console me dekho');
  console.log(zip.files);
}

// --- EXCEL / WORD ---
async function excelToCSV(){
  const file = $('excelFile').files[0];
  if(!file) return alert('Excel file select karo');
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const csv = XLSX.utils.sheet_to_csv(sheet);
  downloadBlob(new Blob([csv], {type:'text/csv'}), file.name.replace(/\.xlsx?/,'.csv'), 'text/csv');
}

async function wordToPDF(){
  const file = $('excelFile').files[0];
  if(!file) return alert('Word/Text file select karo');
  const text = await file.text();
  const pdfDoc = await PDFLib.PDFDocument.create();
  const page = pdfDoc.addPage([600,800]);
  page.drawText(text.substring(0,3000), {x:20, y:700, size:12});
  const out = await pdfDoc.save();
  downloadBlob(out, 'text-to-pdf.pdf', 'application/pdf');
}

// --- QR ---
function makeQR(){
  const txt = $('qrText').value.trim();
  if(!txt) return alert('QR ke liye text likho');
  $('qrcode').innerHTML='';
  new QRCode($('qrcode'), {text: txt, width:128, height:128});
}

// --- Word Count ---
$('wordCountText')?.addEventListener('input', e=>{
  const t = e.target.value.trim();
  const words = t? t.split(/\s+/).length:0;
  $('countResult').innerText = `Words: ${words} | Characters: ${t.length}`;
});

// --- Helper Download ---
function downloadBlob(data, filename, mime){
  let blob = data instanceof Blob ? data : new Blob([data], {type:mime||'application/octet-stream'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
