import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export interface HeroScene {
  setExploded: (value: boolean) => void;
  dispose: () => void;
}

interface Options {
  reducedMotion?: boolean;
  onReady?: () => void;
}

/**
 * Procedural punch-and-die assembly. No model download: the tooling is built
 * from geometry so the hero stays light and renders identically everywhere.
 */
export function initHeroScene(canvas: HTMLCanvasElement, options: Options = {}): HeroScene {
  const { reducedMotion = false, onReady } = options;
  const host = canvas.parentElement ?? canvas;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearAlpha(0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 860 ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 1, 900);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTarget = pmrem.fromScene(room, 0.04);
  scene.environment = envTarget.texture;
  pmrem.dispose();

  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(48, 92, 44);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xab6038, 1.6);
  fill.position.set(-72, 26, 18);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xe9dfce, 2.4);
  rim.position.set(-16, 44, -86);
  scene.add(rim);

  scene.add(new THREE.AmbientLight(0xdfe7f2, 0.55));

  const steel = new THREE.MeshStandardMaterial({
    color: 0xdfe4e9,
    metalness: 1,
    roughness: 0.26,
  });
  const dieSteel = new THREE.MeshStandardMaterial({
    color: 0xa9b2ba,
    metalness: 1,
    roughness: 0.34,
  });
  const sheetSteel = new THREE.MeshStandardMaterial({
    color: 0xc9d1d8,
    metalness: 0.95,
    roughness: 0.42,
  });
  const blue = new THREE.MeshStandardMaterial({
    color: 0xc25725,
    metalness: 0.7,
    roughness: 0.3,
  });
  const edgeBlue = new THREE.LineBasicMaterial({
    color: 0xff8b48,
    transparent: true,
    opacity: 0.32,
  });

  const root = new THREE.Group();
  root.rotation.set(-0.05, -0.62, 0);
  scene.add(root);

  // --- die block: 124 × 72 × 26 with a Ø 24 bore -------------------------
  const dieShape = new THREE.Shape();
  dieShape.moveTo(-62, -36);
  dieShape.lineTo(62, -36);
  dieShape.lineTo(62, 36);
  dieShape.lineTo(-62, 36);
  dieShape.lineTo(-62, -36);
  const dieBore = new THREE.Path();
  dieBore.absarc(0, 0, 12, 0, Math.PI * 2, false);
  dieShape.holes.push(dieBore);

  const dieGeo = new THREE.ExtrudeGeometry(dieShape, {
    depth: 26,
    bevelEnabled: true,
    bevelSize: 0.5,
    bevelThickness: 0.5,
    bevelSegments: 2,
    curveSegments: 48,
  });
  dieGeo.rotateX(-Math.PI / 2);
  dieGeo.translate(0, -13, 0);

  const die = new THREE.Mesh(dieGeo, dieSteel);
  root.add(die);
  const dieEdges = new THREE.LineSegments(new THREE.EdgesGeometry(dieGeo, 24), edgeBlue);
  die.add(dieEdges);

  // --- sheet metal: 124 × 72 × 2.4, already punched ----------------------
  const sheetShape = new THREE.Shape();
  sheetShape.moveTo(-62, -36);
  sheetShape.lineTo(62, -36);
  sheetShape.lineTo(62, 36);
  sheetShape.lineTo(-62, 36);
  sheetShape.lineTo(-62, -36);
  const sheetHole = new THREE.Path();
  sheetHole.absarc(0, 0, 12.35, 0, Math.PI * 2, false);
  sheetShape.holes.push(sheetHole);

  const sheetGeo = new THREE.ExtrudeGeometry(sheetShape, {
    depth: 2.4,
    bevelEnabled: false,
    curveSegments: 48,
  });
  sheetGeo.rotateX(-Math.PI / 2);
  sheetGeo.translate(0, 13, 0);

  const sheet = new THREE.Mesh(sheetGeo, sheetSteel);
  root.add(sheet);
  sheet.add(new THREE.LineSegments(new THREE.EdgesGeometry(sheetGeo, 24), edgeBlue));

  // --- punch: lathed profile, Ø 23.4 body, flanged head -------------------
  const profile: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(11.7, 0),
    new THREE.Vector2(11.7, 34),
    new THREE.Vector2(12.6, 36),
    new THREE.Vector2(15, 36),
    new THREE.Vector2(15, 43),
    new THREE.Vector2(9, 43),
    new THREE.Vector2(9, 52),
    new THREE.Vector2(0, 52),
  ];
  const punchGeo = new THREE.LatheGeometry(profile, 72);
  const punch = new THREE.Mesh(punchGeo, steel);
  punch.position.y = 6;
  root.add(punch);

  const bandGeo = new THREE.CylinderGeometry(15.35, 15.35, 1.5, 72, 1, true);
  const band = new THREE.Mesh(bandGeo, blue);
  band.position.y = 39.4;
  punch.add(band);

  // --- camera framing ----------------------------------------------------
  const centre = new THREE.Vector3(0, 20, 0);
  const dir = new THREE.Vector3(0.58, 0.4, 0.72).normalize();
  const tanHalf = Math.tan((camera.fov * Math.PI) / 360);

  function frame() {
    const width = host.clientWidth || 1;
    const height = host.clientHeight || 1;
    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio || 1, window.innerWidth < 860 ? 1.5 : 2),
    );
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    const worldHeight = Math.max(100, 140 / camera.aspect);
    const distance = worldHeight / 2 / tanHalf;
    camera.position.copy(dir).multiplyScalar(distance).add(centre);
    camera.lookAt(centre);
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }

  const state = {
    yaw: -0.62,
    pitch: -0.05,
    targetYaw: -0.62,
    targetPitch: -0.05,
    explode: 0,
    targetExplode: 0,
    scroll: 0,
  };

  let frameId = 0;
  let running = false;
  let lastFrame = 0;
  let elapsed = 0;

  function draw(elapsed: number) {
    state.yaw += (state.targetYaw - state.yaw) * 0.07;
    state.pitch += (state.targetPitch - state.pitch) * 0.07;
    state.explode += (state.targetExplode - state.explode) * 0.09;

    const drift = reducedMotion ? 0 : Math.sin(elapsed * 0.16) * 0.07;
    const float = reducedMotion ? 0 : Math.sin(elapsed * 0.55) * 0.55;

    root.rotation.y = state.yaw + drift;
    root.rotation.x = state.pitch;
    root.position.y = float + state.explode * 3;

    punch.position.y = 6 + state.explode * 27;
    sheet.position.y = state.explode * 11;
    die.position.y = -state.explode * 9;

    camera.position.y += (centre.y + state.scroll * 10 - camera.position.y) * 0.05;
    camera.lookAt(centre);

    renderer.render(scene, camera);
  }

  function loop(now: number) {
    if (!lastFrame) lastFrame = now;
    elapsed += Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;
    draw(elapsed);
    frameId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reducedMotion) return;
    running = true;
    lastFrame = 0;
    frameId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
  }

  // --- pointer drag (vertical scrolling stays intact) --------------------
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  const onDown = (event: PointerEvent) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    canvas.setPointerCapture(event.pointerId);
    canvas.classList.add('is-dragging');
  };

  const onMove = (event: PointerEvent) => {
    if (!dragging) return;
    state.targetYaw += (event.clientX - lastX) * 0.006;
    state.targetPitch = THREE.MathUtils.clamp(
      state.targetPitch + (event.clientY - lastY) * 0.004,
      -0.42,
      0.34,
    );
    lastX = event.clientX;
    lastY = event.clientY;
    if (reducedMotion) {
      state.yaw = state.targetYaw;
      state.pitch = state.targetPitch;
      draw(elapsed);
    }
  };

  const onUp = (event: PointerEvent) => {
    dragging = false;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    canvas.classList.remove('is-dragging');
  };

  const onScroll = () => {
    state.scroll = Math.min(1, window.scrollY / Math.max(window.innerHeight, 1));
  };

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', (event) => {
    if (dragging) onUp(event);
  });
  window.addEventListener('scroll', onScroll, { passive: true });

  const resizeObserver = new ResizeObserver(() => frame());
  resizeObserver.observe(host);

  const visibility = new IntersectionObserver(
    (entries) => {
      const visible = entries.some((entry) => entry.isIntersecting);
      if (visible) start();
      else stop();
    },
    { threshold: 0.02 },
  );
  visibility.observe(canvas);

  const onHidden = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener('visibilitychange', onHidden);

  frame();
  if (reducedMotion) renderer.render(scene, camera);
  onReady?.();

  return {
    setExploded(value: boolean) {
      state.targetExplode = value ? 1 : 0;
      if (reducedMotion) {
        state.explode = state.targetExplode;
        draw(elapsed);
      }
    },
    dispose() {
      stop();
      visibility.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onHidden);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      dieGeo.dispose();
      sheetGeo.dispose();
      punchGeo.dispose();
      bandGeo.dispose();
      steel.dispose();
      dieSteel.dispose();
      sheetSteel.dispose();
      blue.dispose();
      edgeBlue.dispose();
      envTarget.dispose();
      room.dispose?.();
      renderer.dispose();
    },
  };
}
