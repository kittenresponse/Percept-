"""Reproduce the isolated Linux installation; never starts monitoring or sends data."""
import hashlib,pathlib,subprocess,sys,tarfile,tempfile,urllib.request,venv
ROOT=pathlib.Path(__file__).resolve().parent
PDF_VERSION='0.16.4'
PDF_SHA='3271fdd66f4ec32f5a6282f85630f83b92e98d4db7e407cc0f56d9b543f63ecd'
DATASETTE_REV='779b2d4da76a5dc2f1d9aea0d7c8d854f6e1497b'
def run(*args):subprocess.run(list(args),check=True)
def main():
 env=ROOT/'.venv';venv.EnvBuilder(with_pip=True).create(env)
 run(str(env/'bin/python'),'-m','pip','install','-r',str(ROOT/'requirements.lock'))
 run(str(env/'bin/python'),'-m','pip','check')
 (ROOT/'bin').mkdir(exist_ok=True);(ROOT/'vendor').mkdir(exist_ok=True)
 with tempfile.TemporaryDirectory() as d:
  archive=pathlib.Path(d)/'pdfcpu.tar.xz'
  urllib.request.urlretrieve(f'https://github.com/pdfcpu/pdfcpu/releases/download/v{PDF_VERSION}/pdfcpu_{PDF_VERSION}_Linux_x86_64.tar.xz',archive)
  if hashlib.sha256(archive.read_bytes()).hexdigest()!=PDF_SHA:raise ValueError('pdfcpu archive checksum mismatch')
  with tarfile.open(archive) as tar:
   candidates=[m for m in tar.getmembers() if m.isfile() and pathlib.PurePosixPath(m.name).name=='pdfcpu']
   if len(candidates)!=1:raise ValueError('Unexpected pdfcpu archive')
   binary=ROOT/'bin/pdfcpu';binary.write_bytes(tar.extractfile(candidates[0]).read());binary.chmod(0o755)
 dest=ROOT/'vendor/datasette-lite'
 if not dest.exists():
  run('git','init',str(dest));run('git','-C',str(dest),'remote','add','origin','https://github.com/simonw/datasette-lite.git')
 run('git','-C',str(dest),'fetch','--depth','1','origin',DATASETTE_REV)
 run('git','-C',str(dest),'checkout','--detach',DATASETTE_REV)
 # Disable optional upstream analytics in this local copy, without changing its runtime.
 index=dest/'index.html';lines=index.read_text().splitlines();index.write_text('\n'.join(l for l in lines if 'plausible.io/js/script.manual.js' not in l)+'\n')
 print('Installed. Run selftest.py with .venv/bin/python. No public server or scheduled job was started.')
if __name__=='__main__':main()
