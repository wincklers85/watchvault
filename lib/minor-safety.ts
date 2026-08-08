'use client';
import {getSession} from './supabase';

const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
function headers(token?:string){return {'Content-Type':'application/json',apikey:key||'',...(token?{Authorization:`Bearer ${token}`}:{})}}
async function rest(path:string,init:RequestInit={}){const s=getSession();if(!s||!base||!key)throw new Error('Sessione scaduta. Accedi di nuovo.');const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...headers(s.access_token),...(init.headers||{})}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.details||d.hint||'Operazione non riuscita')}return r}
async function rpc(name:string,body:Record<string,unknown>){const r=await rest(`rpc/${name}`,{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(body)});const data=await r.json().catch(()=>null);return Array.isArray(data)?data[0]:data}

export type SafetyProfile={id:string;username:string;full_name:string|null;birth_date:string|null;gender:'male'|'female'|'prefer_not_say'|null;account_mode:'adult'|'minor_basic';profile_visibility:string};
export type GuardianLink={id:string;minor_id:string;guardian_id:string;status:'pending'|'accepted'|'declined'|'revoked';responsibility_accepted_at:string|null;created_at:string;updated_at:string};

export async function fetchMySafetyProfile():Promise<SafetyProfile>{const s=getSession();if(!s)throw new Error('Accedi di nuovo.');const r=await rest(`profiles?id=eq.${s.user.id}&select=id,username,full_name,birth_date,gender,account_mode,profile_visibility&limit=1`);const rows=await r.json();if(!rows[0])throw new Error('Profilo non trovato');return rows[0]}
export async function isMinorAccount(){return (await fetchMySafetyProfile()).account_mode==='minor_basic'}
export async function fetchGuardianLinks(){const s=getSession();if(!s)return{links:[],profiles:[]};const r=await rest(`minor_guardians?or=(minor_id.eq.${s.user.id},guardian_id.eq.${s.user.id})&select=*&order=created_at.desc`);const links:GuardianLink[]=await r.json();const ids=[...new Set(links.flatMap(x=>[x.minor_id,x.guardian_id]).filter(x=>x!==s.user.id))];let profiles:any[]=[];if(ids.length){const p=await rest(`profiles?id=in.(${ids.join(',')})&select=id,username,full_name,avatar_url,birth_date,account_mode`);profiles=await p.json()}return{links,profiles}}
export async function inviteGuardianByUsername(username:string){return rpc('invite_guardian_by_username',{p_username:username.trim()})}
export async function respondGuardianLink(id:string,accept:boolean){return rpc('respond_guardian_link',{p_link_id:id,p_accept:accept})}
export async function revokeGuardianLink(id:string){await rpc('revoke_guardian_link',{p_link_id:id});return true}
export async function fetchGuardianWatches(){const s=getSession();if(!s)return[];const {links,profiles}=await fetchGuardianLinks();const minorIds=links.filter(x=>x.guardian_id===s.user.id&&x.status==='accepted').map(x=>x.minor_id);if(!minorIds.length)return[];const r=await rest(`watches?owner_id=in.(${minorIds.join(',')})&select=id,owner_id,brand,model,reference,serial_number,cover_image_url,estimated_value,status&order=created_at.desc`);const watches=await r.json();const byId=new Map(profiles.map((p:any)=>[p.id,p]));return watches.map((w:any)=>({...w,minor_profile:byId.get(w.owner_id)}))}
