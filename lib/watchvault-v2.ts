'use client';

const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
const SESSION='watchvault-session-v2';
function session(){if(typeof window==='undefined')return null;try{return JSON.parse(localStorage.getItem(SESSION)||'null')}catch{return null}}
function headers(token?:string,json=true){const h:Record<string,string>={apikey:key||''};if(json)h['Content-Type']='application/json';if(token)h.Authorization=`Bearer ${token}`;return h}
async function rest(path:string,init:RequestInit={},anon=false){if(!base||!key)throw new Error('Configurazione Supabase incompleta');const s=session();if(!s&&!anon)throw new Error('Sessione scaduta. Accedi di nuovo.');const r=await fetch(`${base}/rest/v1/${path}`,{...init,headers:{...headers(s?.access_token),...(init.headers||{})}});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.message||d.details||d.error_description||'Operazione non riuscita')}return r}

export async function changePassword(password:string){const s=session();if(!s||!base)throw new Error('Accedi di nuovo.');const r=await fetch(`${base}/auth/v1/user`,{method:'PUT',headers:headers(s.access_token),body:JSON.stringify({password})});if(!r.ok){const d=await r.json().catch(()=>({}));throw new Error(d.msg||d.message||'Cambio password non riuscito')}return true}

export async function compressImage(file:File,max=1600,quality=.78):Promise<File>{if(!file.type.startsWith('image/'))throw new Error('File immagine non valido');const bitmap=await createImageBitmap(file);const scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));const w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale));const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Compressione immagine non disponibile');ctx.drawImage(bitmap,0,0,w,h);const blob=await new Promise<Blob|null>(res=>canvas.toBlob(res,'image/webp',quality));bitmap.close();if(!blob)throw new Error('Compressione immagine non riuscita');return new File([blob],`${file.name.replace(/\.[^.]+$/,'')}.webp`,{type:'image/webp'})}

async function uploadImage(file:File,userId:string){const s=session();if(!s||!base)throw new Error('Accedi di nuovo.');const compressed=await compressImage(file);const path=`${userId}/${crypto.randomUUID()}.webp`;const r=await fetch(`${base}/storage/v1/object/watches/${path}`,{method:'POST',headers:{apikey:key||'',Authorization:`Bearer ${s.access_token}`,'Content-Type':'image/webp','x-upsert':'false'},body:compressed});if(!r.ok)throw new Error('Upload fotografia non riuscito');return {path,url:`${base}/storage/v1/object/public/watches/${path}`}}

export async function addWatchImages(watchId:string,files:File[]){const s=session();if(!s)return[];const uploaded=[] as {path:string,url:string}[];for(const f of files.slice(0,12))uploaded.push(await uploadImage(f,s.user.id));if(uploaded.length){await rest('watch_images',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify(uploaded.map((x,i)=>({watch_id:watchId,owner_id:s.user.id,storage_path:x.path,sort_order:i,is_cover:i===0})))});await rest(`watches?id=eq.${watchId}`,{method:'PATCH',body:JSON.stringify({cover_image_url:uploaded[0].url})});}return uploaded}

export async function fetchWatchDetails(id:string){const [wr,ir,sr,rr]=await Promise.all([
 rest(`watches?id=eq.${id}&select=*&limit=1`),
 rest(`watch_images?watch_id=eq.${id}&select=*&order=sort_order.asc`),
 rest(`watch_service_history?watch_id=eq.${id}&select=*&order=service_date.desc`),
 rest(`watch_reminders?watch_id=eq.${id}&select=*&order=due_date.asc`)
]);const w=(await wr.json())[0];if(!w)throw new Error('Orologio non trovato');const images=await ir.json();return {watch:w,images,services:await sr.json(),reminders:await rr.json()}}

export async function updateWatchAdvanced(id:string,input:Record<string,unknown>){const r=await rest(`watches?id=eq.${id}`,{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify(input)});return (await r.json())[0]}
export async function deleteWatchImage(id:string){await rest(`watch_images?id=eq.${id}`,{method:'DELETE'})}

export async function fetchBrandModelSuggestions(q=''){const term=q.trim()?`&or=(brand.ilike.*${encodeURIComponent(q)}*,model.ilike.*${encodeURIComponent(q)}*)`:'';const r=await rest(`watches?select=brand,model,reference&order=brand.asc&limit=500${term}`);const rows=await r.json();return {brands:[...new Set(rows.map((x:any)=>x.brand).filter(Boolean))].sort(),models:rows}}

export async function createReminder(input:{watch_id:string;type:string;title:string;due_date:string;recurrence_months?:number;notes?:string}){const s=session();if(!s)throw new Error('Accedi di nuovo.');const r=await rest('watch_reminders',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({owner_id:s.user.id,watch_id:input.watch_id,reminder_type:input.type,title:input.title,due_date:input.due_date,recurrence_months:input.recurrence_months||null,notes:input.notes||null,status:'pending'})});return (await r.json())[0]}
export async function fetchCalendarReminders(){const s=session();if(!s)return[];const r=await rest(`watch_reminders?owner_id=eq.${s.user.id}&status=eq.pending&select=*,watches(brand,model)&order=due_date.asc`);return r.json()}

export async function publishWatchListing(watch:any,input:{price:number;description:string;condition:string;location:string;shipping:boolean}){const s=session();if(!s)throw new Error('Accedi di nuovo.');const r=await rest('marketplace_listings',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({seller_id:s.user.id,watch_id:watch.id,title:`${watch.brand} ${watch.model}`,description:input.description,price:input.price,currency:'EUR',condition:input.condition,location:input.location,shipping_available:input.shipping,status:'published',box_included:!!watch.box_included,papers_included:!!watch.papers_included})});return (await r.json())[0]}

export async function sendMarketplaceOffer(listing:any,amount?:number,message?:string){const s=session();if(!s)throw new Error('Accedi per contattare il venditore');if(listing.seller_id===s.user.id)throw new Error('Questo annuncio è tuo');const r=await rest('marketplace_offers',{method:'POST',headers:{Prefer:'return=representation'},body:JSON.stringify({listing_id:listing.id,buyer_id:s.user.id,seller_id:listing.seller_id,amount:amount||null,currency:'EUR',message:message||'Sono interessato a questo orologio.'})});return (await r.json())[0]}
