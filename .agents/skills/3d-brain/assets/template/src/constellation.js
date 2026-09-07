import * as THREE from 'three';

export function composeGlobe(nodes, sources) {
  // Deterministic equal-area latitude samples: a round silhouette at every angle.
  sources.forEach((source, sector) => {
    const list = nodes.filter((n) => n.source === source.id).sort((a, b) => a.id.localeCompare(b.id));
    list.forEach((n, i) => {
      const y = 1 - 2 * ((i + .5) / list.length);
      const turn = (i * .61803398875) % 1;
      const a = (sector + .08 + turn * .84) / sources.length * Math.PI * 2;
      const radius = 350 + 100 * ((i * .754877666) % 1);
      const horizontal = Math.sqrt(1 - y * y);
      n.x = n.fx = radius * horizontal * Math.sin(a);
      n.y = n.fy = radius * y;
      n.z = n.fz = radius * horizontal * Math.cos(a);
    });
  });
}

export function makeOrbitals(scene) {
  const group = new THREE.Group();
  scene.add(group);
  const rings = [];
  for (let i = 0; i < 2; i++) {
    const points = Array.from({ length: 241 }, (_, j) => {
      const a = j / 240 * Math.PI * 2;
      return new THREE.Vector3(Math.cos(a) * (490 + i * 35), Math.sin(a) * (490 + i * 35), 0);
    });
    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: i ? 0x67e8f9 : 0x91aaff, transparent: true, opacity: .13, depthWrite: false }));
    ring.rotation.set(i ? .9 : -.5, i ? -.45 : .4, .2);
    group.add(ring);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(2.8, 10, 8), new THREE.MeshBasicMaterial({ color: 0xb9f5ff }));
    ring.add(bead);
    rings.push({ ring, bead, radius: 490 + i * 35 });
  }
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(44, 1), new THREE.MeshBasicMaterial({ color: 0x8deaff, wireframe: true, transparent: true, opacity: .12, depthWrite: false }));
  group.add(core);
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const glow = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  glow.addColorStop(0, 'rgba(120,220,255,.45)');
  glow.addColorStop(.2, 'rgba(50,150,230,.13)');
  glow.addColorStop(1, 'rgba(20,60,100,0)');
  ctx.fillStyle = glow; ctx.fillRect(0, 0, 128, 128);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  sprite.scale.set(330, 330, 1); group.add(sprite);
  return {
    update(t, focused, reveal = 1) {
      core.rotation.set(t * .09, t * .12, 0);
      sprite.material.opacity = focused ? .25 : .7 + Math.sin(t * .7) * .1;
      rings.forEach(({ring, bead, radius}, i) => {
        ring.visible = reveal > .01;
        ring.scale.setScalar(.2 + .8 * Math.min(1,reveal));
        ring.rotation.z = t * (i ? -.018 : .012);
        bead.position.set(Math.cos(t * .16 + i * 2) * radius, Math.sin(t * .16 + i * 2) * radius, 0);
        ring.material.opacity = (focused ? .035 : .12) * Math.min(1,reveal);
      });
    },
  };
}
