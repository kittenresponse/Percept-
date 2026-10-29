const crypto = require('node:crypto');
const zlib = require('node:zlib');
const fs = require('node:fs');
const PROFILE = require('./huawei-profile.json');
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
module.exports={verify,unzip,normalizeSheet};
if(require.main===module){const result=verify(fs.readFileSync(process.argv[2]),process.argv[3]);console.log(JSON.stringify(result,null,2));process.exitCode=result.template_validation==='PASS'?0:1;}
