import { promises as fs } from 'node:fs';
import path from 'node:path';

// Read only the curated memory store, never session logs, credentials, or git internals.
export async function readCodexMemories(root) {
  const records = [];
  async function read(relative, kind, sections = false) {
    const file = path.join(root, relative);
    let body, stat;
    try { [body, stat] = await Promise.all([fs.readFile(file, 'utf8'), fs.stat(file)]); }
    catch (err) { if (err.code === 'ENOENT') return; throw err; }
    const lines = body.split(/\r?\n/);
    const starts = sections ? lines.flatMap((line, i) => /^# Task Group: /.test(line) ? [i] : []) : [];
    if (starts.length) {
      starts.forEach((start, i) => {
        const end = starts[i + 1] ?? lines.length;
        records.push({ file, relative, kind, body: lines.slice(start, end).join('\n'),
          title: lines[start].replace(/^# Task Group: /, ''), startLine: start + 1, endLine: end, mtime: stat.mtimeMs });
      });
    } else records.push({ file, relative, kind, body, mtime: stat.mtimeMs });
  }
  async function walk(relative, kind) {
    let entries;
    try { entries = await fs.readdir(path.join(root, relative), { withFileTypes: true }); }
    catch (err) { if (err.code === 'ENOENT') return; throw err; }
    for (const e of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (e.name.startsWith('.')) continue;
      const child = path.join(relative, e.name);
      if (e.isDirectory()) await walk(child, kind);
      else if (e.isFile() && e.name.endsWith('.md')) await read(child, kind);
    }
  }
  await read('memory_summary.md', 'reference');
  await read('MEMORY.md', 'reference', true);
  await walk('rollout_summaries', 'recollection');
  await walk('skills', 'reference');
  await walk(path.join('extensions', 'ad_hoc', 'notes'), 'note');
  return records;
}
