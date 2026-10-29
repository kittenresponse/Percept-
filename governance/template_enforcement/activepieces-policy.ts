export const code = async (inputs) => {
 const record=inputs.record?.cells||inputs.record?.values||inputs.record||{};
 const get=k=>String(record[k]??'').trim();
 const rules=Array.isArray(inputs.policies)?inputs.policies:[];
 const approvals=Array.isArray(inputs.approvals)?inputs.approvals:[];
 const read=(row,name)=>{const c=row?.cells||{};const direct=c[name];return (direct&&typeof direct==='object'&&'value' in direct)?direct.value:(direct??Object.values(c).find(x=>x&&x.fieldName===name)?.value);};
 const defects=[];let approved=0,executable=0;
 for(const row of rules){
  if(String(read(row,'Status')||'')!=='APPROVED')continue;
  approved++;
  const id=String(read(row,'Rule ID')||'UNKNOWN');
  const spec=String(read(row,'Machine rule JSON')||'').trim();
  if(!spec){defects.push({rule:id,reason:'Approved policy has no machine rule definition'});continue;}
  let obj;try{obj=JSON.parse(spec)}catch{}
  if(!obj||!obj.field||!['required','equals','not_equals'].includes(obj.operator)){defects.push({rule:id,reason:'Machine rule invalid'});continue;}
  if(obj.document_type && obj.document_type!==get('Document type')){executable++;continue;}
  const value=get(obj.field);const valid=obj.operator==='required'?!!value:obj.operator==='equals'?value===String(obj.value):value!==String(obj.value);
  executable++;if(!valid)defects.push({rule:id,reason:'Approved rule check failed'});
 }
 const lessonRows=inputs.lessons?.rows;
 let lessons=0;
 if(!Array.isArray(lessonRows))defects.push({rule:'LESSONS',reason:'Lessons register cannot be read'});
 else for(const r of lessonRows){
  const v=r.values||{};if(!['APPROVED','IMPLEMENTED','SYNCED — ENFORCEMENT PENDING','SYNCED - ENFORCEMENT PENDING'].includes(String(v.J||'')))continue;
  lessons++;
  let obj;try{obj=JSON.parse(String(v.K||''))}catch{}
  if(!obj||!obj.field||!['required','equals','not_equals'].includes(obj.operator)){defects.push({rule:String(v.A||'UNKNOWN'),reason:'Approved lesson lacks machine-verifiable rule'});continue;}
  if(obj.document_type && obj.document_type!==get('Document type'))continue;
  const value=get(obj.field);const valid=obj.operator==='required'?!!value:obj.operator==='equals'?value===String(obj.value):value!==String(obj.value);
  if(!valid)defects.push({rule:String(v.A||'UNKNOWN'),reason:'Approved lesson violated'});
 }
 if(approved===0)defects.push({rule:'POLICY_REGISTRY',reason:'No approved policies available'});
 const matching=approvals.filter(a=>String(read(a,'Request ID')||'')===get('Request ID')&&String(read(a,'Content SHA256')||'').toLowerCase()===get('Document SHA256').toLowerCase()&&String(read(a,'Destination')||'')===get('Recipient')&&String(read(a,'Status')||'')==='APPROVED');
 if(matching.length!==1)defects.push({rule:'EXACT_APPROVAL',reason:'Exactly one bound CEO approval is required'});
 else defects.push({rule:'EXACT_APPROVAL',reason:'Authenticated signature, identity, freshness and authority not independently verified'});
 for(const k of ['Request ID','Document SHA256','Serial number','Master Drive file ID','Master SHA256','Archive Drive file ID','Archive SHA256','Validation evidence'])
 if(!get(k))defects.push({rule:'EVIDENCE',reason:'Missing '+k});
 const masters={'quotation':'1qVcjPjyFQEJTXqAbg_rblE4s5LZ4OKDM','invoice':'1_Igu2OCHJrru8rBAc9qsA-iTFEDH9McD'};
 const kind=get('Document type').toLowerCase();
 if(['quotation','invoice'].includes(kind)){
   const expected=masters[kind];
   if(get('Master Drive file ID')!==expected)defects.push({rule:'MASTER_ID',reason:'Document must use the exact CEO approved '+kind+' Drive master file ID'});
   for(const field of ['Document SHA256','Master SHA256'])if(!/^[a-f0-9]{64}$/i.test(get(field))) defects.push({rule:'HASH_FORMAT',reason:'Invalid '+field});
   defects.push({rule:'MASTER_LAYOUT',reason:'Actual PDF, embedded logo, typography, table, total bar and footer comparison must be independently verified against master'});
 }else if(kind==='huawei acceptance report'){
  const expected='cf46c133517346d0d71e12321e1be6d9ebbcb95f76de8cb2a47cb479f48a1c26';
  if(get('Master SHA256').toLowerCase()!==expected)defects.push({rule:'HUAWEI_MASTER_SHA256',reason:'Huawei acceptance report master must match immutable uploaded Excel SHA256'});
  if(!/^[a-f0-9]{64}$/i.test(get('Document SHA256')))defects.push({rule:'HUAWEI_OUTPUT_SHA256',reason:'Actual report file hash is missing or invalid'});
  if(inputs.template?.template_validation!=='PASS'||inputs.template?.document_sha256!==get('Document SHA256').toLowerCase())defects.push({rule:'HUAWEI_WORKBOOK_LAYOUT',reason:'Actual byte comparison failed or is not bound to this output'});
 }else defects.push({rule:'UNREGISTERED_TYPE',reason:'No verified master binding configured for this document type'});
 if(inputs.template?.template_validation!=='PASS')defects.push({rule:'TEMPLATE_VERIFICATION',reason:'No passing independent template byte verification'});
 defects.push({rule:'RENDER_REVIEW',reason:'Rendered output and photographic page review remain required'});
 defects.push({rule:'SERIAL_UNIQUENESS',reason:'Atomic unique serial reservation not implemented'});
 if(!inputs.template?.document_sha256||inputs.template.document_sha256!==get('Archive SHA256').toLowerCase())defects.push({rule:'ARCHIVE_READBACK',reason:'Archive bytes do not match the recorded hash'});
 return {decision:'BLOCK',release_authorized:false,template_result:inputs.template||null,approved_policies:approved,executable_policies:executable,approved_lessons:lessons,issues:defects,reason:'No document may be dispatched until every verification is independently proven.'};
};
