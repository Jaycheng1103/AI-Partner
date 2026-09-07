import path from 'node:path';
import os from 'node:os';

export const palette = ['#38BDF8','#FB923C','#F472B6','#FBBF24','#67E8F9','#34D399','#A78BFA','#FCA5A5','#A3E635','#C4B5FD','#FDE68A','#94A3B8'];
export function validateConfig(input) {
  if (!input || typeof input !== 'object') throw new Error('Config must be an object.');
  const name = String(input.name || '').trim();
  if (!name || name.length > 64) throw new Error('Brain name must contain 1 to 64 characters.');
  if (!Array.isArray(input.sources) || !input.sources.length || input.sources.length > 12) throw new Error('Choose 1 to 12 categories.');
  const ids = new Set();
  const sources = input.sources.map((s,i) => {
    if (!/^[a-z][a-z0-9-]{0,39}$/.test(s.id || '') || ids.has(s.id)) throw new Error('Each category needs a unique lowercase ID.');
    ids.add(s.id);
    if (typeof s.label !== 'string' || !s.label.trim() || s.label.length > 64) throw new Error(`Invalid category label: ${s.id}`);
    const type = s.type || 'markdown';
    if (!['markdown','codex-memory'].includes(type)) throw new Error(`Unsupported adapter: ${type}`);
    if (!Array.isArray(s.paths) || !s.paths.length || s.paths.some((p) => typeof p !== 'string' || !p.trim())) throw new Error(`Provide real file/folder paths for ${s.label}.`);
    if (s.color && !/^#[0-9a-f]{6}$/i.test(s.color)) throw new Error(`Use a six-digit hex color for ${s.label}.`);
    if (s.exclude && (!Array.isArray(s.exclude) || s.exclude.some((p) => typeof p !== 'string'))) throw new Error('exclude must be a list of relative paths.');
    const staleDays = s.staleDays === null ? null : Number(s.staleDays ?? 90);
    if (staleDays !== null && (!Number.isFinite(staleDays) || staleDays < 1)) throw new Error('staleDays must be a positive number or null.');
    return {...s, type, color:s.color || palette[i], staleDays, short:s.short || s.label, blurb:s.blurb || `Saved knowledge from ${s.label}.`};
  });
  const port = Number(input.port ?? 4640);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Use a port between 1024 and 65535.');
  const maxNodes = Number(input.maxNodes ?? 3000);
  if (!Number.isInteger(maxNodes) || maxNodes < 1 || maxNodes > 10000) throw new Error('maxNodes must be between 1 and 10000.');
  return {...input, version:1, name, root:String(input.root || '../..'), port, maxNodes, sources};
}
export function expandPath(value, root) {
  if (value === '~') return os.homedir();
  if (/^~[/\\]/.test(value)) return path.resolve(os.homedir(),value.slice(2));
  return path.resolve(root,value);
}
