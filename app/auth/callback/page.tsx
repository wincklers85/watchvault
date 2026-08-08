'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {completeOAuthFromHash} from '@/lib/supabase';
export default function OAuthCallback(){const r=useRouter();const[msg,setMsg]=useState('Completamento accesso…');useEffect(()=>{completeOAuthFromHash().then(()=>r.replace('/dashboard')).catch(e=>setMsg(e instanceof Error?e.message:'Accesso non riuscito'))},[r]);return <main className="form-wrap"><div className="eyebrow">WATCHVAULT</div><h1>Accesso sicuro</h1><p className="muted">{msg}</p></main>}
