Deno.serve(async(req:Request)=>{
const headers={"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","access-control-allow-methods":"GET, OPTIONS","access-control-allow-headers":"content-type","cache-control":"no-store","x-content-type-options":"nosniff"};
const send=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
if(req.method!=="GET")return send({error:"Method not allowed"},405);
const id=new URL(req.url).searchParams.get("id")||"";
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))return send({error:"Document not found"},404);
try{
const base=Deno.env.get("SUPABASE_URL")||"",key=Deno.env.get("SUPABASE_ANON_KEY")||"";
const response=await fetch(base+"/rest/v1/percept_public_verifications?verification_token=eq."+encodeURIComponent(id)+"&select=document_reference,document_type,title_public,issuer_public,issued_on,status&limit=1",{headers:{apikey:key,Authorization:"Bearer "+key},signal:AbortSignal.timeout(10000)});
if(!response.ok)throw Error("Lookup failed");
const rows=await response.json();if(!rows.length)return send({error:"Document not found"},404);
const r=rows[0],isTest=r.document_type==="Verification system test"||/^TEST ONLY/i.test(r.title_public||"");
return send({...r,status:isTest?"test":r.status,is_test:isTest,file_sha256:null,file_match:null,verification_scope:"Registry lookup only. Exact-file fingerprint comparison is not enabled. Not a digital signature.",checked_at:new Date().toISOString()});
}catch{return send({error:"Verification temporarily unavailable"},503);}
});
