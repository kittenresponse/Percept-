const crypto = require('node:crypto');
const zlib = require('node:zlib');
const PROFILE = {"id": "POL-010", "version": "1.0", "master_sha256": "cf46c133517346d0d71e12321e1be6d9ebbcb95f76de8cb2a47cb479f48a1c26", "sheet": "xl/worksheets/sheet1.xml", "styles": {"N5": "105", "D12": "92", "E18": "136", "G18": "81", "H18": "100", "O18": "103", "O19": "113", "G21": "144"}, "parts": {"[Content_Types].xml": "c5933af68854c4dfc93adb5d046dd3df2255a05adaf823b16a4bdd0a1ebafec2", "_rels/.rels": "73e5a29f48d5ab979eeda062493bc7e679265c1344ef936978b8becec5549497", "xl/workbook.xml": "e94d682d508a19afa3fd292b6d2cb0ca34d0fe64abda5dbf75405011477c222c", "xl/_rels/workbook.xml.rels": "371ca5b9d79477a00c2a6f29d90f2c1ee9f14f96a2f931ca6a5943cffa08d7a9", "xl/worksheets/sheet1.xml": "cf94ccf36d8796c412bf71d5b1f801609dc0c7fdc39437b9836dfa268c8dd5ef", "xl/theme/theme1.xml": "4c6d88357d3695f39001d7126749b3d6f819f88defc4c3114093e45b0a855636", "xl/styles.xml": "68f29ff762d808d0d0797fc954a6a82d3586dbec90691eaa4299e7c130fa4268", "xl/sharedStrings.xml": "3052f5c479cfdc7bd3f19489193beb42321e7177e78436828800c2041040dc6d", "xl/drawings/drawing1.xml": "88e3e48145b4fa056d5958afc6f3b62964729401c1a9e41824cb2121f1d8b323", "xl/media/image1.png": "4a733b8519a7a13668494298556023dc6e79ff2d39de7b16036da40b50df728d", "xl/media/image2.jpeg": "efbf2d2610f5e2cb64631cf0868df95d1b4cde1f965a7ee664e664e2146f5abd", "xl/media/image3.jpeg": "f996a5e1f75afc776c8703b67dca3dab4e0e1722f36542959d145749b1ebeba5", "xl/media/image4.jpeg": "d3e4354ad40f4d5f8f070f2ab1e32fd52c7fe4dc6e20401dafa4e1f369aa0d8c", "xl/worksheets/_rels/sheet1.xml.rels": "046f319d2b01bf9529da901ae33cb1cf8c7c7d06395167875fa0c4add6bf34c3", "xl/drawings/_rels/drawing1.xml.rels": "a83b5465f9143477704bcdb17958425ea09e90a3ab826e95db165a4ca663341a", "xl/printerSettings/printerSettings1.bin": "40d007f5cfba7bca24c1a74d9665aab962fab5b2ad6157da54d6ea4aea2a9691", "xl/calcChain.xml": "020a77361a932dd39ac5878bf18b1169160a1159789d7d5294af0b2c28845b89", "docProps/core.xml": "876bda0c1b5f983bbe32f63d912f3fb5ffd48cb31d5fcf50c108416d1baa7b58", "docProps/app.xml": "f283d0576e9d65bb9e6b8bc54d1f17d16b8e82f22e177c32a14eba9bc71eb440"}, "normalized_sheet_sha256": "a7caaa4beafeb28a3cdb4aae1d832e42d42fd21c0ea03c348f3e44f22d98af12"};
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function crc32(b) { let c=0xffffffff; for(const v of b){c^=v;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0; }
function unzip(b){
 if(!Buffer.isBuffer(b)||b.length>15*1024*1024||b.length<22)throw Error('File size invalid');
 let end=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(b.readUInt32LE(i)===0x06054b50 && i+22+b.readUInt16LE(i+20)===b.length){end=i;break;}
 if(end<0)throw Error('ZIP end missing');
 const count=b.readUInt16LE(end+10),offset=b.readUInt32LE(end+16),size=b.readUInt32LE(end+12);
 if(b.readUInt16LE(end+4)||b.readUInt16LE(end+6)||count!==b.readUInt16LE(end+8)||count>100||offset+size!==end)throw Error('ZIP structure invalid');
 let p=offset,total=0;const out={};
 for(let i=0;i<count;i++){
  if(p+46>end||b.readUInt32LE(p)!==0x02014b50)throw Error('Invalid central directory');
  const flags=b.readUInt16LE(p+8),method=b.readUInt16LE(p+10),crc=b.readUInt32LE(p+16),cs=b.readUInt32LE(p+20),us=b.readUInt32LE(p+24),nl=b.readUInt16LE(p+28),xl=b.readUInt16LE(p+30),cl=b.readUInt16LE(p+32),local=b.readUInt32LE(p+42);
  if(p+46+nl+xl+cl>end)throw Error('Invalid ZIP entry');
  const name=b.subarray(p+46,p+46+nl).toString('utf8');p+=46+nl+xl+cl;
  total+=us;if(total>30*1024*1024||us>10*1024*1024||flags&1||![0,8].includes(method)||Object.hasOwn(out,name)||!/^([A-Za-z0-9_.\[\]-]+\/)*[A-Za-z0-9_.\[\]-]+$/.test(name)||name.split('/').includes('..'))throw Error('Unsafe ZIP entry');
  if(local+30>offset||b.readUInt32LE(local)!==0x04034b50)throw Error('Local ZIP header invalid');
  const ln=b.readUInt16LE(local+26),le=b.readUInt16LE(local+28),start=local+30+ln+le;
  if(b.subarray(local+30,local+30+ln).toString('utf8')!==name||b.readUInt16LE(local+8)!==method||start+cs>offset)throw Error('ZIP header disagreement');
  const raw=b.subarray(start,start+cs),data=method===0?raw:zlib.inflateRawSync(raw,{maxOutputLength:10*1024*1024});
  if(data.length!==us||crc32(data)!==crc)throw Error('ZIP integrity failed');out[name]=data;
 }
 if(p!==end)throw Error('Unexpected ZIP directory data');return out;
}
function normalizeSheet(bytes){
 let xml=bytes.toString('utf8');const values={};
 for(const [cell,style] of Object.entries(PROFILE.styles)){
  const matches=[...xml.matchAll(new RegExp('<c\\b[^>]*r="'+cell+'"[^>]*(?:/>|>.*?</c>)','g'))];
  if(matches.length!==1)throw Error('Missing or duplicate mutable cell '+cell);
  const raw=matches[0][0],m=raw.match(new RegExp('^<c r="'+cell+'" s="'+style+'"(?: t="(s|inlineStr)")?>(.*)</c>$'));
  if(!m)throw Error('Changed cell formatting '+cell);
  const type=m[1]||'n',body=m[2];let val;
  if(type==='s'&&/^<v>\d+<\/v>$/.test(body))val={type,value:Number(body.slice(3,-4))};
  else if(type==='inlineStr'&&/^<is><t(?: xml:space="preserve")?>[^<>]*<\/t><\/is>$/.test(body))val={type,value:body.replace(/^<is><t[^>]*>|<\/t><\/is>$/g,'')};
  else if(type==='n'){
   const n=body.match(/^(?:<f>(H18\*9|H18\*G18|O18\*1)<\/f>)?<v>([0-9]+(?:\.[0-9]+)?)<\/v>$/);
   if(!n||!Number.isFinite(Number(n[2])))throw Error('Invalid value or formula '+cell);
   if(n[1] && !(['O18','O19'].includes(cell)))throw Error('Formula in input field '+cell);
   if(cell==='O18'&&n[1]&&!['H18*9','H18*G18'].includes(n[1]))throw Error('Wrong total formula');
   if(cell==='O19'&&n[1]&&n[1]!=='O18*1')throw Error('Wrong grand total formula');
   val={type,value:Number(n[2]),formula:n[1]||null};
  }else throw Error('Invalid cell content '+cell);
  if(['D12','E18'].includes(cell)?!['s','inlineStr'].includes(type):type!=='n')throw Error('Wrong field type '+cell);
  values[cell]=val;xml=xml.replace(raw,'<MUTABLE:'+cell+'>');
 }
 if(sha(Buffer.from(xml))!==PROFILE.normalized_sheet_sha256)throw Error('Locked cells, layout or print settings changed');
 const q=values.G18.value,u=values.H18.value,t=values.O18.value,g=values.O19.value;
 if(q<=0||!Number.isInteger(q)||u<0||Math.abs(q*u-t)>0.005||Math.abs(t-g)>0.005)throw Error('Quantity or totals invalid');
 if(values.O18.formula==='H18*9'&&q!==9)throw Error('Stale quantity in formula');
 for(const a of ['N5','G21'])if(values[a].value<1||values[a].value>100000||!Number.isInteger(values[a].value))throw Error('Invalid Excel date');
 if(values.N5.value!==values.G21.value)throw Error('Dates disagree');
 return values;
}
function verify(bytes,kind='Huawei Acceptance Report'){
 const result={schema_version:1,verifier_version:'1.0.0',document_type:kind,document_sha256:sha(bytes),template_validation:'BLOCK',release_authorized:false,issues:[]};
 try{
  if(String(kind).trim().toLowerCase()!=='huawei acceptance report')throw Error('No verified byte comparison profile for document type');
  const parts=unzip(bytes),names=Object.keys(parts).sort();
  if(JSON.stringify(names)!==JSON.stringify(Object.keys(PROFILE.parts).sort()))throw Error('Package parts added or removed');
  for(const name of names)if(name!==PROFILE.sheet&&sha(parts[name])!==PROFILE.parts[name])throw Error('Locked package part changed: '+name);
  normalizeSheet(parts[PROFILE.sheet]);result.template_validation='PASS';result.master_sha256=PROFILE.master_sha256;
 }catch(e){result.issues.push(e.message);}
 result.issues.push('External release requires independently verified approval, unique serial, archive readback and routed dispatch.');
 return result;
}

export const code = async (inputs) => {
 const record=inputs.record||{};
 const blocked=reason=>({template_validation:'BLOCK',release_authorized:false,issues:[reason],verified_at:new Date().toISOString()});
 try {
  const ref=inputs.download;
  if(typeof ref!=='string')return blocked('Authenticated Drive download did not return a file reference');
  const url=new URL(ref);
  if(url.protocol!=='https:'||url.hostname!=='cloud.activepieces.com'||!url.pathname.startsWith('/api/v1/files/'))return blocked('Untrusted file reference');
  let current=url;let response;
  for(let hop=0;hop<4;hop++){
   response=await fetch(current,{redirect:'manual',signal:AbortSignal.timeout(20000)});
   if(![301,302,303,307,308].includes(response.status))break;
   const next=new URL(response.headers.get('location')||'',current);
   if(next.protocol!=='https:'||next.username||next.password||!(next.hostname==='cloud.activepieces.com'||next.hostname.endsWith('.amazonaws.com')||next.hostname.endsWith('.blob.core.windows.net')||next.hostname.endsWith('.r2.cloudflarestorage.com')))throw Error('Untrusted storage redirect host: '+next.hostname);
   current=next;
  }
  if(!response.ok)throw Error('File download failed');
  if(Number(response.headers.get('content-length')||0)>15728640)throw Error('File too large');
  const reader=response.body.getReader();let n=0;const chunks=[];
  while(true){const part=await reader.read();if(part.done)break;n+=part.value.length;if(n>15728640){await reader.cancel();throw Error('File too large');}chunks.push(Buffer.from(part.value));}
  const result=verify(Buffer.concat(chunks),String(record['Document type']||''));
  result.verified_at=new Date().toISOString();
  for(const field of ['Document SHA256','Archive SHA256'])if(!/^[a-f0-9]{64}$/i.test(String(record[field]||''))||String(record[field]).toLowerCase()!==result.document_sha256){result.template_validation='BLOCK';result.issues.push(field+' does not match actual downloaded bytes');}
  return result;
 } catch(e) { return blocked(e.message); }
};

