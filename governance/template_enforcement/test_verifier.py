"""Run against the private approved master; never commit its bytes."""
import json, pathlib, subprocess, sys, tempfile, zipfile
root=pathlib.Path(__file__).parent
master=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(master) as z: original={n:z.read(n) for n in z.namelist()}
sheet='xl/worksheets/sheet1.xml'
cases=[('unchanged',{},'PASS'),('item',{sheet:original[sheet].replace(b'<c r="E18" s="136" t="s"><v>30</v></c>',b'<c r="E18" s="136" t="inlineStr"><is><t>18000 BTU AC</t></is></c>')},'PASS'),('receiver',{'xl/sharedStrings.xml':original['xl/sharedStrings.xml'].replace(b'84314732',b'00000000')},'BLOCK'),('logo',{'xl/media/image1.png':b'bad'},'BLOCK'),('styles',{'xl/styles.xml':original['xl/styles.xml']+b' '},'BLOCK'),('merge',{sheet:original[sheet].replace(b'O7:P7',b'O7:P8')},'BLOCK'),('quantity',{sheet:original[sheet].replace(b'<c r="G18" s="81"><v>9</v></c>',b'<c r="G18" s="81"><v>8</v></c>')},'BLOCK'),('formula',{sheet:original[sheet].replace(b'<c r="G18" s="81"><v>9</v></c>',b'<c r="G18" s="81"><f>1+1</f><v>9</v></c>')},'BLOCK'),('removed',{'xl/printerSettings/printerSettings1.bin':None},'BLOCK'),('macro',{'xl/vbaProject.bin':b'macro'},'BLOCK'),('print',{sheet:original[sheet].replace(b'fitToPage="1"',b'fitToPage="0"')},'BLOCK'),('signature',{'xl/media/image2.jpeg':b'bad'},'BLOCK')]
with tempfile.TemporaryDirectory() as d:
 for name,delta,expected in cases:
  p=pathlib.Path(d)/(name+'.xlsx'); data={**original,**delta}
  with zipfile.ZipFile(p,'w',zipfile.ZIP_DEFLATED) as z:
   for n,b in data.items():
    if b is not None:z.writestr(n,b)
  r=json.loads(subprocess.run(['node',str(root/'verifier.cjs'),str(p)],capture_output=True,text=True,check=False).stdout)
  assert r['template_validation']==expected,(name,r)
  assert r['release_authorized'] is False
 for name,b in [('invalid',b'bad'),('truncated',master.read_bytes()[:-50])]:
  p=pathlib.Path(d)/(name+'.xlsx');p.write_bytes(b)
  r=json.loads(subprocess.run(['node',str(root/'verifier.cjs'),str(p)],capture_output=True,text=True,check=False).stdout)
  assert r['template_validation']=='BLOCK'
print('14/14 passed')
