const headers={"content-type":"application/json; charset=utf-8","access-control-allow-origin":"*","access-control-allow-methods":"GET, OPTIONS","access-control-allow-headers":"content-type","cache-control":"no-store, max-age=0","x-content-type-options":"nosniff","referrer-policy":"no-referrer"};
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
Deno.serve(async(req:Request)=>{
 const send=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers});
 if(req.method!=='GET')return send({error:'Method not allowed'},405);
 const url=new URL(req.url),id=url.searchParams.get('id')||'',provided=url.searchParams.get('sha256');
 if(!uuid.test(id))return send({error:'Document not found'},404);
 if(provided!==null&&!/^[a-f0-9]{64}$/i.test(provided))return send({error:'Invalid SHA-256 fingerprint'},400);
 try{
  const base=Deno.env.get('SUPABASE_URL'),key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!base||!key)throw Error('Server configuration unavailable');
  const response=await fetch(base+'/rest/v1/percept_public_verifications?verification_token=eq.'+encodeURIComponent(id)+'&select=document_reference,document_type,title_public,issuer_public,issued_on,status,file_sha256,is_test,expires_on,updated_at&limit=1',{headers:{apikey:key,Authorization:'Bearer '+key},signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw Error('Registry unavailable');
  const rows=await response.json();if(!Array.isArray(rows)||rows.length!==1)return send({error:'Document not found'},404);
  const r=rows[0],today=new Date().toISOString().slice(0,10);
  const validHash=/^[a-f0-9]{64}$/.test(r.file_sha256||'');
  const status=['revoked','superseded'].includes(r.status)?r.status:r.expires_on&&r.expires_on<today?'expired':r.is_test?'test':r.status;
  const match=provided===null?null:validHash&&provided.toLowerCase()===r.file_sha256;
  return send({schema_version:2,document_reference:r.document_reference,document_type:r.document_type,title_public:r.title_public,issuer_public:r.issuer_public,issued_on:r.issued_on,status,is_test:r.is_test,expires_on:r.expires_on,updated_at:r.updated_at,file_sha256:validHash?r.file_sha256:null,file_match:match,verification_scope:'Registry status and optional exact-file fingerprint comparison. Not a digital signature or confirmation of document claims.',checked_at:new Date().toISOString()});
 }catch{return send({error:'Verification temporarily unavailable'},503);}
});
