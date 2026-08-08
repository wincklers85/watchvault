'use client';
import {getSession} from './supabase';
const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
function headers(token?:string){return {'Content-Type':'application/json',apikey:key||'',...(token?{Authorization:`Bearer ${token}`}:{})}}
async function rest(path:string,init:RequestInit={}){const s=getSession();if(!s||!base||!key)throw new Error('Sessione scaduta.');const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...headers(s.access_token),...(init.headers||{})}});if(!r.ok)throw new Error('Operazione non riuscita');return r}
export async function fetchNotifications(){const s=getSession();if(!s)return[];const r=await rest(`notifications?user_id=eq.${s.user.id}&select=*&order=created_at.desc&limit=100`);return r.json()}
export async function markNotificationRead(id:string){await rest(`notifications?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({read_at:new Date().toISOString()})})}
export async function markAllNotificationsRead(){const s=getSession();if(!s)return;await rest(`notifications?user_id=eq.${s.user.id}&read_at=is.null`,{method:'PATCH',body:JSON.stringify({read_at:new Date().toISOString()})})}
