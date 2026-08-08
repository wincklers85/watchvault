'use client';
import {QRCodeCanvas} from 'qrcode.react';
import {Printer,X} from 'lucide-react';

export default function WatchQrCard({watch,onClose}:{watch:any;onClose?:()=>void}){
  const url=typeof window!=='undefined'?`${window.location.origin}/q/${watch.qr_token}`:`/q/${watch.qr_token}`;
  const numbering=watch.is_numbered&&watch.edition_number?`${watch.edition_number}${watch.edition_total?` / ${watch.edition_total}`:''}`:null;
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
      <div className="qr-actions no-print"><button className="btn primary" onClick={()=>window.print()}><Printer size={17}/> Stampa QR card</button><button className="btn" onClick={()=>navigator.clipboard?.writeText(url)}>Copia link</button></div>
    </div>
  </div>
}
