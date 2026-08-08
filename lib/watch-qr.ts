'use client';
import {getSession} from './supabase';

const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;

export async function fetchWatchByQr(token:string){
  if(!base||!key) throw new Error('Configurazione Supabase incompleta');
  const s=getSession();
  const headers:Record<string,string>={'Content-Type':'application/json',apikey:key};
  if(s?.access_token) headers.Authorization=`Bearer ${s.access_token}`;
  const r=await fetch(`${base}/rest/v1/rpc/get_watch_by_qr`,{method:'POST',headers,body:JSON.stringify({p_token:token})});
  if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.details||'QR code non valido')}
  const data=await r.json();
  if(!data) throw new Error('Orologio non trovato');
  return data;
}

export function watchQrUrl(token:string){
  if(typeof window!=='undefined') return `${window.location.origin}/q/${token}`;
  return `/q/${token}`;
}
