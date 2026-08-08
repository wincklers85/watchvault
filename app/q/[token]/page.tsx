'use client';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {useEffect,useState} from 'react';
import {fetchWatchByQr} from '@/lib/watch-qr';
import {getSession} from '@/lib/supabase';
import {LockKeyhole,Watch} from 'lucide-react';

export default function WatchQrPage(){
  const {token}=useParams<{token:string}>();
  const [w,setW]=useState<any>(null);const[msg,setMsg]=useState('');const logged=!!getSession();
  useEffect(()=>{if(!token)return;fetchWatchByQr(token).then(setW).catch(e=>setMsg(e instanceof Error?e.message:'QR non valido'))},[token]);
  if(!w)return <main className="qr-public-page"><div className="qr-public-card"><div className="watch-id-brand">WATCH<span>VAULT</span></div><p>{msg||'Apertura passaporto digitale…'}</p></div></main>;
  const numbered=w.is_numbered&&w.edition_number?`${w.edition_number}${w.edition_total?` / ${w.edition_total}`:''}`:null;
  return <main className="qr-public-page"><article className="qr-public-card">
    <div className="watch-id-brand">WATCH<span>VAULT</span></div>
    {w.cover_image_url&&<img className="qr-public-photo" src={w.cover_image_url} alt={`${w.brand} ${w.model}`}/>}<div className="eyebrow">DIGITAL WATCH PASSPORT</div>
    <h1>{w.brand} {w.model}</h1><p className="muted">{w.reference||'Referenza non indicata'}{w.production_year?` · ${w.production_year}`:''}</p>
    <div className="spec-list"><p><span>Movimento</span><strong>{w.movement_type||w.movement||'—'}</strong></p><p><span>Calibro</span><strong>{w.caliber||'—'}</strong></p><p><span>Materiale</span><strong>{w.material||'—'}</strong></p><p><span>Diametro</span><strong>{w.diameter_mm?`${w.diameter_mm} mm`:'—'}</strong></p><p><span>Quadrante</span><strong>{w.dial_color||'—'}</strong></p><p><span>Impermeabilità</span><strong>{w.water_resistance_m?`${w.water_resistance_m} m`:'—'}</strong></p>{numbered&&<p><span>Numerazione</span><strong>{numbered}</strong></p>}{w.authenticated&&<><p><span>Seriale</span><strong>{w.serial_number||'—'}</strong></p><p><span>Corredo</span><strong>{[w.box_included?'Scatola':null,w.papers_included?'Documenti':null].filter(Boolean).join(' + ')||'—'}</strong></p><p><span>Valore stimato</span><strong>{w.estimated_value?`${Number(w.estimated_value).toLocaleString('it-IT')} ${w.currency||'EUR'}`:'—'}</strong></p></>}</div>
    {w.public_story&&<section className="qr-story"><h2>La storia di questo orologio</h2><p>{w.public_story}</p></section>}
    {!w.authenticated&&<div className="qr-member-gate"><LockKeyhole/><div><strong>Accedi a WatchVault per vedere la scheda completa</strong><p>Gli utenti registrati possono visualizzare seriale, corredo e altri dati estesi.</p></div><Link className="btn primary" href={`/login?next=${encodeURIComponent(`/q/${token}`)}`}>Accedi</Link></div>}
    {logged&&<Link className="btn" href="/dashboard"><Watch size={17}/> Apri WatchVault</Link>}
  </article></main>
}
