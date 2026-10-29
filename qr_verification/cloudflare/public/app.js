'use strict';
const API='https://avjbpkqdocyajmhymepd.supabase.co/functions/v1/percept-verification-api';
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const $=id=>document.getElementById(id);
let activeRecord=null,lookupGeneration=0;
function statusFor(record){
 const allowed=['verified','pending','revoked','superseded','expired','test'];
 if(record.is_test||/^TEST ONLY/i.test(record.title_public||''))return 'test';
 return allowed.includes(record.status)?record.status:'pending';
}
function displayRecord(record){
 activeRecord=record;const status=statusFor(record);
 $('badge').className='badge '+status;
 $('badge').textContent=status==='test'?'TEST RECORD — NOT VALID FOR BUSINESS USE':status==='verified'?'REGISTERED AS VERIFIED':status.toUpperCase();
 $('recordTitle').textContent=record.title_public||'Document registry record';
 for(const [id,key] of [['reference','document_reference'],['type','document_type'],['issuer','issuer_public'],['issued','issued_on'],['checked','checked_at']])$(id).textContent=record[key]||'Not provided';
 $('scope').textContent=status==='test'?'This is a demonstration record only. It is not a business certificate and does not validate any transaction.':record.verification_scope||'Registry lookup only. This is not a digital signature.';
 $('fileHelp').textContent=record.file_sha256?'A registered fingerprint is available. Select your PDF to compare its exact bytes locally.':'This record has no public file fingerprint. Exact-file checking is not yet enabled.';
 $('file').value='';$('fileResult').textContent='';$('result').hidden=false;
}
async function lookup(id){
 const generation=++lookupGeneration;activeRecord=null;$('result').hidden=true;$('message').className='';$('fileResult').textContent='';
 if(!UUID.test(id)){$('message').textContent='Enter a valid verification ID from the QR link.';$('message').className='error';return;}
 $('message').textContent='Checking the registry…';const button=document.querySelector('button');button.disabled=true;
 try{
  const response=await fetch(API+'?id='+encodeURIComponent(id),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(15000)});
  if(generation!==lookupGeneration)return;
  if(response.status===404){$('message').textContent='No public record found for this verification ID.';$('message').className='error';return;}
  if(!response.ok)throw Error('unavailable');
  const record=await response.json();if(generation!==lookupGeneration)return;
  if(!record.document_reference||!record.issuer_public)throw Error('invalid response');
  displayRecord(record);$('message').textContent='Registry lookup completed. Review the status and limitations below.';
 }catch{if(generation===lookupGeneration){$('message').textContent='The verification service is temporarily unavailable. No verification result has been established.';$('message').className='error';}}
 finally{if(generation===lookupGeneration)button.disabled=false;}
}
$('lookup').addEventListener('submit',event=>{event.preventDefault();const id=$('token').value.trim();if(UUID.test(id))history.replaceState(null,'','?id='+encodeURIComponent(id));lookup(id);});
$('file').addEventListener('change',async()=>{
 const file=$('file').files[0],record=activeRecord,generation=lookupGeneration;$('fileResult').textContent='';if(!file||!record)return;
 if(file.size>50*1024*1024){$('fileResult').textContent='Please select a PDF smaller than 50 MB.';return;}
 try{
  if(new TextDecoder().decode(await file.slice(0,5).arrayBuffer())!=='%PDF-')throw Error('not pdf');
  const bytes=await file.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes),hash=Array.from(new Uint8Array(digest)).map(v=>v.toString(16).padStart(2,'0')).join('');
  if(generation!==lookupGeneration||record!==activeRecord)return;
  const expected=record.file_sha256;
  $('fileResult').textContent=!expected?'SHA-256: '+hash+'\nCalculated only. No registered fingerprint is available to confirm a match.':expected===hash?'MATCH: this PDF has the registered exact-file fingerprint. Current registry status: '+statusFor(record)+'.':'MISMATCH: this PDF differs from the registered file.';
 }catch{if(generation===lookupGeneration)$('fileResult').textContent='Could not calculate a fingerprint. Select a valid PDF and use a modern browser.';}
});
const initial=new URLSearchParams(location.search).get('id');if(initial){$('token').value=initial;lookup(initial);}
