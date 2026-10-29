"""On-demand Percept utilities. No external sending or publication."""
import argparse, hashlib, json, pathlib, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parent

def validate_prices(path):
 from frictionless import Resource, Schema
 schema=Schema({'fields':[{'name':'supplier_id','type':'string','constraints':{'required':True}},{'name':'grade','type':'string','constraints':{'enum':['SG-5','SG-8']}},{'name':'price_usd_mt','type':'number','constraints':{'required':True,'minimum':0}},{'name':'basis','type':'string','constraints':{'required':True}},{'name':'source_url','type':'string','constraints':{'required':True}},{'name':'checked_date','type':'date','constraints':{'required':True}}]})
 path=pathlib.Path(path).resolve()
 return Resource(path=path.name,basepath=str(path.parent),schema=schema).validate().to_descriptor()

def render_docx(master,context,registry,output):
 from docxtpl import DocxTemplate
 from jinja2 import Environment,StrictUndefined
 master=pathlib.Path(master);output=pathlib.Path(output)
 digest=hashlib.sha256(master.read_bytes()).hexdigest()
 record=json.loads(pathlib.Path(registry).read_text()).get(digest)
 if not record or record.get('status')!='APPROVED':raise ValueError('Master not in supplied approved registry')
 if master.resolve()==output.resolve():raise ValueError('Cannot overwrite master')
 doc=DocxTemplate(master)
 doc.render(context,jinja_env=Environment(undefined=StrictUndefined),autoescape=True)
 doc.save(output)
 if hashlib.sha256(master.read_bytes()).hexdigest()!=digest:raise ValueError('Source master changed')
 return {'master_sha256':digest,'output_sha256':hashlib.sha256(output.read_bytes()).hexdigest(),'release_authorized':False,'status':'DRAFT_REQUIRES_PREFLIGHT'}

def main():
 p=argparse.ArgumentParser();sub=p.add_subparsers(dest='cmd',required=True)
 v=sub.add_parser('validate-prices');v.add_argument('csv')
 d=sub.add_parser('render-docx');d.add_argument('master');d.add_argument('context');d.add_argument('registry');d.add_argument('output')
 f=sub.add_parser('pdf');f.add_argument('args',nargs=argparse.REMAINDER)
 o=sub.add_parser('ocr');o.add_argument('input');o.add_argument('output');o.add_argument('--language',default='eng')
 a=p.parse_args()
 if a.cmd=='validate-prices':
  r=validate_prices(a.csv);print(json.dumps(r,indent=2,default=str));return 0 if r['valid'] else 1
 if a.cmd=='render-docx':print(json.dumps(render_docx(a.master,json.loads(pathlib.Path(a.context).read_text()),a.registry,a.output),indent=2));return 0
 if a.cmd=='pdf':return subprocess.run([str(ROOT/'bin/pdfcpu'),*a.args],check=False).returncode
 if a.cmd=='ocr':return subprocess.run([sys.executable,'-m','ocrmypdf','--output-type','pdf','--optimize','0','-l',a.language,a.input,a.output],check=False).returncode
if __name__=='__main__':sys.exit(main())
