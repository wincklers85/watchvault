'use client';
import {getSession} from './supabase';
const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
function headers(token?:string){return {'Content-Type':'application/json',apikey:key||'',...(token?{Authorization:`Bearer ${token}`}:{})}}
async function rest(path:string,init:RequestInit={},anon=false){if(!base||!key)throw new Error('Configurazione Supabase incompleta');const s=getSession();if(!s&&!anon)throw new Error('Sessione scaduta. Accedi di nuovo.');const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...headers(s?.access_token),...(init.headers||{})}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.details||'Operazione non riuscita')}return r}

export async function fetchKnowledgeArticles(q=''){
  const clean=q.replace(/[%_,()]/g,' ').trim();
  const filter=clean?`&or=(title.ilike.*${encodeURIComponent(clean)}*,problem.ilike.*${encodeURIComponent(clean)}*,solution.ilike.*${encodeURIComponent(clean)}*,brand.ilike.*${encodeURIComponent(clean)}*,model.ilike.*${encodeURIComponent(clean)}*)`:'';
  const r=await rest(`knowledge_articles?status=eq.published&select=id,author_id,brand,model,title,problem,solution,difficulty,verified,created_at,profiles!knowledge_articles_author_id_fkey(username,full_name,avatar_url)&order=verified.desc,created_at.desc${filter}`,{},true);
  const rows:any[]=await r.json();
  for(const row of rows){const vr=await rest(`knowledge_votes?article_id=eq.${row.id}&helpful=eq.true&select=user_id`,{},true);row.helpful_count=(await vr.json()).length}
  return rows;
}
export async function createKnowledgeArticle(input:{brand?:string;model?:string;title:string;problem?:string;solution:string;difficulty:string}){const s=getSession();if(!s)throw new Error('Accedi di nuovo.');const r=await rest('knowledge_articles',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({...input,brand:input.brand||null,model:input.model||null,problem:input.problem||null,author_id:s.user.id,status:'published'})});return (await r.json())[0]}
export async function voteKnowledgeArticle(articleId:string){const s=getSession();if(!s)throw new Error('Accedi per votare');const q=await rest(`knowledge_votes?article_id=eq.${articleId}&user_id=eq.${s.user.id}&select=article_id`);const has=(await q.json()).length>0;if(has)await rest(`knowledge_votes?article_id=eq.${articleId}&user_id=eq.${s.user.id}`,{method:'DELETE'});else await rest('knowledge_votes',{method:'POST',body:JSON.stringify({article_id:articleId,user_id:s.user.id,helpful:true})});return !has}
export async function fetchKnowledgeComments(articleId:string){const r=await rest(`knowledge_comments?article_id=eq.${articleId}&select=id,body,created_at,author_id,profiles!knowledge_comments_author_id_fkey(username,full_name,avatar_url)&order=created_at.asc`,{},true);return r.json()}
export async function addKnowledgeComment(articleId:string,body:string){const s=getSession();if(!s)throw new Error('Accedi per partecipare');await rest('knowledge_comments',{method:'POST',body:JSON.stringify({article_id:articleId,author_id:s.user.id,body})})}
export async function fetchCareRules(){const r=await rest('watch_care_rules?select=*&order=priority.asc',{},true);return r.json()}
export function careRulesForWatch(w:any,rules:any[]){const movement=String(w.movement||'').toLowerCase();return rules.filter(r=>!r.movement_type||movement.includes(String(r.movement_type).toLowerCase())).slice(0,4)}
