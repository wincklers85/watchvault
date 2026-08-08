import {NextRequest,NextResponse} from 'next/server';

export const runtime='nodejs';

type Source={title:string;url:string;source_type:string;language:string;extract?:string};
const clean=(s:string)=>s.replace(/\s+/g,' ').trim();
const sentences=(s:string)=>clean(s).split(/(?<=[.!?])\s+/).filter(Boolean);

async function verifyAdmin(req:NextRequest){
 const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.SUPABASE_URL)?.replace(/\/$/,'');
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_PUBLISHABLE_KEY;
 const auth=req.headers.get('authorization');
 if(!base||!key||!auth)return false;
 const userRes=await fetch(`${base}/auth/v1/user`,{headers:{apikey:key,Authorization:auth}});
 if(!userRes.ok)return false;
 const user=await userRes.json();
 const p=await fetch(`${base}/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`,{headers:{apikey:key,Authorization:auth}});
 if(!p.ok)return false;
 const rows=await p.json();
 return ['admin','superuser'].includes(rows?.[0]?.role);
}

async function wikiSearch(lang:string,query:string):Promise<Source|null>{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),9000);
 try{
  const api=`https://${lang}.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrlimit=1&prop=extracts|info&exintro=1&explaintext=1&inprop=url&format=json&origin=*`;
  const r=await fetch(api,{signal:controller.signal,headers:{'User-Agent':'WatchVault/1.0 catalog-research'}});
  if(!r.ok)return null;const d=await r.json();const page=Object.values(d?.query?.pages||{})[0] as any;
  if(!page?.extract||!page?.fullurl)return null;
  return {title:page.title,url:page.fullurl,source_type:'wikipedia',language:lang,extract:clean(page.extract)};
 }catch{return null}finally{clearTimeout(timer)}
}

async function wikidataSearch(query:string):Promise<Source|null>{
 try{
  const u=`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=1&origin=*`;
  const r=await fetch(u,{headers:{'User-Agent':'WatchVault/1.0 catalog-research'}});if(!r.ok)return null;const d=await r.json();const x=d?.search?.[0];
  if(!x?.id)return null;return {title:`Wikidata · ${x.label||query}`,url:`https://www.wikidata.org/wiki/${x.id}`,source_type:'wikidata',language:'en',extract:clean([x.label,x.description].filter(Boolean).join('. '))};
 }catch{return null}
}

export async function POST(req:NextRequest){
 try{
  if(!await verifyAdmin(req))return NextResponse.json({error:'Area riservata ad Administrator e Superuser.'},{status:403});
  const {brand,model,reference}=await req.json();if(!brand||!model)return NextResponse.json({error:'Marca e modello sono obbligatori.'},{status:400});
  const queries=[`${brand} ${model} ${reference||''} watch`.trim(),`${brand} ${model} ${reference||''}`.trim()];
  const [it,en,wd]=await Promise.all([wikiSearch('it',queries[1]),wikiSearch('en',queries[0]),wikidataSearch(queries[1])]);
  const sources=[it,en,wd].filter(Boolean) as Source[];
  if(!sources.length)return NextResponse.json({error:'Non ho trovato fonti pubbliche sufficienti. La scheda resta modificabile manualmente.'},{status:404});
  const extracts=sources.map(x=>x.extract||'').filter(Boolean);
  const all=sentences(extracts.join(' '));
  const description=all.slice(0,3).join(' ').slice(0,1100);
  const history=all.slice(3,10).join(' ').slice(0,2600)||description;
  const uniqueWords=/(first|prima|primo|unique|unico|innov|patent|space|spazio|tuning fork|diapason|chronograph|tourbillon|diver|subacque|military|militare|limited|limitata|record|heritage|stor)/i;
  const unique=all.filter(x=>uniqueWords.test(x)).slice(0,4).join(' ').slice(0,1400);
  return NextResponse.json({
   result:{description,history,uniqueness:unique||'Da verificare: la ricerca automatica non ha individuato con sufficiente certezza un elemento distintivo specifico.',sources:sources.map(({extract,...s})=>s),researchNote:'Bozza generata automaticamente da fonti Wikimedia pubbliche. Verificare dati, referenza e contesto prima della pubblicazione.'}
  });
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Ricerca automatica non riuscita.'},{status:500})}
}
