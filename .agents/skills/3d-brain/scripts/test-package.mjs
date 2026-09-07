import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import {spawn,spawnSync} from 'node:child_process';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {validateConfig} from '../assets/template/config.mjs';
import {planGrowth,growthPosition} from '../assets/template/src/growth.js';
const here=path.dirname(fileURLToPath(import.meta.url));
const keep=process.argv.includes('--keep');
const outIndex=process.argv.indexOf('--out');
const parent=outIndex>=0?path.resolve(process.argv[outIndex+1]):os.tmpdir();
await fs.mkdir(parent,{recursive:true});
const root=await fs.mkdtemp(path.join(parent,'brain-package-fixture-'));
const write=async(name,body)=>{await fs.mkdir(path.dirname(path.join(root,name)),{recursive:true});await fs.writeFile(path.join(root,name),body);};
let child;
try{
  assert.throws(()=>validateConfig({name:'',sources:[]}),/name/);
  assert.throws(()=>validateConfig({name:'Test',sources:[{id:'same',label:'A',paths:['a']},{id:'same',label:'B',paths:['b']}]}),/unique/);
  const config={name:'Atlas Brain',port:4641,sources:[
    {id:'strategy',label:'Strategy',paths:['context']},
    {id:'studio',label:'Studio knowledge',paths:['studio']},
    {id:'projects',label:'Projects',paths:['projects']},
    {id:'saved',label:'Assistant memory',type:'codex-memory',paths:['memory']},
    {id:'empty',label:'Future notes',paths:['not-created-yet']}
  ]};
  const originals={
    'context/compass.md':'# Strategy Compass\n\nDirection for a fictional studio. [[Studio Atlas]] and [Launch Plan](../projects/a/plan.md).',
    'studio/atlas.md':'# Studio Atlas\n\nCreative work supported by [[Strategy Compass]].',
    'projects/a/plan.md':'# Launch Plan\n\nLinks to [[Studio Atlas]].',
    'projects/b/plan.md':'# Delivery Plan\n\nLinks to [[Strategy Compass]].',
    'memory/memory_summary.md':'# Working preferences\n\nUse [[Strategy Compass]] for priorities.',
    'memory/MEMORY.md':'# Task Group: Design learning\n\nSee rollout_summaries/design.md\n\n# Task Group: Project learning\n\nRemember [[Launch Plan]].\n',
    'memory/rollout_summaries/design.md':'# Design recap\n\nA fictional saved session about Studio Atlas.',
    'memory/raw_memories.md':'PRIVATE_RAW_SENTINEL',
    'context/.hidden/secret.md':'PRIVATE_HIDDEN_SENTINEL',
    '.env':'PRIVATE_ENV_SENTINEL',
    'outside.md':'UNSELECTED_FILE_SENTINEL'
  };
  for(const [name,body]of Object.entries(originals))await write(name,body);
  if(process.argv.includes('--demo'))for(let i=0;i<180;i++){
    const section=['context','studio','projects'][i%3];
    await write(`${section}/idea-${i}.md`,`# Example idea ${i}\n\nFictional QA fixture, not user knowledge. [[Example idea ${Math.max(0,i-1)}]] connects to [[Example idea ${Math.floor(i/3)}]]. [[Strategy Compass]] guides the work.\n`);
  }
  await write('setup.json',JSON.stringify(config,null,2));
  const run=spawnSync(process.execPath,[path.join(here,'scaffold.mjs'),'--root',root,'--config',path.join(root,'setup.json')],{encoding:'utf8'});
  assert.equal(run.status,0,run.stderr);
  const second=spawnSync(process.execPath,[path.join(here,'scaffold.mjs'),'--root',root,'--config',path.join(root,'setup.json')],{encoding:'utf8'});
  assert.notEqual(second.status,0,'must refuse overwrite');
  const app=path.join(root,'apps/3d-brain');
  const {buildGraph}=await import(pathToFileURL(path.join(app,'build.mjs')));
  const {graph,records}=await buildGraph();
  assert.equal(graph.brain.name,'Atlas Brain');
  assert.equal(graph.sources.length,5);
  assert.equal(graph.nodes.length,process.argv.includes('--demo')?188:8);
  const ids=new Set(graph.nodes.map(n=>n.id));assert.equal(ids.size,graph.nodes.length);
  for(const edge of graph.links){assert.ok(ids.has(edge.source));assert.ok(ids.has(edge.target));}
  assert.equal(graph.nodes.filter(n=>n.path.endsWith('/plan.md')).length,2);
  const compass=graph.nodes.find(n=>n.title==='Strategy Compass');
  assert.equal(compass.linkTargets['../projects/a/plan.md'],graph.nodes.find(n=>n.title==='Launch Plan').id);
  assert.ok(graph.warnings.some(w=>w.includes('not-created-yet')));
  assert.ok(!JSON.stringify(graph).includes('SENTINEL'));
  const fakePositions=graph.nodes.map((n,i)=>({...n,x:i+1,y:i%7,z:i%9}));
  const growth=planGrowth(fakePositions,graph.links);
  assert.equal(growth.records.length,graph.nodes.length);
  for(const r of growth.records){
    if(r.parent){assert.ok(r.parent.born<r.born);assert.ok(graph.links.includes(r.link));}
    r.origin={x:0,y:0,z:0};const p=growthPosition(r,growth.duration);
    for(const axis of ['x','y','z'])assert.ok(Math.abs(p[axis]-r.home[axis])<1e-8);
  }
  const probe=http.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
  child=spawn(process.execPath,['serve.mjs','--port',String(port)],{cwd:app,stdio:['ignore','pipe','pipe'],windowsHide:true});
  let log='';child.stdout.on('data',b=>log+=b);child.stderr.on('data',b=>log+=b);
  const base=`http://127.0.0.1:${port}`;
  let ready=false;for(let i=0;i<100;i++){try{if((await fetch(base+'/api/graph')).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}
  assert.ok(ready,log);
  const served=await(await fetch(base+'/api/graph')).json();assert.equal(served.nodes.length,graph.nodes.length);
  for(const n of graph.nodes){
    const response=await fetch(base+'/api/node?id='+encodeURIComponent(n.id));assert.equal(response.status,200);
    const body=await response.json(),r=records.get(n.id);let expected=await fs.readFile(r.file,'utf8');
    if(r.startLine)expected=expected.split(/\r?\n/).slice(r.startLine-1,r.endLine).join('\n');
    assert.equal(body.markdown,expected);
  }
  for(const url of ['/brain.config.json','/setup.json','/build.mjs','/api/node?id=../../outside.md','/api/node?id='+encodeURIComponent(path.join(root,'outside.md'))])assert.equal((await fetch(base+url)).status,404,url);
  assert.equal((await fetch(base+'/api/graph',{headers:{Origin:'https://example.com'}})).status,403);
  const badHost=await new Promise((resolve,reject)=>{const request=http.get(base+'/api/graph',{headers:{Host:'example.com'}},res=>{res.resume();resolve(res.statusCode);});request.on('error',reject);});
  assert.equal(badHost,403);
  for(const [file,body]of Object.entries(originals))assert.equal(await fs.readFile(path.join(root,file),'utf8'),body);
  const bundle=await fs.readFile(path.join(app,'dist/app.js'),'utf8');
  assert.ok(!/C:\\\\Users\\\\Nate|Herk Brain|Nate only|FIREFLIES_API/i.test(bundle));
  console.log(JSON.stringify({ok:true,fixture:root,app,notes:graph.nodes.length,categories:graph.sources.length,checks:['configuration','scaffold and overwrite refusal','custom name and categories','unique IDs and real links','memory sections','private file exclusions','growth parent ordering and exact final positions','every note readback','static and API path boundaries','origin and host checks','original files unchanged','generic bundle'],bundleSha256:createHash('sha256').update(bundle).digest('hex')},null,2));
}finally{
  if(child){child.kill();await new Promise(r=>{if(child.exitCode!==null)return r();child.once('exit',r);setTimeout(r,2000);});}
  if(!keep){assert.ok(path.resolve(root).startsWith(path.join(parent,'brain-package-fixture-')));await fs.rm(root,{recursive:true,force:true});}
}
