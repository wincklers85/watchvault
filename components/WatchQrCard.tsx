'use client';
import {QRCodeCanvas} from 'qrcode.react';
import {Printer,X} from 'lucide-react';

const esc=(v:unknown)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]||c));

export default function WatchQrCard({watch,onClose}:{watch:any;onClose?:()=>void}){
  const url=typeof window!=='undefined'?`${window.location.origin}/q/${watch.qr_token}`:`/q/${watch.qr_token}`;
  const numbering=watch.is_numbered&&watch.edition_number?`${watch.edition_number}${watch.edition_total?` / ${watch.edition_total}`:''}`:null;

  function printCard(){
    const canvas=document.querySelector<HTMLCanvasElement>('#watch-print-card canvas');
    if(!canvas)return;
    const qr=canvas.toDataURL('image/png');
    const popup=window.open('','_blank','width=900,height=1100');
    if(!popup)return;
    const title=`${watch.brand||''} ${watch.model||''}`.trim();
    popup.document.open();
    popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>WatchVault ID - ${esc(title)}</title><style>
      @page{size:A4 portrait;margin:0}
      *{box-sizing:border-box}
      html,body{margin:0;padding:0;width:210mm;height:297mm;font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff}
      body{-webkit-print-color-adjust:exact;print-color-adjust:exact;overflow:hidden}
      .sheet{width:210mm;height:297mm;padding:18mm 16mm 12mm;display:flex;flex-direction:column;align-items:center}
      .cut-label{width:178mm;height:104mm;border:1.2px dashed #555;padding:5mm;position:relative}
      .cut-hint{position:absolute;top:-4.2mm;left:7mm;background:#fff;padding:0 2mm;font-size:8pt;color:#666;letter-spacing:.06em;text-transform:uppercase}
      .card{width:100%;height:100%;border:1px solid #d6d6d6;border-radius:4mm;padding:9mm 10mm;display:grid;grid-template-columns:1fr 51mm;gap:9mm;align-items:center;background:#fff}
      .brand{font-size:16pt;font-weight:900;letter-spacing:.14em;margin-bottom:8mm}.brand span{color:#a77a2d}
      .eyebrow{font-size:8pt;font-weight:800;letter-spacing:.12em;color:#777;margin-bottom:2mm}
      h1{font-size:20pt;line-height:1.08;margin:0 0 6mm;max-width:100mm}
      .data{font-size:10.5pt;line-height:1.6}.data b{display:inline-block;min-width:28mm}
      .qr{text-align:center}.qr img{width:48mm;height:48mm;display:block;margin:auto}.qr small{display:block;font-size:7.5pt;line-height:1.35;color:#666;margin-top:2mm;word-break:break-all}
      .instructions{width:178mm;margin-top:12mm;border-top:1px solid #ddd;padding-top:8mm}
      .instructions h2{font-size:15pt;margin:0 0 4mm}.instructions p{font-size:10pt;line-height:1.55;margin:0 0 3mm;color:#333}
      .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:5mm;margin-top:6mm}.step{border:1px solid #ddd;border-radius:3mm;padding:4mm;font-size:9pt;line-height:1.45}.n{font-weight:900;color:#a77a2d;display:block;margin-bottom:1.5mm}
      .footer{margin-top:auto;width:178mm;border-top:1px solid #eee;padding-top:4mm;display:flex;justify-content:space-between;font-size:8pt;color:#777}.motto{font-weight:800;letter-spacing:.08em;color:#333}
      @media screen{body{background:#ececec}.sheet{margin:auto;background:#fff;box-shadow:0 8px 32px rgba(0,0,0,.18)}}
    </style></head><body><main class="sheet">
      <section class="cut-label"><div class="cut-hint">Taglia lungo la linea tratteggiata</div><div class="card">
        <div><div class="brand">WATCH<span>VAULT</span></div><div class="eyebrow">DIGITAL WATCH PASSPORT</div><h1>${esc(title)}</h1><div class="data"><div><b>Referenza</b> ${esc(watch.reference||'—')}</div><div><b>Seriale</b> ${esc(watch.serial_number||'—')}</div>${numbering?`<div><b>Numerazione</b> ${esc(numbering)}</div>`:''}</div></div>
        <div class="qr"><img src="${qr}" alt="QR code"><small>${esc(url)}</small></div>
      </div></section>
      <section class="instructions"><h2>Come usare la WatchVault ID Card</h2><p>Questa etichetta identifica digitalmente il tuo orologio e collega l'esemplare al suo Watch Passport. Puoi conservarla nella scatola, nel raccoglitore della collezione o insieme ai documenti dell'orologio.</p><div class="steps"><div class="step"><span class="n">1 · TAGLIA</span>Ritaglia la card seguendo la linea tratteggiata esterna.</div><div class="step"><span class="n">2 · CONSERVA</span>Mettila nella scatola o insieme a garanzia e documenti dell'orologio.</div><div class="step"><span class="n">3 · SCANSIONA</span>Inquadra il QR con uno smartphone per aprire la scheda WatchVault associata.</div></div><p style="margin-top:6mm"><b>Privacy:</b> chi non ha effettuato l'accesso vede soltanto le informazioni pubbliche previste dalla scheda QR. Le informazioni private del proprietario restano protette.</p></section>
      <footer class="footer"><span>WatchVault ID · ${esc(title)}</span><span class="motto">WE COLLECT TIME.</span></footer>
    </main><script>window.addEventListener('load',()=>setTimeout(()=>window.print(),250));<\/script></body></html>`);
    popup.document.close();
  }

  return <div className="qr-modal modal-backdrop">
    <div className="qr-panel">
      <div className="qr-panel-head no-print"><div><div className="eyebrow">WATCHVAULT ID</div><h2>QR code dell’orologio</h2></div>{onClose&&<button className="icon-btn" onClick={onClose}><X/></button>}</div>
      <div className="watch-id-card" id="watch-print-card">
        <div className="watch-id-brand">WATCH<span>VAULT</span></div>
        <div className="watch-id-content">
          <div className="watch-id-copy">
            <div className="eyebrow">DIGITAL WATCH PASSPORT</div>
            <h1>{watch.brand} {watch.model}</h1>
            <p><b>Referenza:</b> {watch.reference||'—'}</p>
            <p><b>Seriale:</b> {watch.serial_number||'—'}</p>
            {numbering&&<p><b>Numerazione:</b> {numbering}</p>}
            <small>Scansiona il QR per aprire la scheda WatchVault.</small>
          </div>
          <div className="watch-id-qr"><QRCodeCanvas value={url} size={190} level="H" includeMargin/></div>
        </div>
      </div>
      <div className="qr-actions no-print"><button className="btn primary" onClick={printCard}><Printer size={17}/> Stampa foglio A4</button><button className="btn" onClick={()=>navigator.clipboard?.writeText(url)}>Copia link</button></div>
    </div>
  </div>
}
