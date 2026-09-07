import http from 'node:http';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {buildGraph} from './build.mjs';
import {validateConfig} from './config.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const configFile=path.join(HERE,'brain.config.json');
const config=validateConfig(JSON.parse(await fs.readFile(configFile,'utf8')));
const index=process.argv.indexOf('--port');
const port=index>=0 ? Number(process.argv[index+1]) : config.port;
if (!Number.isInteger(port) || port<1024 || port>65535) throw new Error('Invalid port.');
let pending;
const load=(refresh=false)=>{ if(!pending || refresh) pending=buildGraph(configFile).catch(e=>{pending=null;throw e;}); return pending; };
const send=(res,status,value,type='application/json; charset=utf-8')=>{res.writeHead(status,{'content-type':type,'cache-control':'no-store','x-content-type-options':'nosniff'});res.end(typeof value==='string' || Buffer.isBuffer(value)?value:JSON.stringify(value));};
const publicFiles=new Map([['/',['index.html','text/html; charset=utf-8']],['/index.html',['index.html','text/html; charset=utf-8']],['/style.css',['style.css','text/css; charset=utf-8']],['/dist/app.js',['dist/app.js','text/javascript; charset=utf-8']]]);
const allowedHosts=new Set([`localhost:${port}`,`127.0.0.1:${port}`]);
const server=http.createServer(async(req,res)=>{
  try {
    if(!allowedHosts.has(req.headers.host)) return send(res,403,{error:'Local requests only.'});
    if(req.headers.origin && !allowedHosts.has(new URL(req.headers.origin).host)) return send(res,403,{error:'Cross-origin request rejected.'});
    if(req.method!=='GET') return send(res,405,{error:'Read-only server.'});
    const url=new URL(req.url,`http://127.0.0.1:${port}`);
    if(publicFiles.has(url.pathname)){const [file,type]=publicFiles.get(url.pathname);return send(res,200,await fs.readFile(path.join(HERE,file)),type);}
    if(url.pathname==='/api/graph') return send(res,200,(await load(url.searchParams.get('rebuild')==='1')).graph);
    if(url.pathname==='/api/node' || url.pathname==='/api/reveal') {
      const {records}=await load(), id=url.searchParams.get('id'), record=records.get(id);
      if(!record) return send(res,404,{error:'Unknown note.'});
      const file=await fs.realpath(record.file);
      if(file!==record.file) return send(res,403,{error:'Source target changed. Rebuild first.'});
      if(url.pathname==='/api/reveal') {
        const command=process.platform==='win32'?'explorer.exe':process.platform==='darwin'?'open':'xdg-open';
        const args=process.platform==='win32'?[`/select,${file}`]:process.platform==='darwin'?['-R',file]:[path.dirname(file)];
        const child=spawn(command,args,{detached:true,stdio:'ignore',windowsHide:true});
        child.on('error',()=>{}); child.unref();
        return send(res,200,{ok:true});
      }
      if((await fs.stat(file)).size>1024*1024) return send(res,413,{error:'Note exceeds the 1 MB reader limit.'});
      let markdown=await fs.readFile(file,'utf8');
      if(record.startLine) markdown=markdown.split(/\r?\n/).slice(record.startLine-1,record.endLine).join('\n');
      return send(res,200,{id,markdown,path:record.node.path});
    }
    return send(res,404,{error:'Not found.'});
  } catch(err){send(res,500,{error:err.message});}
});
server.on('error',(err)=>{console.error(err.code==='EADDRINUSE'?`Port ${port} is occupied. Choose another port; do not stop an unrelated service.`:err.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{console.log(`${config.name}: http://localhost:${port}`);load().catch(err=>console.error(err.message));});
