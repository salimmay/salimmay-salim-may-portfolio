"use client";

import React, { Component, ReactNode, Suspense, useCallback, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useAnimations, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// avatar.glb notes (from the actual export, inspected with a glTF dump):
// - Rigged, ships 2 Mixamo clips ("Layer0" / "Layer0.001"). We auto-play the
//   first one found, so re-exporting with a different idle from Mixamo will
//   "just work" here.
// - The rest pose is Z-UP. Bind-pose bounds are x 0.988 / y 0.179 / z 1.000:
//   the character's height sits on Z, and that y 0.179 is its front-to-back
//   depth. The Mixamo clip is what stands it upright on Y.
//   This is worth spelling out, because it broke the old auto-fit badly:
//   THREE.Box3.setFromObject() only ever sees bind-pose geometry, so it
//   reported 0.179 as the "height" and scaled the avatar by 1.75 / 0.179 ≈ 9.8.
//   Once the clip stood the model up, that scale landed on the real 1.0-unit
//   height axis and rendered a ~9.8 m giant — which is why the camera used to
//   open somewhere around its ankles. measurePosedBounds() measures the
//   *skinned* vertices instead, i.e. the model as it's actually posed.
// - Meshy/Tripo flags every material alphaMode=BLEND even though the character
//   is fully opaque. Forced back to opaque below, which fixes the flicker and
//   sorting glitches where meshes overlap (hair over scalp, shirt over torso).
// ---------------------------------------------------------------------------

const MODEL_PATH = "/models/avatar.glb";
const TARGET_HEIGHT = 1.75; // metres — the avatar renders this tall whatever scale it was exported at

// Empty room left around the avatar when framing. 1.0 = fills the frame edge
// to edge; 1.18 leaves a little air above the head and below the shoes.
const FRAME_PADDING = 1.18;
// Camera looks at this fraction of the avatar's height. Slightly under half
// puts the horizon around the waist, which reads as standing rather than
// floating.
const LOOK_AT_RATIO = 0.46;
// Camera height when framed — dead level with the look-at point.
const HOME_POLAR = Math.PI / 2;

useGLTF.preload(MODEL_PATH);

/** Normalised pointer position (-1..1), tracked window-wide. */
type Pointer = { x: number; y: number };

const _vertex = new THREE.Vector3();

// Bounds of the model AS POSED, rather than as exported.
// Box3.setFromObject() (even with `precise`) walks raw geometry attributes
// through each mesh's world matrix — it has no idea the skeleton has since
// rotated the whole character upright. Pushing every vertex through
// applyBoneTransform() gives the bounds that are genuinely on screen.
// ~30k verts across the 5 meshes here and we do it exactly once, so the
// brute-force loop costs a couple of milliseconds.
function measurePosedBounds(root: THREE.Object3D, box: THREE.Box3) {
  box.makeEmpty();
  root.updateMatrixWorld(true);

  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return;

    const position = mesh.geometry?.getAttribute("position") as THREE.BufferAttribute | undefined;
    if (!position) return;

    const skinned = mesh as unknown as THREE.SkinnedMesh;
    const isSkinned = Boolean((mesh as unknown as { isSkinnedMesh?: boolean }).isSkinnedMesh && skinned.skeleton);

    for (let i = 0; i < position.count; i++) {
      _vertex.fromBufferAttribute(position, i);
      // applyBoneTransform() returns mesh-LOCAL space (it re-applies
      // bindMatrixInverse on the way out), so both paths still need the
      // mesh's world matrix to land in world space.
      if (isSkinned) skinned.applyBoneTransform(i, _vertex);
      _vertex.applyMatrix4(mesh.matrixWorld);
      box.expandByPoint(_vertex);
    }
  });

  return box;
}

function Avatar({
  controlsRef,
  pointerRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  pointerRef: React.RefObject<Pointer>;
}) {
  const { scene, animations } = useGLTF(MODEL_PATH);
  const { actions, names } = useAnimations(animations, scene);
  const { camera, size } = useThree();

  // Spins the avatar in place — the inner group has already re-centred it on
  // the Y axis, so a rotation here is a turn on the spot rather than an orbit.
  const pivotRef = useRef<THREE.Group>(null);
  const offsetRef = useRef<THREE.Group>(null);

  const framesWaited = useRef(0);
  const boxRef = useRef(new THREE.Box3());
  const fitRef = useRef<{ height: number; girth: number } | null>(null);

  useEffect(() => {
    // Fix the opaque-materials-marked-as-BLEND export quirk.
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return;
      // Never cull this model. three.js culls a SkinnedMesh against a bounding
      // sphere derived from BIND-POSE geometry, and this rig's bind pose is Z-up
      // while the clip stands the character on Y — so all five spheres sit on the
      // wrong axis entirely. The head mesh has the smallest radius (0.13) and is
      // therefore the first to fall outside the frustum, which is why it vanished
      // on wide viewports and not narrow ones. Five meshes is nothing to draw, so
      // skipping the check outright beats trying to keep the bounds honest.
      mesh.frustumCulled = false;

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mats.forEach((m) => {
        const mat = m as THREE.MeshStandardMaterial;
        if (!mat) return;
        mat.transparent = false;
        mat.depthWrite = true;
        mat.needsUpdate = true;
      });
    });

    // Auto-play whatever clip the rig ships with, at full weight immediately.
    // Deliberately no fadeIn(): the clip is what stands the avatar upright, and
    // a ramping weight would leave it half-way to its Z-up rest pose at the
    // moment we measure it a few frames from now.
    let action: THREE.AnimationAction | null | undefined;
    if (names.length > 0) {
      action = actions[names[0]];
      action?.reset().play();
    }

    return () => {
      action?.fadeOut(0.3);
    };
  }, [scene, actions, names]);

  // Hidden until measured, so it never flashes at the wrong size. Set
  // imperatively rather than via a prop so React can't reset it underneath us.
  useEffect(() => {
    if (pivotRef.current) pivotRef.current.visible = false;
  }, []);

  const frameCamera = useCallback(() => {
    const fit = fitRef.current;
    if (!fit) return;

    const cam = camera as THREE.PerspectiveCamera;
    const vFov = THREE.MathUtils.degToRad(cam.fov);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * cam.aspect);

    // Pull back far enough to clear whichever axis is tighter — a narrow
    // column on a phone runs out of width long before it runs out of height.
    const forHeight = (fit.height * FRAME_PADDING) / 2 / Math.tan(vFov / 2);
    const forWidth = (fit.girth * FRAME_PADDING) / 2 / Math.tan(hFov / 2);
    const distance = Math.max(forHeight, forWidth);
    const lookAtY = fit.height * LOOK_AT_RATIO;

    cam.position.set(0, lookAtY, distance);
    cam.updateProjectionMatrix();

    const controls = controlsRef.current;
    if (controls) {
      controls.target.set(0, lookAtY, 0);
      controls.update();
    }
  }, [camera, controlsRef]);

  // Re-frame when the canvas is resized (rotating a phone, opening devtools).
  useEffect(() => {
    frameCamera();
  }, [size.width, size.height, frameCamera]);

  useFrame((_, delta) => {
    const pivot = pivotRef.current;
    const offset = offsetRef.current;
    if (!pivot || !offset) return;

    if (!fitRef.current) {
      // Frame 0 hasn't had a mixer tick yet, so the skeleton is still in its
      // Z-up rest pose. Give the clip a couple of updates before measuring.
      if (framesWaited.current++ < 2) return;

      // useGLTF hands back a cached, shared scene object and we scale it in
      // place, so clear anything a previous mount left on it — otherwise a
      // remount measures an already-scaled model and compounds the fit.
      scene.scale.set(1, 1, 1);
      scene.position.set(0, 0, 0);

      const bounds = measurePosedBounds(scene, boxRef.current);
      if (bounds.isEmpty()) return;

      const boxSize = bounds.getSize(new THREE.Vector3());
      const center = bounds.getCenter(new THREE.Vector3());
      if (!isFinite(boxSize.y) || boxSize.y <= 0) return; // retry next frame

      const scale = TARGET_HEIGHT / boxSize.y;
      scene.scale.setScalar(scale);
      // Centre on the Y axis and plant the feet on y = 0.
      offset.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);

      fitRef.current = {
        height: boxSize.y * scale,
        // Widest horizontal axis — the avatar turns, so the camera has to
        // clear its depth as well as its width.
        girth: Math.max(boxSize.x, boxSize.z) * scale,
      };

      frameCamera();
      pivot.visible = true;
      return;
    }

    // ── Idle life ────────────────────────────────────────────────────────
    // Turn gently toward the cursor, and drift a little further round (and
    // down) as the page scrolls, so the avatar stays alive behind the copy
    // instead of freezing the moment the hero leaves the viewport.
    const viewportH = window.innerHeight || 1;
    const scrolled = THREE.MathUtils.clamp(window.scrollY / viewportH, 0, 1);

    const targetYaw = pointerRef.current.x * 0.26 + scrolled * 0.45;
    const targetLift = -scrolled * fitRef.current.height * 0.1;

    pivot.rotation.y = THREE.MathUtils.damp(pivot.rotation.y, targetYaw, 3, delta);
    pivot.position.y = THREE.MathUtils.damp(pivot.position.y, targetLift, 3, delta);
  });

  return (
    <group ref={pivotRef}>
      <group ref={offsetRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

// Eases the camera back to front-on once the visitor lets go of a drag, so
// there's no need for a "reset view" button — the scene tidies up after itself.
function AutoRecenter({
  controlsRef,
  interactionRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  interactionRef: React.RefObject<{ dragging: boolean; releasedAt: number }>;
}) {
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const { dragging, releasedAt } = interactionRef.current;
    if (dragging) return;
    // Let the view rest where they left it for a beat before reclaiming it.
    if (releasedAt === 0 || performance.now() - releasedAt < 900) return;

    const azimuth = controls.getAzimuthalAngle();
    const polar = controls.getPolarAngle();
    if (Math.abs(azimuth) < 0.001 && Math.abs(polar - HOME_POLAR) < 0.001) {
      interactionRef.current.releasedAt = 0; // settled — stop touching the controls
      return;
    }

    controls.setAzimuthalAngle(THREE.MathUtils.damp(azimuth, 0, 2, delta));
    controls.setPolarAngle(THREE.MathUtils.damp(polar, HOME_POLAR, 2, delta));
    controls.update();
  });

  return null;
}

// Rotating wireframe stand-in shown while avatar.glb loads, or if it fails to
// load at all. Keeps the hero composed rather than leaving a hole in it.
function PlaceholderAvatar() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.25;
  });

  return (
    <group ref={groupRef} position={[0, 0.9, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial color="#3b82f6" wireframe />
      </mesh>
      <mesh position={[0, -0.2, 0]}>
        <coneGeometry args={[0.4, 1.1, 6, 1, true]} />
        <meshStandardMaterial color="#8b5cf6" wireframe />
      </mesh>
    </group>
  );
}

// drei's useGLTF throws (inside Suspense) if the file 404s, so catch that here
// and fall back to the placeholder rather than taking down the whole page.
class ModelErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    // Swallow — the placeholder is a perfectly good outcome.
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

const SceneLights = () => (
  <>
    <ambientLight intensity={0.75} />
    <hemisphereLight args={["#bfdbfe", "#020617", 0.7]} />
    {/* Warm key from front-right, matching the horizon glow behind the page. */}
    <directionalLight position={[3.5, 4, 5]} intensity={2.6} color="#ffe8cc" />
    {/* Cool rim from behind-left — this is what draws the neon edge on the
        shoulders and separates the avatar from the dark background. */}
    <directionalLight position={[-4.5, 2.5, -3.5]} intensity={2.2} color="#60a5fa" />
    <pointLight position={[0, 1.2, -2.5]} intensity={1.4} color="#a78bfa" />
  </>
);

function Scene({ interactive }: { interactive: boolean }) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const pointerRef = useRef<Pointer>({ x: 0, y: 0 });
  const interactionRef = useRef({ dragging: false, releasedAt: 0 });

  // Tracked on the window rather than through R3F's own pointer, which only
  // fires over the canvas — the avatar should keep following the cursor while
  // it's over the copy on the left, and while the canvas has pointer events off.
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointerRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <SceneLights />

      <Suspense fallback={<PlaceholderAvatar />}>
        <ModelErrorBoundary fallback={<PlaceholderAvatar />}>
          <Avatar controlsRef={controlsRef} pointerRef={pointerRef} />
        </ModelErrorBoundary>
        <Environment preset="studio" />
      </Suspense>

      <ContactShadows position={[0, 0.001, 0]} opacity={0.55} scale={5} blur={2.8} far={3} color="#000000" />

      <OrbitControls
        ref={controlsRef}
        enabled={interactive}
        enablePan={false}
        // Zoom stays off for two reasons: the wheel belongs to the page now
        // (this is a scrolling site), and OrbitControls' own zoom used to fight
        // with the custom dolly that lived here.
        enableZoom={false}
        minPolarAngle={Math.PI / 2.5}
        maxPolarAngle={Math.PI / 1.85}
        rotateSpeed={0.5}
        onStart={() => {
          interactionRef.current.dragging = true;
        }}
        onEnd={() => {
          interactionRef.current.dragging = false;
          interactionRef.current.releasedAt = performance.now();
        }}
      />

      <AutoRecenter controlsRef={controlsRef} interactionRef={interactionRef} />
    </>
  );
}

export default function AvatarScene({ interactive = true }: { interactive?: boolean }) {
  return (
    <Canvas
      // Just a sane first frame — Avatar re-frames this for real the moment
      // it has measured the model.
      camera={{ position: [0, 0.9, 3.4], fov: 34, near: 0.1, far: 100 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.75]}
    >
      <Scene interactive={interactive} />
    </Canvas>
  );
}
