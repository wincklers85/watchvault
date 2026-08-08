'use client';
import {getSession} from './supabase';
const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
function headers(token?:string){return {'Content-Type':'application/json',apikey:key||'',...(token?{Authorization:`Bearer ${token}`}:{})}}
async function rest(path:string,init:RequestInit={}){const s=getSession();if(!s||!base||!key)throw new Error('Sessione scaduta.');const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...headers(s.access_token),...(init.headers||{})}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.details||'Operazione non riuscita')}return r}
export async function fetchPassport(watchId:string){const r=await rest(`watch_passport_events?watch_id=eq.${watchId}&select=*&order=event_date.desc,created_at.desc`);return r.json()}
export async function addPassportEvent(watchId:string,input:{event_type:string;title:string;description?:string;event_date:string;amount?:number;is_public:boolean}){const s=getSession();if(!s)throw new Error('Accedi di nuovo.');const r=await rest('watch_passport_events',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({watch_id:watchId,owner_id:s.user.id,...input})});return (await r.json())[0]}
export async function requestWatchTransfer(watchId:string,toUserId:string,message?:string){const s=getSession();if(!s)throw new Error('Accedi di nuovo.');await rest('watch_transfers',{method:'POST',body:JSON.stringify({watch_id:watchId,from_user_id:s.user.id,to_user_id:toUserId,message:message||null,status:'pending'})})}
export async function fetchTransfers(){const s=getSession();if(!s)return[];const r=await rest(`watch_transfers?or=(from_user_id.eq.${s.user.id},to_user_id.eq.${s.user.id})&select=*,watches(brand,model,reference)&order=created_at.desc`);return r.json()}
export async function acceptWatchTransfer(id:string){await rest('rpc/accept_watch_transfer',{method:'POST',body:JSON.stringify({p_transfer:id})})}
export async function rejectWatchTransfer(id:string){await rest(`watch_transfers?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({status:'rejected',responded_at:new Date().toISOString()})})}
