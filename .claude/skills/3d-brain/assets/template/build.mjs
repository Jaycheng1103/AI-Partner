import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {validateConfig,expandPath} from './config.mjs';
import {readCodexMemories} from './codex-memory.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const blocked = new Set(['.git','node_modules','dist','build','archives','archive','tmp','audits','data','assets','scripts','tests','examples']);
const slash = (s) => s.split(path.sep).join('/');
const key = (s) => String(s).toLowerCase().replace(/\.(md|txt)$/i,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const heading = (s) => s.match(/^#\s+(.+)$/m)?.[1]?.trim();
const hash = (s) => createHash('sha256').update(s).digest('hex').slice(0,12);
const within = (file,root) => file === root || file.startsWith(root+path.sep);
function parse(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const fm = {};
  if (match) for (const line of match[1].split(/\r?\n/)) {
    const p = line.match(/^([\w-]+):\s*(.+)$/);
    if (p) fm[p[1]] = p[2].replace(/^['"]|['"]$/g,'');
  }
  return {fm, body:match ? text.slice(match[0].length) : text};
}
function summary(body) {
  return body.replace(/```[\s\S]*?```/g,' ').replace(/^#+\s+.*$/gm,'').replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(_,a,b)=>b||a).replace(/\[([^\]]+)\]\([^)]*\)/g,'$1').replace(/[*_`<>]/g,'').replace(/\s+/g,' ').trim().slice(0,260);
}
export async function buildGraph(configFile = path.join(HERE,'brain.config.json')) {
  const config = validateConfig(JSON.parse(await fs.readFile(configFile,'utf8')));
  const root = expandPath(config.root,path.dirname(configFile));
  const records = new Map(), seen = new Set(), warnings = [];
  let scanned = 0;
  async function add(file, source, input = {}) {
    if (records.size >= config.maxNodes) return;
    const real = await fs.realpath(file);
    if (within(real,HERE)) return;
    const stat = await fs.stat(real);
    if (!stat.isFile() || stat.size > 1024*1024) { warnings.push(`Skipped oversized or non-file input: ${slash(file)}`); return; }
    const identity = `${real}:${input.startLine || 0}`;
    if (seen.has(identity)) return;
    seen.add(identity); scanned++;
    const text = input.body ?? await fs.readFile(real,'utf8');
    const {fm,body} = parse(text);
    const relative = slash(path.relative(root,real));
    const nav = /^(_index.*|_hot|_log.*|index|log|overview)$/i.test(path.basename(real,path.extname(real)));
    const id = `${source.id}:${hash(relative+':'+(input.title || input.startLine || ''))}`;
    const title = String(input.title || fm.title || fm.name || heading(body) || path.basename(real,path.extname(real)).replace(/[-_]/g,' ')).replace(/\s+/g,' ').trim();
    const date = Date.parse(fm.updated || fm['last-updated'] || '');
    const node = {id,source:source.id,kind:nav ? 'index' : input.kind || fm.type || 'note',title,slug:key(path.basename(real)),summary:fm.description || summary(body),path:within(real,root) ? relative : slash(real),relativePath:relative,inRepo:within(real,root),updated:Number.isFinite(date)?date:stat.mtimeMs,created:Date.parse(fm.created || '') || null,words:(body.match(/\S+/g)||[]).length,tags:(fm.tags||'').replace(/[\[\]'"]/g,'').split(',').map(s=>s.trim()).filter(Boolean),degree:0,flags:[],broken:[],startLine:input.startLine,endLine:input.endLine};
    records.set(id,{node,file:real,body,source,startLine:input.startLine,endLine:input.endLine});
  }
  async function walk(dir,source,base=dir) {
    const stat = await fs.lstat(dir);
    if (stat.isSymbolicLink()) { warnings.push(`Skipped symbolic link: ${slash(dir)}`); return; }
    if (stat.isFile()) { if (/\.(md|txt)$/i.test(dir)) await add(dir,source); return; }
    if (!stat.isDirectory() || within(await fs.realpath(dir),HERE)) return;
    for (const e of (await fs.readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))) {
      if (records.size >= config.maxNodes) return;
      if (e.name.startsWith('.') || blocked.has(e.name) || e.isSymbolicLink()) continue;
      const file = path.join(dir,e.name), rel = slash(path.relative(base,file));
      if ((source.exclude||[]).some((x)=>rel === x || rel.startsWith(x.replace(/\/$/,'')+'/'))) continue;
      if (e.isDirectory()) await walk(file,source,base);
      else if (/\.(md|txt)$/i.test(e.name)) await add(file,source);
    }
  }
  for (const source of config.sources) for (const p of source.paths) {
    const input = expandPath(p,root);
    try {
      await fs.access(input);
      if (source.type === 'codex-memory') {
        for (const r of await readCodexMemories(input)) await add(r.file,source,r);
      } else await walk(input,source);
    } catch (err) { if (err.code === 'ENOENT' || err.code === 'EACCES') warnings.push(`${source.label}: cannot read ${slash(input)} (${err.code})`); else throw err; }
  }
  if (records.size >= config.maxNodes) warnings.push(`Reached the ${config.maxNodes}-note limit. Narrow the category paths or raise maxNodes.`);
  const all = [...records.values()], visible = all.filter(r=>r.node.kind!=='index');
  const aliases = new Map(), files = new Map(), edges = new Map();
  const register = (alias,r) => { const k=key(alias); const list=aliases.get(k)||[]; if (!list.includes(r)) list.push(r); aliases.set(k,list); };
  for (const r of all) { files.set(r.file,r); register(r.node.title,r); register(path.basename(r.file),r); register(r.node.relativePath,r); }
  function connect(a,b,kind) {
    if (!b || a===b || a.node.kind==='index' || b.node.kind==='index') return;
    const pair=[a.node.id,b.node.id].sort().join('|');
    if (!edges.has(pair) || kind==='link') edges.set(pair,{source:a.node.id,target:b.node.id,kind});
  }
  for (const r of visible) {
    r.node.linkTargets = {};
    const wikilinks = [...r.body.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)].map(m=>m[1].trim());
    for (const target of wikilinks) {
      const candidates=aliases.get(key(target)) || [];
      const local=candidates.filter(c=>c.node.source===r.node.source);
      const match=local.length===1 ? local[0] : candidates.length===1 ? candidates[0] : null;
      r.node.linkTargets[target] = match?.node.kind !== 'index' ? match?.node.id || null : null;
      if (match) connect(r,match,'link'); else r.node.broken.push(target);
    }
    for (const m of r.body.matchAll(/\[[^\]]*\]\(([^)#]+)(?:#[^)]*)?\)/g)) {
      if (/^[a-z]+:/i.test(m[1])) continue;
      let target; try { target=decodeURIComponent(m[1]); } catch { continue; }
      const match = files.get(path.resolve(path.dirname(r.file),target));
      r.node.linkTargets[m[1]] = match?.node.kind !== 'index' ? match?.node.id || null : null;
      connect(r,match,'source');
      if (!match) r.node.broken.push(m[1]);
    }
    // Memory registries often use plain relative file paths, not Markdown links.
    if (r.source.type==='codex-memory') for (const other of visible) {
      if (other.source.id!==r.source.id || other.file===r.file) continue;
      const relative=slash(path.relative(path.dirname(r.file),other.file));
      if (relative.length>8 && r.body.replace(/\\/g,'/').includes(relative)) connect(r,other,'source');
    }
  }
  // Explicit full-title mentions only. These are labeled mentions, not semantic certainty.
  const mentions=new Map(visible.filter(r=>r.node.title.length>=7 && r.node.title.length<=80 && aliases.get(key(r.node.title))?.length===1).map(r=>[r.node.title.toLowerCase(),r]));
  const alternatives=[...mentions.keys()].sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
  if(alternatives.length){
    const pattern=new RegExp(`\\b(?:${alternatives.join('|')})\\b`,'gi');
    for(const r of visible)for(const match of r.body.matchAll(pattern)){
      const other=mentions.get(match[0].toLowerCase());
      if(other && other.node.source!==r.node.source)connect(r,other,'mention');
    }
  }
  const links=[...edges.values()], nodes=visible.map(r=>r.node), byId=new Map(nodes.map(n=>[n.id,n]));
  for (const l of links) { byId.get(l.source).degree++; byId.get(l.target).degree++; }
  for (const r of visible) {
    const n=r.node; n.ageDays=Math.max(0,Math.round((Date.now()-n.updated)/86400000));
    if (!n.degree) n.flags.push('orphan');
    if (n.words<60) n.flags.push('stub');
    if (n.broken.length) n.flags.push('broken-links');
    if (r.source.staleDays && !['recollection','meeting','video','document'].includes(n.kind) && n.ageDays>r.source.staleDays) n.flags.push('stale');
  }
  const bySource={};
  for (const s of config.sources) {
    const list=nodes.filter(n=>n.source===s.id), kinds={};
    for(const n of list) kinds[n.kind]=(kinds[n.kind]||0)+1;
    bySource[s.id]={...s,root:s.paths.join(', '),count:list.length,kinds,words:list.reduce((a,n)=>a+n.words,0),newest:list.length?Math.max(...list.map(n=>n.updated)):null,oldest:list.length?Math.min(...list.map(n=>n.updated)):null,flagged:list.filter(n=>n.flags.length).length};
  }
  const flags={}; for(const f of ['stale','quiet','orphan','stub','broken-links','missing-folder','archived','not-ingested']) flags[f]=nodes.filter(n=>n.flags.includes(f)).map(n=>n.id);
  const generatedAt=new Date().toISOString();
  const graph={brain:{name:config.name},generatedAt,builtAt:Date.now(),sources:config.sources.map(({paths,exclude,...s})=>s),nodes,links,warnings,inventory:{generatedAt,totals:{nodes:nodes.length,links:links.length,words:nodes.reduce((a,n)=>a+n.words,0)},bySource,flags,navigation:all.filter(r=>r.node.kind==='index').map(r=>r.node),hubs:[...nodes].sort((a,b)=>b.degree-a.degree).slice(0,12).map(n=>n.id),linkKinds:Object.fromEntries([...new Set(links.map(l=>l.kind))].map(k=>[k,links.filter(l=>l.kind===k).length]))}};
  return {graph,records,config};
}
if (process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const {graph}=await buildGraph();
  await fs.mkdir(path.join(HERE,'data'),{recursive:true});
  await fs.writeFile(path.join(HERE,'data/graph.json'),JSON.stringify(graph));
  console.log(`${graph.brain.name}: ${graph.nodes.length} notes, ${graph.links.length} connections, ${graph.sources.length} categories.`);
  for(const warning of graph.warnings) console.warn(warning);
}
