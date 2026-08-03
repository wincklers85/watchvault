export const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const base=process.env.NEXT_PUBLIC_SUPABASE_URL; const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export async function signIn(email:string,password:string){
 const r=await fetch(`${base}/auth/v1/token?grant_type=password`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key!},body:JSON.stringify({email,password})});
 const data=await r.json(); if(!r.ok) throw new Error(data.msg||data.error_description||'Accesso non riuscito');
 localStorage.setItem('watchvault-session',JSON.stringify(data)); return data;
}
export async function signUp(email:string,password:string,username:string){
 const r=await fetch(`${base}/auth/v1/signup`,{method:'POST',headers:{'Content-Type':'application/json',apikey:key!},body:JSON.stringify({email,password,data:{username}})});
 const data=await r.json(); if(!r.ok) throw new Error(data.msg||data.error_description||'Registrazione non riuscita'); return data;
}
