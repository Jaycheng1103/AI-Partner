// A connectivity replay, not an invented historical timeline. Every branch is
// backed by an existing graph edge; disconnected notes start their own roots.
export function planGrowth(nodes, links) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const adjacent = new Map(nodes.map((n) => [n.id, []]));
  const idOf = (value) => typeof value === 'object' ? value.id : value;
  for (const link of links) {
    const a = idOf(link.source), b = idOf(link.target);
    if (!byId.has(a) || !byId.has(b)) continue;
    adjacent.get(a).push({id:b, link}); adjacent.get(b).push({id:a, link});
  }
  const ranked = [...nodes].sort((a,b) => (b.source === 'wiki') - (a.source === 'wiki') || (b.degree || 0) - (a.degree || 0) || a.id.localeCompare(b.id));
  for (const list of adjacent.values()) list.sort((a,b) => (byId.get(b.id).degree || 0) - (byId.get(a.id).degree || 0) || a.id.localeCompare(b.id));
  const seen = new Set(), records = [], byNode = new Map();
  const append = (node, parent = null, link = null) => {
    const record = {node, parent, link, index:records.length, home:{x:node.x,y:node.y,z:node.z}, born:0, origin:null};
    records.push(record); byNode.set(node.id,record); seen.add(node.id);
    return record;
  };
  for (const seed of ranked) {
    if (seen.has(seed.id)) continue;
    const queue = [append(seed)];
    for (let q = 0; q < queue.length; q++) {
      const parent = queue[q];
      const available = adjacent.get(parent.node.id).filter((item) => !seen.has(item.id));
      // A few new branches at a time avoids a giant star exploding from one hub.
      for (const next of available.slice(0,3)) queue.push(append(byId.get(next.id), parent, next.link));
      if (available.length > 3) queue.push(parent);
    }
  }
  records.forEach((record,i) => {
    record.born = i === 0 ? 0 : i === 1 ? 1.2 : i === 2 ? 2.4 : 3 + 23 * Math.pow((i-2) / Math.max(1, records.length-3), .62);
  });
  return {records, byNode, treeLinks:new Set(records.map((r) => r.link).filter(Boolean)), duration:29};
}

export function growthPosition(record, t) {
  const age = Math.max(0, t-record.born);
  const u = Math.min(1, age/1.6);
  const spring = u >= 1 ? 1 : 1 - Math.exp(-5*u) * Math.cos(7*u);
  const spread = .17 + .83 * Math.min(1,t/26);
  const origin = record.origin || {x:0,y:0,z:0};
  const progress = record.index === 0 ? Math.min(1,t/18) : spring;
  return Object.fromEntries(['x','y','z'].map((axis) => [axis, origin[axis] + (record.home[axis]*spread - origin[axis])*progress]));
}
