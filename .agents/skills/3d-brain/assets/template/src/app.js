// Portable 3D Brain: client.
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import { composeGlobe, makeOrbitals } from './constellation.js';
import { planGrowth, growthPosition } from './growth.js';

const $ = (id) => document.getElementById(id);
const DAY = 86400000;
const params = new URLSearchParams(location.search);

const KIND_LABEL = {
  meeting: 'meeting sync', entity: 'company / product', person: 'person', concept: 'concept', page: 'page', document: 'source document',
  sync: 'recurring sync', qa: 'Q&A', 'all-hands': 'all hands', planning: 'planning session', interview: 'interview', call: 'call', community: 'community call', recording: 'recording', series: 'meeting series',
  video: 'video', tool: 'tool', technique: 'technique', comparison: 'comparison',
  feedback: 'feedback memory', project: 'project memory', reference: 'reference memory', user: 'about you', note: 'note',
  recollection: 'session recap',
  app: 'app / tool', business: 'business & ops', bucket: 'skill output', skill: 'skill', agent: 'agent', other: 'project',
};
const FLAG_TEXT = {
  stale: (n, s) => `Stale: last touched ${ago(n.updated)} (threshold ${s.staleDays} days)`,
  quiet: (n) => `Quiet: no file changes for ${n.ageDays} days. Archive or revive.`,
  orphan: () => 'Orphan: nothing links here and it links to nothing',
  stub: (n) => `Stub: only ${n.words} words`,
  'broken-links': (n) => (n.broken.length === 1 ? '1 link points at a page that does not exist' : `${n.broken.length} links point at pages that do not exist`),
  'missing-folder': () => 'Listed in the index but the folder is missing',
  'not-ingested': () => 'Transcript only: no wiki write-up yet. Ingest it or leave it as a record.',
  archived: () => 'Marked archived in its frontmatter',
};

let graph;               // ForceGraph3D instance
let data;                // graph.json
let nodesById = new Map();
let neighborsOf = new Map();  // id -> Set(id)
let linksOf = new Map();      // id -> [link]
let sourceById = {};
let activeSources = new Set();
let attentionOnly = false;
let allLabels = false;
let selected = null;
let hovered = null;
let highlightNodes = new Set();
let highlightLinks = new Set();
let hubLabelIds = new Set();
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let autoRotate = !motionPreference.matches;
let demo = false, demoNode = null, demoStep = -1, elapsed = 0;
let growth = null, growthTime = 0, growthVisible = -1, growthLastPaint = -1;
let growthCameraManual = false;
let cinematic = false;
const ambientLinks = new Set(), quietLinks = new Set(), particleLinks = new Set();
let idleTimer = null;
let searchIndex = [];
let searchActive = -1;
let bloomPass = null;

// ---------- utils ----------

function ago(ts) {
  if (!ts) return 'unknown';
  const d = Math.round((Date.now() - ts) / DAY);
  if (d <= 0) return 'today';
  if (d === 1) return 'yesterday';
  if (d < 30) return `${d} days ago`;
  if (d < 365) return `${Math.round(d / 30)} mo ago`;
  return `${(d / 365).toFixed(1)} y ago`;
}
function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toISOString().slice(0, 10);
}
function num(n) {
  return n == null ? '' : Number(n).toLocaleString('en-US');
}
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function toast(msg, ms = 2200) {
  const el = $('toast');
  el.textContent = msg;
  el.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { el.hidden = true; }, ms);
}
function colorOf(n) {
  return sourceById[n.source]?.color || '#ffffff';
}
function endNode(v) {
  return typeof v === 'object' && v ? v : nodesById.get(v);
}
function linkVisible(l) {
  const a = endNode(l.source);
  const b = endNode(l.target);
  return !!(a && b && isVisible(a) && isVisible(b));
}
function isVisible(n) {
  if (!n) return false;
  if (!activeSources.has(n.source)) return false;
  if (attentionOnly && !(n.flags && n.flags.length)) return false;
  return true;
}
function radiusOf(n) {
  let r = 2.2 + Math.sqrt(n.degree || 0) * 0.85;
  if (n.kind === 'meeting') r *= 0.7;
  if (n.source === 'meeting' && n.kind !== 'series') r = Math.min(r, 5.5);
  if (n.kind === 'series') r = Math.max(r, 8);
  if (n.kind === 'video') r *= 1.05;
  return Math.min(r, 11);
}

// ---------- load ----------

async function main() {
  const res = await fetch('/api/graph');
  data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Could not load the brain.');
  const brainName = data.brain.name;
  document.title = brainName;
  document.querySelector('.brand-name').textContent = brainName;
  document.querySelector('.splash-title').textContent = brainName;
  document.querySelector('.mode-label').textContent = brainName.toUpperCase() + ' / 3D';
  $('visible-status').textContent = data.warnings?.length ? data.warnings.length + ' source ' + (data.warnings.length === 1 ? 'notice' : 'notices') + ' in inventory' : 'Local knowledge · connected';
  for (const s of data.sources) sourceById[s.id] = s;
  activeSources = new Set(data.sources.map((s) => s.id));
  for (const n of data.nodes) nodesById.set(n.id, n);
  for (const n of data.nodes) { neighborsOf.set(n.id, new Set()); linksOf.set(n.id, []); }
  for (const l of data.links) {
    neighborsOf.get(l.source)?.add(l.target);
    neighborsOf.get(l.target)?.add(l.source);
    linksOf.get(l.source)?.push(l);
    linksOf.get(l.target)?.push(l);
  }
  pickHubLabels();
  buildSearchIndex();
  renderLegend();
  renderInventory();
  $('brand-meta').textContent = `${num(data.nodes.length)} notes · ${num(data.links.length)} connections`;
  $('splash-stats').textContent = `${num(data.nodes.length)} notes · ${num(data.links.length)} connections · ${data.sources.length} sources`;
  $('total-notes').textContent = num(data.nodes.length);
  $('total-sources').textContent = data.sources.length;
  $('total-links').textContent = num(data.links.length);
  composeGlobe(data.nodes, data.sources);
  data.links.forEach((l, i) => {
    const a = nodesById.get(l.source), b = nodesById.get(l.target);
    const distance = Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
    if (distance < 220 || i % 29 === 0) quietLinks.add(l);
    if (i % 173 === 0) ambientLinks.add(l);
  });
  initGraph();
  wireUi();
  const wanted = params.get('node');
  if (wanted && nodesById.has(wanted)) setTimeout(() => selectNode(nodesById.get(wanted)), 2600);
}

function pickHubLabels() {
  for (const s of data.sources) {
    const top = data.nodes.filter((n) => n.source === s.id).sort((a,b) => b.degree - a.degree).slice(0, 1);
    for (const n of top) hubLabelIds.add(n.id);
  }
}

// ---------- graph ----------

function initGraph() {
  const el = $('graph');
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = '0';
  labelRenderer.domElement.style.pointerEvents = 'none';

  graph = new ForceGraph3D(el, {
    controlType: 'orbit',
    rendererConfig: { antialias: true, alpha: false, powerPreference: 'high-performance' },
    extraRenderers: [labelRenderer],
  });

  graph
    .width(innerWidth)
    .height(innerHeight)
    .backgroundColor('#000001')
    .showNavInfo(false)
    .nodeLabel(() => '')
    .nodeThreeObject(makeNodeObject)
    .nodeThreeObjectExtend(false)
    .nodeVisibility(displayNode)
    .linkVisibility(displayLink)
    .linkColor(linkColor)
    .linkOpacity(1)
    .linkWidth(0)
    .linkDirectionalParticles(particlesFor)
    .linkDirectionalParticleWidth(1.6)
    .linkDirectionalParticleSpeed(0.006)
    .linkDirectionalParticleColor(() => '#ffffff')
    .onNodeClick((n) => { if (!demo || growth?.complete) selectNode(n); })
    .onNodeHover(onHover)
    .onBackgroundClick(() => { if (selected) clearSelection(); })
    .enableNodeDrag(false)
    .warmupTicks(0)
    .cooldownTicks(0)
    .d3AlphaDecay(0.022)
    .d3VelocityDecay(0.32);

  graph.d3Force('charge', null);
  graph.d3Force('center', null);
  const linkForce = graph.d3Force('link');
  const defaultStrength = linkForce.strength();
  linkForce
    .distance((l) => (l.kind === 'bridge' ? 140 : l.kind === 'mention' || l.kind === 'attended' ? 110 : l.kind === 'series' ? 30 : 36))
    .strength(0);

  graph.graphData({ nodes: data.nodes, links: data.links });
  window.__brain = { graph, data, THREE, select: (id) => selectNode(nodesById.get(id)) };

  // Scene dressing
  const scene = graph.scene();
  scene.add(makeStarfield());
  const orbitals = makeOrbitals(scene);
  graph.renderer().setPixelRatio(Math.min(devicePixelRatio, 1.6));
  graph.renderer().outputColorSpace = THREE.SRGBColorSpace;
  scene.fog = new THREE.FogExp2(0x05070d, 0.00015);

  // Bloom
  if (params.get('bloom') !== '0') {
    bloomPass = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.45, 0.45, 0.65);
    graph.postProcessingComposer().addPass(bloomPass);
  }

  // Camera intro
  const controls = graph.controls();
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = 0.45;
  controls.minDistance = 25;
  controls.maxDistance = 3000;
  graph.cameraPosition({ x: 0, y: 90, z: overviewDistance() * (autoRotate ? 1.3 : 1) });
  setTimeout(() => graph.cameraPosition({ x: 0, y: 55, z: overviewDistance() }, { x: 0, y: 0, z: 0 }, autoRotate ? 2200 : 0), 250);
  setTimeout(() => { $('splash').classList.add('hide'); setTimeout(() => $('splash').remove(), 1000); }, 2300);

  controls.addEventListener('start', () => {
    controls.autoRotate = false; clearTimeout(idleTimer);
    if (demo && !growth?.complete) growthCameraManual = true;
  });
  controls.addEventListener('end', scheduleAutoRotate);

  window.addEventListener('resize', () => {
    graph.width(innerWidth).height(innerHeight);
    if (bloomPass) bloomPass.setSize(innerWidth, innerHeight);
    if (!selected) graph.cameraPosition({ x: 0, y: 55, z: overviewDistance() }, {x: 0, y: 0, z: 0}, 0);
  });

  let previous = performance.now();
  function animate(now) {
    const dt = Math.min((now - previous) / 1000, .05); previous = now;
    if (autoRotate && !motionPreference.matches && !document.hidden) elapsed += dt;
    orbitals.update(elapsed, !!selected || !!hovered, demo && !growth?.complete ? Math.max(0,(growthTime-8)/20) : 1);
    if (now - lastLabelPass > 180) { declutterLabels(); lastLabelPass = now; }
    if (demo && autoRotate) updateDemo();
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
  $('btn-rotate').setAttribute('aria-pressed', String(autoRotate));

  el.addEventListener('mousemove', (e) => {
    const hl = $('hover-label');
    if (!hl.hidden) { hl.style.left = `${e.clientX}px`; hl.style.top = `${e.clientY}px`; }
  });
}

function scheduleAutoRotate() {
  clearTimeout(idleTimer);
  if (!autoRotate) return;
  idleTimer = setTimeout(() => { if (autoRotate && !selected) graph.controls().autoRotate = true; }, 5000);
}

function overviewDistance() { return innerWidth < 700 ? Math.max(1750, innerHeight / innerWidth * 1350) : 1500; }
function displayNode(n) { return isVisible(n) && (!demo || !growth || (growth.byNode.get(n.id)?.born ?? Infinity) <= growthTime); }
function displayLink(l) {
  if (!linkVisible(l)) return false;
  if (demo && growth && !growth.complete) {
    const a = growth.byNode.get(endNode(l.source).id), b = growth.byNode.get(endNode(l.target).id);
    if (!a || !b || Math.max(a.born,b.born) > growthTime) return false;
    const age = growthTime - Math.max(a.born,b.born);
    return (growth.treeLinks.has(l) && (age < 4 || growthVisible < 20)) || (growthTime > 13 && quietLinks.has(l));
  }
  return highlightLinks.has(l) || (!selected && !hovered && !demoNode && quietLinks.has(l));
}
function particlesFor(l) {
  if (!autoRotate || !displayLink(l)) return 0;
  if (demo && growth && !growth.complete) {
    const child = Math.max(growth.byNode.get(endNode(l.source).id)?.index || 0, growth.byNode.get(endNode(l.target).id)?.index || 0);
    return growth.treeLinks.has(l) && child > growthVisible - 22 ? 1 : 0;
  }
  return particleLinks.has(l) ? 2 : (!selected && !hovered && !demoNode && ambientLinks.has(l) ? 1 : 0);
}

let lastLabelPass = 0;
function declutterLabels() {
  // CSS2DRenderer cannot remove nested DOM labels after their graph group has
  // already been detached. Only keep wrappers belonging to current live nodes.
  const liveWrappers = new Set(data.nodes.filter((n) => displayNode(n) && n.__label?.visible && n.__label.parent?.parent).map((n) => n.__label.element));
  for (const span of $('graph').querySelectorAll('.node-label')) {
    if (!liveWrappers.has(span.parentElement)) span.parentElement?.remove();
  }
  const accepted = [];
  const center = selected || hovered || demoNode;
  const candidates = data.nodes.filter((n) => n.__label?.visible).sort((a,b) => (b === center ? 100000 : b.degree) - (a === center ? 100000 : a.degree));
  for (const n of candidates) {
    const r = n.__labelEl.getBoundingClientRect();
    const overlaps = accepted.some((a) => r.left < a.right + 8 && r.right > a.left - 8 && r.top < a.bottom + 5 && r.bottom > a.top - 5);
    const show = allLabels || (!overlaps && r.top > 82 && r.bottom < innerHeight - 90 && r.left > 8 && r.right < innerWidth - 8);
    n.__labelEl.style.visibility = show ? 'visible' : 'hidden';
    if (show) accepted.push(r);
  }
}

function makeStarfield() {
  const count = 900;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 1400 + Math.random() * 1600;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    pos[i * 3] = r * Math.sin(p) * Math.cos(t);
    pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    pos[i * 3 + 2] = r * Math.cos(p);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0x9fb8ff, size: 1.4, sizeAttenuation: true, transparent: true, opacity: 0.32, depthWrite: false });
  return new THREE.Points(geo, mat);
}

const sphereGeo = new THREE.SphereGeometry(1, 18, 14);
const haloGeo = new THREE.SphereGeometry(1, 12, 10);

function makeNodeObject(n) {
  if (n.__label) {
    n.__label.element.remove();
    n.__label.removeFromParent();
  }
  const group = new THREE.Group();
  const color = new THREE.Color(colorOf(n));
  const r = radiusOf(n);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95 });
  const mesh = new THREE.Mesh(sphereGeo, mat);
  mesh.scale.setScalar(r);
  group.add(mesh);
  const haloMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.07, depthWrite: false });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  halo.scale.setScalar(r * 1.5);
  group.add(halo);

  // CSS2DRenderer owns the wrapper's transform and display, so the styled text
  // lives on an inner span and visibility is driven by the object's .visible.
  const wrap = document.createElement('div');
  wrap.style.pointerEvents = 'none';
  const span = document.createElement('span');
  span.className = 'node-label';
  span.textContent = n.title;
  span.style.cssText = `display:block;color:#fff;font:500 12px 'DM Sans',system-ui,sans-serif;letter-spacing:.01em;white-space:nowrap;text-shadow:0 0 6px #000,0 0 14px #000,0 1px 2px #000;opacity:.92;transform:translateY(-${Math.round(r + 12)}px);transition:opacity 160ms;`;
  wrap.appendChild(span);
  const label = new CSS2DObject(wrap);
  label.position.set(0, 0, 0);
  label.visible = false;
  group.add(label);
  n.__labelEl = span;

  n.__mesh = mesh;
  n.__halo = halo;
  n.__label = label;
  n.__r = r;
  applyNodeStyle(n);
  return group;
}

function applyNodeStyle(n) {
  if (!n.__mesh) return;
  const anySel = !!selected || !!hovered || !!demoNode;
  const on = highlightNodes.has(n.id);
  const isSel = selected && selected.id === n.id;
  const dim = anySel && !on && !(demoNode && n.source === demoNode.source);
  n.__mesh.material.opacity = dim ? 0.19 : isSel ? 1 : on && anySel ? 0.95 : 0.9;
  n.__halo.material.opacity = dim ? 0.0 : isSel ? 0.22 : on ? 0.05 : 0.06;
  const scale = isSel ? 1.5 : on && anySel ? 1.15 : 1;
  n.__mesh.scale.setScalar(n.__r * scale);
  n.__halo.scale.setScalar(n.__r * 1.5 * scale);
  const showLabel = displayNode(n) && (!demo || growth?.complete) && (
    allLabels
    || isSel
    || (hovered && hovered.id === n.id)
    || (anySel ? on && (n.__labelOk !== false) : hubLabelIds.has(n.id))
  );
  n.__label.visible = !!showLabel;
  n.__labelEl.style.display = showLabel ? 'block' : 'none';
  n.__labelEl.style.fontWeight = isSel ? '600' : '500';
  n.__labelEl.style.fontSize = isSel ? '14px' : hubLabelIds.has(n.id) && !anySel ? '13px' : '12px';
  n.__labelEl.style.opacity = dim ? '0' : '.94';
}

function restyleAll() {
  for (const n of data.nodes) applyNodeStyle(n);
  graph.linkColor(linkColor);
  graph.linkVisibility(displayLink);
  graph.linkDirectionalParticles(particlesFor);
}

function linkColor(l) {
  if (demo && growth && !growth.complete) return hexToRgba(colorOf(endNode(l.target)), growth.treeLinks.has(l) ? .42 : .065);
  const anySel = !!selected || !!hovered || !!demoNode;
  if (anySel) {
    if (highlightLinks.has(l)) {
      const from = endNode(l.source);
      const to = endNode(l.target);
      return hexToRgba(colorOf(selected && from.id === selected.id ? from : to), 0.48);
    }
    return 'rgba(140,160,200,0.035)';
  }
  if (l.kind === 'bridge') return 'rgba(170,220,255,0.12)';
  return hexToRgba(colorOf(endNode(l.source)), 0.085);
}

function computeHighlight(center) {
  highlightNodes = new Set();
  highlightLinks = new Set();
  particleLinks.clear();
  if (!center) return;
  highlightNodes.add(center.id);
  const links = linksOf.get(center.id) || [];
  // Label budget: neighbors with the highest degree get labels, the rest stay quiet.
  const neigh = [...(neighborsOf.get(center.id) || [])].map((id) => nodesById.get(id)).filter(isVisible);
  neigh.sort((a, b) => b.degree - a.degree);
  neigh.forEach((n, i) => { n.__labelOk = i < 9; highlightNodes.add(n.id); });
  const visibleLinks = links.filter(linkVisible);
  for (const l of visibleLinks.slice(0, 72)) highlightLinks.add(l);
  for (const l of visibleLinks.slice(0, 24)) particleLinks.add(l);
}

// ---------- selection ----------

function selectNode(n, { fly = true } = {}) {
  if (!n) return;
  stopDemo();
  if (!isVisible(n)) { activeSources.add(n.source); attentionOnly = false; $('toggle-attention').checked = false; syncLegend(); applyVisibility(); }
  selected = n;
  hovered = null;
  $('hover-label').hidden = true;
  computeHighlight(n);
  restyleAll();
  renderDrawer(n);
  if (fly) flyTo(n);
  history.replaceState(null, '', `?node=${encodeURIComponent(n.id)}`);
}

function clearSelection() {
  selected = null;
  computeHighlight(demoNode);
  restyleAll();
  $('drawer').hidden = true;
  history.replaceState(null, '', location.pathname);
}

function flyTo(n) {
  const dist = 200 + radiusOf(n) * 10 + Math.min(n.degree || 0, 300) * 1.1;
  const r = Math.hypot(n.x, n.y, n.z) || 1;
  const cam = graph.camera().position;
  let dir;
  if (r > 40) dir = { x: n.x / r, y: n.y / r, z: n.z / r };
  else {
    const cr = Math.hypot(cam.x, cam.y, cam.z) || 1;
    dir = { x: cam.x / cr, y: cam.y / cr, z: cam.z / cr };
  }
  graph.cameraPosition({ x: n.x + dir.x * dist, y: n.y + dir.y * dist * 0.6 + 10, z: n.z + dir.z * dist }, { x: n.x, y: n.y, z: n.z }, motionPreference.matches ? 0 : 1100);
  const controls = graph.controls();
  controls.autoRotate = false;
  scheduleAutoRotate();
}

function resetView() {
  clearSelection();
  stopDemo();
  graph.cameraPosition({ x: 0, y: 55, z: overviewDistance() }, { x: 0, y: 0, z: 0 }, motionPreference.matches ? 0 : 1200);
  scheduleAutoRotate();
}

function onHover(n) {
  if (demo && !growth?.complete) return;
  const hl = $('hover-label');
  if (n && (!selected || n.id !== selected.id)) {
    hl.innerHTML = `<b>${esc(n.title)}</b><span>${esc(sourceById[n.source].label)} · ${esc(KIND_LABEL[n.kind] || n.kind)}${n.updated ? ' · ' + esc(ago(n.updated)) : ''}${n.flags?.length ? ' · needs attention' : ''}</span>`;
    hl.hidden = false;
    document.body.style.cursor = 'pointer';
  } else {
    hl.hidden = true;
    document.body.style.cursor = '';
  }
  if (selected) return; // selection owns the highlight
  hovered = n || null;
  computeHighlight(hovered);
  restyleAll();
}

// ---------- drawer ----------

function renderDrawer(n) {
  const src = sourceById[n.source];
  const d = $('drawer');
  d.hidden = false;
  $('inventory').hidden = true;
  const ds = $('d-source');
  ds.textContent = `${src.label} · ${KIND_LABEL[n.kind] || n.kind}`;
  ds.style.setProperty('--c', src.color);
  $('d-title').textContent = n.title;

  const meta = [];
  if (n.updated) meta.push(`<span>updated <b>${fmtDate(n.updated)}</b> (${ago(n.updated)})</span>`);
  if (n.created && n.created !== n.updated) meta.push(`<span>created <b>${fmtDate(n.created)}</b></span>`);
  if (n.words) meta.push(`<span><b>${num(n.words)}</b> words</span>`);
  meta.push(`<span><b>${n.degree}</b> connections</span>`);
  if (n.views != null) meta.push(`<span><b>${num(n.views)}</b> views</span>`);
  if (n.likes != null) meta.push(`<span><b>${num(n.likes)}</b> likes</span>`);
  if (n.channel) meta.push(`<span>${esc(n.channel)}</span>`);
  if (n.source === 'meeting' && n.kind !== 'series') {
    if (n.meetingDate) meta.unshift(`<span>held <b>${fmtDate(n.meetingDate)}</b> (${ago(n.meetingDate)})</span>`);
    if (n.seriesGroup || n.series) meta.push(`<span>series <b>${esc(n.seriesGroup || n.series)}</b></span>`);
    if (n.duration) meta.push(`<span><b>${n.duration}</b> min</span>`);
    if (n.transcriptWords) meta.push(`<span>transcript <b>${num(n.transcriptWords)}</b> words</span>`);
    meta.push(`<span>${n.ingested ? 'written up in the wiki' : 'transcript only'}</span>`);
    if (n.participants?.length) meta.push(`<span>with <b>${esc(n.participants.slice(0, 8).join(', ') || 'Not listed')}</b></span>`);
  }
  if (n.kind === 'series') meta.push(`<span><b>${(n.seriesMembers || []).length}</b> meetings</span><span><b>${n.ingestedCount || 0}</b> written up</span>`);
  if (n.published && n.kind === 'video') meta.push(`<span>published <b>${fmtDate(n.published)}</b></span>`);
  if (n.status) meta.push(`<span>status <b>${esc(n.status)}</b></span>`);
  if (n.confidence) meta.push(`<span>confidence <b>${esc(n.confidence)}</b></span>`);
  if (n.model) meta.push(`<span>model <b>${esc(n.model)}</b></span>`);
  if (n.tags?.length) meta.push(`<span>${n.tags.slice(0, 6).map((t) => '#' + esc(t)).join(' ')}</span>`);
  $('d-meta').innerHTML = meta.join('');

  const flags = (n.flags || []).map((f) => `<span class="flag" title="${esc(f)}">${esc(FLAG_TEXT[f] ? FLAG_TEXT[f](n, src) : f)}</span>`);
  if (!flags.length) flags.push('<span class="flag ok">Healthy: linked, current, and complete</span>');
  $('d-flags').innerHTML = flags.join('');

  $('d-summary').textContent = n.summary || '';

  const ob = $('d-obsidian');
  if (src.obsidianVault) { ob.hidden = false; ob.href = `obsidian://open?vault=${encodeURIComponent(src.obsidianVault)}&file=${encodeURIComponent(n.relativePath || n.path)}`; }
  else ob.hidden = true;
  const yt = $('d-youtube');
  if (n.url) { yt.hidden = false; yt.href = n.url; } else yt.hidden = true;
  const tr = $('d-transcript');
  tr.hidden = !n.transcriptPath;
  tr.textContent = 'Read transcript';
  $('d-read').hidden = n.kind === 'series' || (n.source === 'meeting' && !n.ingested);
  $('d-reveal').hidden = n.kind === 'series';

  // connections grouped by source
  const groups = {};
  for (const l of linksOf.get(n.id) || []) {
    const otherId = (typeof l.source === 'object' ? l.source.id : l.source) === n.id ? (typeof l.target === 'object' ? l.target.id : l.target) : (typeof l.source === 'object' ? l.source.id : l.source);
    const o = nodesById.get(otherId);
    if (!o) continue;
    (groups[o.source] ||= []).push({ node: o, kind: l.kind });
  }
  $('d-conn-count').textContent = String(n.degree);
  const parts = [];
  for (const s of data.sources) {
    const list = groups[s.id];
    if (!list) continue;
    list.sort((a, b) => b.node.degree - a.node.degree);
    const rows = list.slice(0, 40).map((c) => `<div class="conn" data-id="${esc(c.node.id)}"><span>${esc(c.node.title)}</span><span class="conn-kind">${c.kind === 'link' ? esc(KIND_LABEL[c.node.kind] || c.node.kind) : esc(c.kind)}</span></div>`);
    if (list.length > 40) rows.push(`<div class="conn muted"><span>… and ${list.length - 40} more</span></div>`);
    parts.push(`<div class="conn-group"><div class="conn-group-title"><i style="background:${s.color}"></i>${esc(s.label)} (${list.length})</div>${rows.join('')}</div>`);
  }
  $('d-connections').innerHTML = parts.join('') || '<div class="muted small-text">No connections. Link it from another note or it will stay invisible to retrieval.</div>';

  const bw = $('d-broken-wrap');
  if (n.broken?.length) {
    bw.hidden = false;
    $('d-broken-count').textContent = String(n.broken.length);
    $('d-broken').innerHTML = n.broken.map((b) => `<span>[[${esc(b)}]]</span>`).join('');
  } else bw.hidden = true;

  $('d-content-wrap').hidden = true;
  $('d-content').innerHTML = '';
  $('d-read').textContent = 'Read note';
  shownPart = null;
  d.querySelector('.drawer-scroll').scrollTop = 0;
}

let shownPart = null;
async function readNote(n, part = 'note') {
  const wrap = $('d-content-wrap');
  const btn = part === 'transcript' ? $('d-transcript') : $('d-read');
  const label = part === 'transcript' ? 'Read transcript' : 'Read note';
  if (!wrap.hidden && shownPart === part) { wrap.hidden = true; shownPart = null; btn.textContent = label; return; }
  $('d-read').textContent = 'Read note';
  $('d-transcript').textContent = 'Read transcript';
  btn.textContent = 'Loading…';
  const res = await fetch(`/api/node?id=${encodeURIComponent(n.id)}${part === 'transcript' ? '&part=transcript' : ''}`);
  const body = await res.json();
  let md = body.markdown || '';
  let fmBlock = '';
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end > 0) { fmBlock = md.slice(4, end).trim(); md = md.slice(end + 4); }
  }
  md = md.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (m, target, alias) => {
    const t = resolveLink(n, target.trim());
    const text = esc(alias || target);
    return t ? `<a class="wikilink" data-id="${esc(t.id)}">${text}</a>` : `<a class="wikilink dead" title="no page named ${esc(target)}">${text}</a>`;
  });
  let html = '';
  try { html = marked.parse(md, { gfm: true, breaks: false }); } catch { html = `<pre>${esc(md)}</pre>`; }
  // Saved memory may contain HTML/code examples. Render text without executing it.
  $('d-content').innerHTML = DOMPurify.sanitize((fmBlock ? `<div class="frontmatter">${esc(fmBlock)}</div>` : '') + html, { FORBID_TAGS: ['img', 'iframe', 'form', 'style'] });
  for (const anchor of $('d-content').querySelectorAll('a[href]')) {
    const href = anchor.getAttribute('href');
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//') || href.startsWith('#')) continue;
    const target = resolveLink(n, href.split('#')[0]);
    anchor.removeAttribute('href');
    anchor.classList.add('wikilink');
    if (target) anchor.dataset.id = target.id;
    else { anchor.classList.add('dead'); anchor.title = 'Target is outside the selected graph or unresolved'; }
  }
  $('d-path').textContent = body.path || n.path;
  wrap.hidden = false;
  shownPart = part;
  btn.textContent = part === 'transcript' ? 'Hide transcript' : 'Hide note';
  wrap.scrollIntoView({ behavior: motionPreference.matches ? 'instant' : 'smooth', block: 'start' });
}

function resolveLink(from, target) {
  if (Object.prototype.hasOwnProperty.call(from.linkTargets || {}, target)) return nodesById.get(from.linkTargets[target]) || null;
  const s = slugify(target);
  const candidates = data.nodes.filter(n => [n.slug,n.title,n.relativePath].some(v => v && slugify(v) === s));
  const local = candidates.filter(n => n.source === from.source);
  return local.length === 1 ? local[0] : candidates.length === 1 ? candidates[0] : null;
}
function slugify(v) {
  return String(v).toLowerCase().replace(/\.md$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ---------- legend ----------

function renderLegend() {
  const counts = {};
  for (const n of data.nodes) counts[n.source] = (counts[n.source] || 0) + 1;
  $('legend-items').innerHTML = data.sources.map((s) => `
    <button class="legend-item" data-source="${s.id}" aria-pressed="true" title="${esc(s.blurb)}">
      <span class="legend-swatch" style="background:${s.color};color:${s.color}"></span>
      <span class="legend-label">${esc(s.label)}</span>
      <span class="legend-count">${num(counts[s.id] || 0)}</span>
    </button>`).join('');
  $('legend-items').addEventListener('click', (e) => {
    const item = e.target.closest('.legend-item');
    if (!item) return;
    const id = item.dataset.source;
    if (e.altKey || e.shiftKey) {
      // solo
      activeSources = new Set([id]);
    } else if (activeSources.has(id) && activeSources.size === 1) {
      activeSources = new Set(data.sources.map((s) => s.id));
    } else if (activeSources.has(id)) {
      activeSources.delete(id);
    } else activeSources.add(id);
    syncLegend();
    applyVisibility();
  });
}
function syncLegend() {
  for (const el of document.querySelectorAll('.legend-item')) {
    el.classList.toggle('off', !activeSources.has(el.dataset.source));
    el.setAttribute('aria-pressed', String(activeSources.has(el.dataset.source)));
  }
}
function applyVisibility() {
  stopDemo();
  if (selected && !isVisible(selected)) clearSelection();
  if (hovered && !isVisible(hovered)) hovered = null;
  computeHighlight(selected || hovered);
  graph.nodeVisibility(displayNode);
  restyleAll();
  $('visible-status').textContent = `${num(data.nodes.filter(isVisible).length)} notes in view`;
}

// ---------- inventory ----------

function renderInventory() {
  const inv = data.inventory;
  const srcs = Object.values(inv.bySource);
  $('inv-notices').textContent = (data.warnings || []).join('\n');
  $('inv-notices').hidden = !(data.warnings || []).length;
  $('inv-lede').textContent = `${num(inv.totals.nodes)} notes and ${num(inv.totals.links)} connections across ${srcs.length} stores, about ${num(Math.round(inv.totals.words / 1000))}k words. Click a store to view it alone. Every list below is clickable.`;

  $('inv-sources').innerHTML = srcs.map((s) => {
    const kinds = Object.entries(s.kinds).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span>${v} ${esc(KIND_LABEL[k] || k)}</span>`).join('');
    return `<div class="inv-card" data-source="${s.id}" style="--c:${s.color}">
      <div class="inv-card-head"><i></i><b>${esc(s.label)}</b><span class="n">${num(s.count)}</span></div>
      <p>${esc(s.blurb)}</p>
      <div class="inv-kinds">${kinds}</div>
      <div class="inv-card-foot">
        <span>newest <b>${s.newest ? ago(s.newest) : '?'}</b></span>
        <span>oldest <b>${s.oldest ? ago(s.oldest) : '?'}</b></span>
        ${s.words ? `<span><b>${num(Math.round(s.words / 1000))}k</b> words</span>` : ''}
        <span class="${s.flagged ? 'warn' : ''}"><b>${s.flagged}</b> need attention</span>
        <span title="${esc(s.root)}">${esc(shortPath(s.root))}</span>
      </div>
    </div>`;
  }).join('');
  $('inv-sources').addEventListener('click', (e) => {
    const card = e.target.closest('.inv-card');
    if (!card) return;
    const id = card.dataset.source;
    activeSources = activeSources.size === 1 && activeSources.has(id) ? new Set(data.sources.map((s) => s.id)) : new Set([id]);
    syncLegend();
    applyVisibility();
    toast(activeSources.size === 1 ? `Showing only ${sourceById[id].label}` : 'Showing everything');
  });

  const yt = inv.youtube || {};
  if (yt.videos) {
    const pct = Math.round((yt.transcribed / yt.videos) * 100);
    $('inv-youtube').innerHTML = `
      <div class="section-head"><span>YouTube coverage</span><span class="count">${pct}% of the channel is in the brain</span></div>
      <div class="yt-grid">
        <div class="yt-tile"><div class="l">Channel videos</div><div class="v">${num(yt.videos)}</div><div class="m">${num(yt.subscribers)} subscribers</div></div>
        <div class="yt-tile"><div class="l">Transcribed</div><div class="v">${num(yt.transcribed)}</div><div class="m">pages in Video knowledge</div></div>
        <div class="yt-tile"><div class="l">Not ingested</div><div class="v">${num(yt.videos - yt.transcribed)}</div><div class="m">run /process-video</div></div>
      </div>
      <div class="coverage"><i style="width:${pct}%"></i></div>`;
  } else $('inv-youtube').hidden = true;

  const mt = inv.meetings;
  if (mt && mt.total) {
    const gapDays = mt.lastIngested ? Math.round((Date.now() - mt.lastIngested) / DAY) : null;
    const rows = mt.series.map((s) => `<div class="hrow" data-id="${esc(s.hub)}"><i style="background:var(--meeting)"></i><span class="t">${esc(s.series)}</span><span class="a">${s.total} · ${s.ingested} in wiki · ${s.first ? fmtDate(s.first).slice(0, 7) : ''} to ${s.last ? fmtDate(s.last).slice(0, 7) : ''}</span></div>`).join('');
    $('inv-meetings').innerHTML = `
      <div class="section-head"><span>Meetings</span><span class="count">${num(mt.total)} calls · ${num(Math.round(mt.minutes / 60))} hours</span></div>
      <div class="yt-grid">
        <div class="yt-tile"><div class="l">Written up</div><div class="v">${num(mt.ingested)}</div><div class="m">wiki pages with a transcript</div></div>
        <div class="yt-tile"><div class="l">Transcript only</div><div class="v">${num(mt.transcriptOnly)}</div><div class="m">no wiki page yet</div></div>
        <div class="yt-tile"><div class="l">Last write-up</div><div class="v">${gapDays == null ? '?' : gapDays + 'd'}</div><div class="m">${mt.lastIngested ? 'ago, ' + fmtDate(mt.lastIngested) : 'never'}</div></div>
      </div>
      <div class="coverage"><i style="width:${Math.round((mt.ingested / mt.total) * 100)}%;background:var(--meeting);box-shadow:0 0 12px var(--meeting)"></i></div>
      <p class="muted small-text" style="margin:10px 0 4px">${fmtDate(mt.first)} to ${fmtDate(mt.last)}. Each series below is a hub node in the graph; click to open it.</p>
      <div class="rows" style="max-height:none">${rows}</div>`;
  } else $('inv-meetings').hidden = true;

  const flagDefs = [
    ['not-ingested', 'Meetings without a write-up', 'Transcript is in the raw store but no wiki page exists. Ingest the ones that matter; the rest can stay as records.'],
    ['stale', 'Stale pages', 'Living pages not updated past their threshold. Re-read and refresh, or archive.'],
    ['quiet', 'Quiet projects', 'No file changes in 60 days. Move to archives/ and drop the index row, or pick it back up.'],
    ['broken-links', 'Broken links', 'No unambiguous target was found in the selected sources. Check the link or add the missing source.'],
    ['orphan', 'Orphans', 'Nothing points at these. Retrieval will never find them by following links.'],
    ['stub', 'Stubs', 'Under 60 words. Expand if useful, or archive.'],
    ['missing-folder', 'Missing folders', 'Listed in projects/_index.md but the folder is gone.'],
    ['archived', 'Marked archived', 'Frontmatter says archived; consider moving the file.'],
  ];
  let total = 0;
  $('inv-health').innerHTML = flagDefs.filter(([key]) => ['stale','orphan','stub','broken-links'].includes(key)).map(([key, title, blurb]) => {
    const ids = inv.flags[key] || [];
    if (!ids.length && !['stale', 'quiet', 'broken-links', 'orphan', 'not-ingested'].includes(key)) return '';
    total += ids.length;
    const rows = ids.map((id) => nodesById.get(id)).filter(Boolean)
      .sort((a, b) => (key === 'not-ingested' ? (b.updated || 0) - (a.updated || 0) : (a.updated || 0) - (b.updated || 0)))
      .map((n) => `<div class="hrow" data-id="${esc(n.id)}"><i style="background:${colorOf(n)}"></i><span class="t">${esc(n.title)}</span><span class="a">${key === 'broken-links' ? n.broken.length + ' dead' : key === 'not-ingested' ? fmtDate(n.meetingDate) : n.updated ? ago(n.updated) : ''}</span></div>`)
      .join('');
    return `<details class="health"><summary><span>${esc(title)}<small>${esc(blurb)}</small></span><span class="n ${ids.length ? '' : 'ok'}">${ids.length}</span></summary><div class="rows">${rows || '<div class="muted small-text" style="padding:6px 8px">Nothing here.</div>'}</div></details>`;
  }).join('');
  $('inv-attention-count').textContent = `${num(total)} items`;

  const nav = inv.navigation || [];
  $('inv-nav-count').textContent = String(nav.length);
  $('inv-nav').innerHTML = nav.map((n) => `<div class="nav-row" data-path="${esc(n.path)}"><span>${esc(n.title)}</span><span class="a">${esc(n.path.split('/').pop())} · ${n.updated ? ago(n.updated) : ''}</span></div>`).join('');

  $('inv-foot').innerHTML = `<span>graph built ${new Date(inv.generatedAt).toLocaleString()}</span><button class="link-btn" id="btn-rebuild">Rebuild from disk</button>`;
}

function shortPath(p) {
  const norm = String(p).split('\\').join('/');
  if (/\/\.claude\/projects\//.test(norm)) return '~/.claude/projects/…/memory';
  const parts = norm.split('/');
  return parts.length > 3 ? '…/' + parts.slice(-2).join('/') : norm;
}

// ---------- search ----------

function buildSearchIndex() {
  searchIndex = data.nodes.map((n) => ({
    n,
    title: n.title.toLowerCase(),
    hay: `${n.title} ${n.summary || ''} ${(n.tags || []).join(' ')} ${n.slug || ''} ${n.folder || ''}`.toLowerCase(),
  }));
}

function search(q) {
  q = q.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = [];
  for (const item of searchIndex) {
    let score = 0;
    for (const t of terms) {
      if (item.title === t) score += 60;
      else if (item.title.startsWith(t)) score += 30;
      else if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(item.title)) score += 20;
      else if (item.title.includes(t)) score += 12;
      else if (item.hay.includes(t)) score += 4;
      else { score = 0; break; }
    }
    if (score > 0) scored.push({ item, score: score + Math.min(item.n.degree, 40) / 10 });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 14).map((s) => s.item.n);
}

function renderSearch(list, q) {
  const box = $('search-results');
  if (!q.trim()) { box.hidden = true; return; }
  box.hidden = false;
  if (!list.length) { box.innerHTML = '<div class="result-empty">No notes match. Try a person, a tool, or a video title.</div>'; return; }
  box.innerHTML = list.map((n, i) => `
    <div class="result ${i === searchActive ? 'active' : ''}" data-id="${esc(n.id)}">
      <span class="result-dot" style="background:${colorOf(n)}"></span>
      <span><div class="result-title">${esc(n.title)}</div><div class="result-sub">${esc(n.summary || '')}</div></span>
      <span class="result-kind">${esc(KIND_LABEL[n.kind] || n.kind)}</span>
    </div>`).join('');
}

// ---------- ui wiring ----------

let demoStart = 0;
function stopDemo() {
  if (!demo) return;
  demo = false; demoNode = null; demoStep = -1;
  for (const record of growth?.records || []) {
    const n = record.node;
    n.x = n.fx = record.home.x; n.y = n.fy = record.home.y; n.z = n.fz = record.home.z;
  }
  growth = null;
  graph.controls().autoRotateSpeed = .45;
  graph.camera().position.setLength(overviewDistance());
  graph.cooldownTicks(0).nodeVisibility(displayNode).d3ReheatSimulation();
  $('btn-demo').textContent = 'Play demo';
  $('btn-demo').setAttribute('aria-pressed', 'false');
  $('demo-caption').hidden = true;
  document.body.classList.remove('demo-playing','growth-playing');
  computeHighlight(selected || hovered); restyleAll();
}
function toggleDemo() {
  if (demo && !growth?.complete) { stopDemo(); return; }
  if (demo) stopDemo();
  clearSelection(); hovered = null;
  $('inventory').hidden = true;
  const eligible = data.nodes.filter(isVisible);
  if (!eligible.length) { toast('Choose a source with notes to play its growth.'); return; }
  growth = planGrowth(eligible, data.links);
  demo = true; demoStart = elapsed - (motionPreference.matches ? growth.duration : 0); demoStep = -1;
  growthVisible = -1; growthTime = 0; growthLastPaint = -1;
  growthCameraManual = false;
  for (const {node} of growth.records) { node.x = node.fx = 0; node.y = node.fy = 0; node.z = node.fz = 0; }
  $('btn-demo').textContent = 'Stop demo';
  $('btn-demo').setAttribute('aria-pressed', 'true');
  $('demo-caption').hidden = false;
  document.body.classList.add('demo-playing','growth-playing');
  if (!autoRotate) setMotion(true);
  graph.cooldownTicks(Infinity).cooldownTime(Infinity).d3ReheatSimulation();
  graph.cameraPosition({x: 0, y: 25, z: overviewDistance()*.56}, {x:0,y:0,z:0}, 0);
  graph.controls().autoRotate = !motionPreference.matches;
  graph.controls().autoRotateSpeed = .18;
  updateDemo();
}
function updateDemo() {
  if (!growth || growth.complete) return;
  growthTime = Math.min(growth.duration, elapsed-demoStart);
  const live = growth.records.filter((r) => r.born <= growthTime);
  growthVisible = live.length;
  for (const r of live) {
    if (!r.origin) r.origin = r.parent ? {x:r.parent.node.x,y:r.parent.node.y,z:r.parent.node.z} : {x:0,y:0,z:0};
    const p = growthPosition(r,growthTime), n = r.node;
    n.x = n.fx = p.x; n.y = n.fy = p.y; n.z = n.fz = p.z;
    if (n.__mesh) {
      const appear = Math.min(1,Math.max(.05,(growthTime-r.born)/.6));
      n.__mesh.scale.setScalar(n.__r*(.3+.7*appear));
      n.__mesh.material.opacity = .95*appear;
      n.__halo.scale.setScalar(n.__r*(1.5+2*(1-appear)));
      n.__halo.material.opacity = .06+.18*(1-appear);
      n.__label.visible = false;
    }
  }
  const progress = growthTime/growth.duration;
  if (!growthCameraManual) graph.camera().position.setLength(overviewDistance()*(.56+.44*Math.min(1,growthTime/26)));
  if (growthTime-growthLastPaint > .12 || growthLastPaint < 0 || progress === 1) {
    growthLastPaint = growthTime;
    graph.nodeVisibility(displayNode).linkVisibility(displayLink).linkColor(linkColor).linkDirectionalParticles(particlesFor);
    const sourceCount = new Set(live.map((r) => r.node.source)).size;
    $('growth-count').textContent = num(live.length);
    $('demo-source').textContent = `The growth of ${data.brain.name}`;
    $('demo-title').textContent = growthTime < 1.2 ? 'It starts with one idea.' : growthTime < 4 ? 'Then, a connection.' : growthTime < 12 ? 'Ideas become branches.' : growthTime < 22 ? 'Knowledge compounds.' : progress < 1 ? 'A second brain takes shape.' : 'Your entire brain. Connected.';
    $('demo-detail').textContent = `${sourceCount} ${sourceCount === 1 ? 'source' : 'sources'} · ${num(live.length)} of ${num(growth.records.length)} saved notes`;
    $('demo-progress').style.setProperty('--progress',`${progress*100}%`);
    $('demo-progress').setAttribute('aria-valuenow',String(Math.round(progress*100)));
    $('demo-caption').style.setProperty('--demo-color','#67e8f9');
    $('visible-status').textContent = `${num(live.length)} notes in view`;
  }
  if (progress === 1) {
    growth.complete = true;
    document.body.classList.remove('growth-playing');
    for (const r of growth.records) { const n=r.node; n.x=n.fx=r.home.x; n.y=n.fy=r.home.y; n.z=n.fz=r.home.z; }
    graph.cooldownTicks(0).d3ReheatSimulation();
    graph.controls().autoRotateSpeed = .45;
    $('btn-demo').textContent = 'Replay demo';
    $('btn-demo').setAttribute('aria-pressed','false');
    restyleAll();
  }
}
function setMotion(value) {
  autoRotate = value;
  clearTimeout(idleTimer);
  graph.controls().autoRotate = value && !selected && !motionPreference.matches;
  graph.linkDirectionalParticleSpeed(value && !motionPreference.matches ? .004 : 0);
  $('btn-rotate').setAttribute('aria-pressed', String(value));
  $('btn-rotate').title = value ? 'Pause motion' : 'Resume motion';
  graph.linkDirectionalParticles(particlesFor);
  document.body.classList.toggle('motion-paused', !value);
}
function toggleCinema() {
  cinematic = !cinematic;
  document.body.classList.toggle('cinematic', cinematic);
  $('btn-cinema').textContent = cinematic ? 'Exit cinema' : 'Cinema';
  $('btn-cinema').setAttribute('aria-pressed', String(cinematic));
  if (cinematic) { if (selected) clearSelection(); $('inventory').hidden = true; }
}

function wireUi() {
  const input = $('search-input');
  let results = [];
  input.addEventListener('input', () => { searchActive = -1; results = search(input.value); renderSearch(results, input.value); });
  input.addEventListener('focus', () => { if (input.value) renderSearch(results, input.value); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); searchActive = Math.min(results.length - 1, searchActive + 1); renderSearch(results, input.value); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); searchActive = Math.max(0, searchActive - 1); renderSearch(results, input.value); }
    else if (e.key === 'Enter') { const n = results[Math.max(0, searchActive)]; if (n) { selectNode(n); $('search-results').hidden = true; input.blur(); } }
    else if (e.key === 'Escape') { $('search-results').hidden = true; input.blur(); }
  });
  $('search-results').addEventListener('click', (e) => {
    const r = e.target.closest('.result');
    if (!r) return;
    selectNode(nodesById.get(r.dataset.id));
    $('search-results').hidden = true;
    input.blur();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search')) $('search-results').hidden = true;
  });

  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName || '');
    if (e.key === '/' && !typing) { e.preventDefault(); input.focus(); input.select(); }
    else if (e.key === 'Escape' && !typing) {
      if (cinematic) toggleCinema();
      else if (demo) stopDemo();
      else if (!$('inventory').hidden) $('inventory').hidden = true;
      else if (selected) clearSelection();
    }
    else if (!typing && e.key.toLowerCase() === 'd') toggleDemo();
    else if (!typing && e.key.toLowerCase() === 'c') toggleCinema();
    else if (!typing && e.code === 'Space' && document.activeElement === document.body) { e.preventDefault(); setMotion(!autoRotate); }
  });

  $('drawer-close').addEventListener('click', clearSelection);
  $('inventory-close').addEventListener('click', () => { $('inventory').hidden = true; });
  $('btn-inventory').addEventListener('click', () => {
    const inv = $('inventory');
    inv.hidden = !inv.hidden;
    if (!inv.hidden) $('drawer').hidden = true;
    else if (selected) $('drawer').hidden = false;
  });
  $('btn-reset').addEventListener('click', resetView);
  $('btn-demo').addEventListener('click', toggleDemo);
  $('btn-cinema').addEventListener('click', toggleCinema);
  $('btn-sources').addEventListener('click', () => {
    const open = document.body.classList.toggle('sources-open');
    $('btn-sources').setAttribute('aria-expanded', String(open));
  });
  motionPreference.addEventListener('change', () => { stopDemo(); setMotion(!motionPreference.matches); });
  $('btn-rotate').addEventListener('click', () => {
    setMotion(!autoRotate);
    toast(autoRotate ? 'Motion on' : 'Motion paused');
  });
  $('toggle-attention').addEventListener('change', (e) => { attentionOnly = e.target.checked; applyVisibility(); if (attentionOnly) toast('Showing only notes that need attention'); });
  $('toggle-labels').addEventListener('change', (e) => { allLabels = e.target.checked; for (const n of data.nodes) applyNodeStyle(n); });

  $('d-read').addEventListener('click', () => selected && readNote(selected, 'note'));
  $('d-transcript').addEventListener('click', () => selected && readNote(selected, 'transcript'));
  $('d-focus').addEventListener('click', () => selected && flyTo(selected));
  $('d-reveal').addEventListener('click', async () => {
    if (!selected) return;
    await fetch(`/api/reveal?id=${encodeURIComponent(selected.id)}`);
    toast('Opened in File Explorer');
  });
  $('drawer').addEventListener('click', (e) => {
    const c = e.target.closest('.conn[data-id], a.wikilink[data-id]');
    if (c) { const n = nodesById.get(c.dataset.id); if (n) selectNode(n); }
  });
  $('inventory').addEventListener('click', async (e) => {
    const row = e.target.closest('.hrow');
    if (row) { const n = nodesById.get(row.dataset.id); if (n) { selectNode(n); } return; }
    const nav = e.target.closest('.nav-row');
    if (nav) { toast(nav.dataset.path, 3500); return; }
    if (e.target.id === 'btn-rebuild') {
      e.target.textContent = 'Rebuilding…';
      await fetch('/api/graph?rebuild=1');
      location.reload();
    }
  });
}

main().catch((err) => {
  console.error(err);
  $('splash-stats').textContent = `Failed to load: ${err.message}`;
});
