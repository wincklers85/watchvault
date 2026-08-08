'use client';
import {getSession} from './supabase';
const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
function headers(token?:string){return {'Content-Type':'application/json',apikey:key||'',...(token?{Authorization:`Bearer ${token}`}:{})}}
async function rest(path:string,init:RequestInit={}){const s=getSession();if(!s||!base||!key)throw new Error('Sessione scaduta. Accedi di nuovo.');const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...headers(s.access_token),...(init.headers||{})}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.details||'Operazione non riuscita')}return r}
export async function replyToComment(postId:string,parentId:string,body:string){const s=getSession();if(!s)throw new Error('Accedi di nuovo.');await rest('comments',{method:'POST',body:JSON.stringify({post_id:postId,parent_id:parentId,author_id:s.user.id,body})})}
export async function editComment(id:string,body:string){const t=new Date().toISOString();await rest(`comments?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({body,edited_at:t,updated_at:t})})}
export async function deleteComment(id:string){const t=new Date().toISOString();await rest(`comments?id=eq.${id}`,{method:'PATCH',body:JSON.stringify({body:'Commento eliminato',deleted_at:t,updated_at:t})})}
export function publicName(profile:any){const full=String(profile?.full_name||'').trim();if(!full)return profile?.username||'Utente';const parts=full.split(/\s+/);return parts.length>1?`${parts[0]} ${parts[parts.length-1][0].toUpperCase()}.`:parts[0]}
