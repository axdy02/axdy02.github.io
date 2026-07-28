"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";

const ACID = "#c8ff1a";
const ACID_PALE = "#efffb7";
const GRAPHITE = "#151916";
const STEEL = "#69716c";

type PointerPosition = {
  x: number;
  y: number;
};

type HeroSceneProps = {
  className?: string;
};

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

function useSceneVisibility(target: MutableRefObject<HTMLDivElement | null>) {
  const [intersecting, setIntersecting] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);

  useEffect(() => {
    const updateDocumentVisibility = () => {
      setDocumentVisible(document.visibilityState !== "hidden");
    };

    updateDocumentVisibility();
    document.addEventListener("visibilitychange", updateDocumentVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateDocumentVisibility);
    };
  }, []);

  useEffect(() => {
    const element = target.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setIntersecting(entry.isIntersecting),
      { rootMargin: "120px 0px", threshold: 0.01 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);

  return intersecting && documentVisible;
}

function useWindowPointer(enabled: boolean) {
  const pointer = useRef<PointerPosition>({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      pointer.current.x = 0;
      pointer.current.y = 0;
      return;
    }

    const updatePointer = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    };

    window.addEventListener("pointermove", updatePointer, { passive: true });
    return () => window.removeEventListener("pointermove", updatePointer);
  }, [enabled]);

  return pointer;
}

function ChromeMaterial({ pale = false }: { pale?: boolean }) {
  return (
    <meshStandardMaterial
      color={pale ? STEEL : GRAPHITE}
      metalness={0.92}
      roughness={pale ? 0.28 : 0.2}
    />
  );
}

function LetterSystem() {
  return (
    <group position={[-0.12, 0.03, 0]}>
      <group position={[-0.72, 0, 0]} rotation={[0.02, -0.08, 0]}>
        <RoundedBox
          args={[0.18, 1.78, 0.25]}
          radius={0.06}
          smoothness={2}
          position={[-0.35, 0, 0]}
          rotation={[0, 0, -0.34]}
        >
          <ChromeMaterial />
        </RoundedBox>
        <RoundedBox
          args={[0.18, 1.78, 0.25]}
          radius={0.06}
          smoothness={2}
          position={[0.35, 0, 0]}
          rotation={[0, 0, 0.34]}
        >
          <ChromeMaterial pale />
        </RoundedBox>
        <RoundedBox
          args={[0.72, 0.14, 0.28]}
          radius={0.05}
          smoothness={2}
          position={[0, -0.12, 0.02]}
        >
          <ChromeMaterial />
        </RoundedBox>
      </group>

      <group position={[0.65, 0, 0.02]} rotation={[-0.02, 0.1, 0]}>
        <RoundedBox
          args={[0.18, 1.82, 0.25]}
          radius={0.06}
          smoothness={2}
          position={[-0.28, 0, 0]}
        >
          <ChromeMaterial />
        </RoundedBox>
        <RoundedBox
          args={[0.17, 1.05, 0.24]}
          radius={0.055}
          smoothness={2}
          position={[0.13, 0.38, 0]}
          rotation={[0, 0, 0.72]}
        >
          <ChromeMaterial pale />
        </RoundedBox>
        <RoundedBox
          args={[0.17, 1.1, 0.24]}
          radius={0.055}
          smoothness={2}
          position={[0.16, -0.4, 0]}
          rotation={[0, 0, -0.69]}
        >
          <ChromeMaterial />
        </RoundedBox>
      </group>
    </group>
  );
}

function LuminousCore({ lowMotion }: { lowMotion: boolean }) {
  const core = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (lowMotion || !core.current || !shell.current) return;
    core.current.rotation.y += delta * 0.42;
    core.current.rotation.x -= delta * 0.15;
    shell.current.rotation.y -= delta * 0.24;
  });

  return (
    <group ref={core} position={[0.16, 0.04, 0.45]}>
      <pointLight color={ACID} intensity={3.2} distance={3.2} decay={2} />

      <mesh>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial color={ACID_PALE} toneMapped={false} />
      </mesh>

      <mesh scale={1.38}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshBasicMaterial
          color={ACID}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={shell} scale={1.72}>
        <icosahedronGeometry args={[0.31, 1]} />
        <meshPhysicalMaterial
          color={ACID_PALE}
          metalness={0.18}
          roughness={0.18}
          transparent
          opacity={0.2}
          wireframe
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function EnergyPath() {
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.45, -0.72, 0.26),
      new THREE.Vector3(-0.86, -0.05, 0.34),
      new THREE.Vector3(-0.28, 0.48, 0.42),
      new THREE.Vector3(0.16, 0.04, 0.5),
      new THREE.Vector3(0.72, -0.38, 0.35),
      new THREE.Vector3(1.38, 0.45, 0.18),
    ]);

    return new THREE.TubeGeometry(curve, 52, 0.018, 5, false);
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry}>
      <meshBasicMaterial
        color={ACID}
        toneMapped={false}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

function OrbitalArcs() {
  return (
    <group position={[0.03, 0.05, 0.15]}>
      <mesh rotation={[1.18, 0.08, -0.28]}>
        <torusGeometry args={[1.52, 0.014, 5, 72, Math.PI * 1.46]} />
        <meshBasicMaterial
          color={ACID}
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[-0.38, 1.08, 0.74]}>
        <torusGeometry args={[1.31, 0.009, 5, 64, Math.PI * 1.12]} />
        <meshBasicMaterial
          color={ACID_PALE}
          transparent
          opacity={0.26}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[0.16, -0.52, 1.42]}>
        <torusGeometry args={[1.68, 0.008, 5, 72, Math.PI * 0.76]} />
        <meshBasicMaterial
          color="#8e9691"
          transparent
          opacity={0.28}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function ParticleField({ lowMotion }: { lowMotion: boolean }) {
  const particles = useRef<THREE.Points>(null);
  const count = lowMotion ? 28 : 68;
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const phase = index * 2.399963;
      const radius = 1.35 + ((index * 37) % 100) / 92;
      values[index * 3] = Math.cos(phase) * radius;
      values[index * 3 + 1] =
        Math.sin(phase * 1.17) * (0.8 + ((index * 13) % 20) / 20);
      values[index * 3 + 2] =
        Math.sin(phase) * 0.62 + (((index * 19) % 30) / 30 - 0.5);
    }

    return values;
  }, [count]);

  useFrame((_, delta) => {
    if (!lowMotion && particles.current) {
      particles.current.rotation.y += delta * 0.028;
    }
  });

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={ACID_PALE}
        size={0.026}
        sizeAttenuation
        transparent
        opacity={0.58}
        depthWrite={false}
      />
    </points>
  );
}

function DeveloperSilhouette() {
  return (
    <group
      position={[2.03, -1.05, 0.18]}
      rotation={[0, -0.46, -0.02]}
      scale={0.86}
    >
      <mesh position={[0, 1.34, 0]} rotation={[0.04, -0.16, 0]}>
        <icosahedronGeometry args={[0.29, 2]} />
        <meshStandardMaterial
          color="#242925"
          metalness={0.16}
          roughness={0.84}
        />
      </mesh>
      <mesh position={[0, 1.03, 0]}>
        <cylinderGeometry args={[0.105, 0.13, 0.26, 8]} />
        <meshStandardMaterial color="#1d211e" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.42, 0]} rotation={[0, 0, -0.04]}>
        <capsuleGeometry args={[0.36, 0.82, 5, 9]} />
        <meshStandardMaterial
          color="#171b18"
          metalness={0.18}
          roughness={0.72}
        />
      </mesh>

      <group position={[-0.22, 0.76, 0.02]} rotation={[0.04, 0.12, 1.02]}>
        <mesh position={[0, -0.31, 0]}>
          <cylinderGeometry args={[0.105, 0.12, 0.62, 8]} />
          <meshStandardMaterial color="#1c211d" roughness={0.78} />
        </mesh>
        <group position={[0.02, -0.6, 0]} rotation={[0.2, 0, -0.62]}>
          <mesh position={[0, -0.27, 0]}>
            <cylinderGeometry args={[0.082, 0.102, 0.55, 8]} />
            <meshStandardMaterial color="#252b26" roughness={0.78} />
          </mesh>
          <mesh position={[0.02, -0.58, 0]}>
            <icosahedronGeometry args={[0.12, 1]} />
            <meshStandardMaterial color="#2b312c" roughness={0.82} />
          </mesh>
        </group>
      </group>

      <group position={[0.2, 0.74, 0]} rotation={[-0.06, 0.1, -0.48]}>
        <mesh position={[0, -0.3, 0]}>
          <cylinderGeometry args={[0.1, 0.115, 0.6, 8]} />
          <meshStandardMaterial color="#151916" roughness={0.8} />
        </mesh>
        <mesh position={[0.04, -0.78, 0]} rotation={[0, 0, -0.08]}>
          <cylinderGeometry args={[0.078, 0.1, 0.47, 8]} />
          <meshStandardMaterial color="#212622" roughness={0.82} />
        </mesh>
      </group>

      <mesh position={[-0.19, -0.62, 0]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.13, 0.15, 0.92, 8]} />
        <meshStandardMaterial color="#101310" roughness={0.88} />
      </mesh>
      <mesh position={[0.19, -0.62, 0]} rotation={[0, 0, -0.07]}>
        <cylinderGeometry args={[0.13, 0.15, 0.92, 8]} />
        <meshStandardMaterial color="#101310" roughness={0.88} />
      </mesh>
    </group>
  );
}

function SceneRig({
  lowMotion,
  pointer,
}: {
  lowMotion: boolean;
  pointer: MutableRefObject<PointerPosition>;
}) {
  const rig = useRef<THREE.Group>(null);
  const { viewport } = useThree();
  const responsiveScale = Math.min(1.06, Math.max(0.5, viewport.width / 5.5));

  useFrame((_, delta) => {
    if (!rig.current || lowMotion) return;

    const easing = 1 - Math.exp(-delta * 2.6);
    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      pointer.current.x * 0.075,
      easing,
    );
    rig.current.rotation.x = THREE.MathUtils.lerp(
      rig.current.rotation.x,
      pointer.current.y * 0.045,
      easing,
    );
    rig.current.position.y = THREE.MathUtils.lerp(
      rig.current.position.y,
      pointer.current.y * 0.055,
      easing,
    );
  });

  return (
    <group ref={rig} scale={responsiveScale}>
      <LetterSystem />
      <LuminousCore lowMotion={lowMotion} />
      <EnergyPath />
      <OrbitalArcs />
      <ParticleField lowMotion={lowMotion} />
      <DeveloperSilhouette />
    </group>
  );
}

function Scene({
  lowMotion,
  pointer,
}: {
  lowMotion: boolean;
  pointer: MutableRefObject<PointerPosition>;
}) {
  return (
    <>
      <ambientLight intensity={0.72} color="#dce4dd" />
      <directionalLight
        color="#f5fff0"
        intensity={3.1}
        position={[-3.5, 4.5, 5]}
      />
      <directionalLight
        color={ACID}
        intensity={0.72}
        position={[3, -1, 2]}
      />
      <SceneRig lowMotion={lowMotion} pointer={pointer} />
    </>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
        canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true }),
    );
  } catch {
    return false;
  }
}

export default function HeroScene({ className }: HeroSceneProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [webGLReady, setWebGLReady] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const sceneVisible = useSceneVisibility(wrapper);
  const lowMotion = reducedMotion || coarsePointer || !sceneVisible;
  const pointer = useWindowPointer(!lowMotion);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setWebGLReady(supportsWebGL());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      ref={wrapper}
      className={className}
      aria-hidden="true"
      role="presentation"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        userSelect: "none",
      }}
    >
      {webGLReady ? (
        <Canvas
          dpr={lowMotion ? 1 : [1, 1.5]}
          frameloop={lowMotion ? "demand" : "always"}
          camera={{ position: [0, 0.1, 7], fov: 38, near: 0.1, far: 30 }}
          gl={{
            alpha: true,
            antialias: !lowMotion,
            depth: true,
            stencil: false,
            powerPreference: "high-performance",
          }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
          style={{ width: "100%", height: "100%" }}
        >
          <Scene lowMotion={lowMotion} pointer={pointer} />
        </Canvas>
      ) : null}
    </div>
  );
}
