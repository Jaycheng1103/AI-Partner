import {promises as fs} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateConfig} from '../assets/template/config.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2);
const value=(name)=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
const root=path.resolve(value('--root')||process.cwd());
const input=value('--config');
if(!input) throw new Error('Usage: node scaffold.mjs --root <AIOS folder> --config <JSON file> [--out <new app folder>]');
const out=path.resolve(root,value('--out')||'apps/3d-brain');
if(!out.startsWith(root+path.sep)) throw new Error('Output must be a new folder inside the chosen AIOS.');
try{await fs.access(out);throw new Error('Output already exists. Reuse its config or archive it before installing a new copy.');}catch(err){if(err.code!=='ENOENT')throw err;}
const config=validateConfig(JSON.parse(await fs.readFile(path.resolve(input),'utf8')));
config.root=path.relative(out,root).split(path.sep).join('/') || '.';
const template=path.resolve(here,'../assets/template');
const allowed=['build.mjs','serve.mjs','config.mjs','codex-memory.mjs','index.html','style.css','package.json','package-lock.json','README.md','THIRD-PARTY-NOTICES.txt','src/app.js','src/constellation.js','src/growth.js','dist/app.js'];
// Validate the complete package before creating anything.
for(const file of allowed) await fs.access(path.join(template,file));
for(const file of allowed){await fs.mkdir(path.dirname(path.join(out,file)),{recursive:true});await fs.copyFile(path.join(template,file),path.join(out,file));}
await fs.writeFile(path.join(out,'brain.config.json'),JSON.stringify(config,null,2)+'\n');
await fs.writeFile(path.join(out,'.gitignore'),'node_modules/\ndata/\nbrain.config.json\n*.log\n');
console.log(JSON.stringify({app:out,name:config.name,port:config.port,next:'Run node build.mjs, then node serve.mjs from the app folder.'},null,2));
