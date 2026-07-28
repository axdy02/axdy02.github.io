"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  Environment,
  Lightformer,
  OrbitControls,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/ak-hero.glb";
const ACID = "#b8ff3d";

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
    return () =>
      document.removeEventListener(
        "visibilitychange",
        updateDocumentVisibility,
      );
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

function HeroModel({ onReady }: { onReady: () => void }) {
  const gltf = useGLTF(MODEL_URL);
  const model = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.frustumCulled = true;

      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshPhysicalMaterial
        ) {
          material.envMapIntensity = 0.55;
          material.needsUpdate = true;
        }
      });
    });
    onReady();
  }, [model, onReady]);

  return (
    <group position={[0, -1.3, 0]}>
      <primitive object={model} scale={1.37} />
    </group>
  );
}

function Scene({ onReady }: { onReady: () => void }) {
  return (
    <>
      <Environment resolution={128}>
        <Lightformer
          form="rect"
          color="#fffdf5"
          intensity={1.7}
          position={[-2.2, 1.2, 4]}
          rotation={[0.08, -0.34, -0.18]}
          scale={[0.16, 2.8, 1]}
        />
        <Lightformer
          form="rect"
          color="#e7efff"
          intensity={0.55}
          position={[2.6, 0.7, 3.2]}
          rotation={[0.04, 0.46, 0.22]}
          scale={[0.12, 2.2, 1]}
        />
      </Environment>
      <ambientLight intensity={0.65} color="#dce4dd" />
      <hemisphereLight color="#efffe8" groundColor="#050605" intensity={0.8} />
      <directionalLight
        castShadow
        color="#ffffff"
        intensity={1.8}
        position={[-3.5, 4.5, 5]}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight color={ACID} intensity={1.25} position={[4, 0.5, 3]} />
      <pointLight color={ACID} intensity={2.2} distance={4.5} position={[0, 0, 1]} />

      <HeroModel onReady={onReady} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableDamping
        dampingFactor={0.075}
        rotateSpeed={0.58}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
        minDistance={5.2}
        maxDistance={5.2}
        target={[0, 0, 0]}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.ROTATE,
          RIGHT: THREE.MOUSE.ROTATE,
        }}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
        }}
      />
    </>
  );
}

function SceneFallback() {
  return (
    <div className="scene-fallback">
      <div className="scene-fallback-core">AK</div>
    </div>
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
  const [modelReady, setModelReady] = useState(false);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const sceneVisible = useSceneVisibility(wrapper);
  const lowMotion = reducedMotion || coarsePointer || !sceneVisible;
  const handleModelReady = useCallback(() => setModelReady(true), []);

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
        zIndex: 2,
        pointerEvents: "auto",
        touchAction: "none",
        userSelect: "none",
        cursor: "grab",
      }}
    >
      {!webGLReady || !modelReady ? <SceneFallback /> : null}
      {webGLReady ? (
        <Canvas
          dpr={lowMotion ? 1 : [1, 1.5]}
          frameloop={lowMotion ? "demand" : "always"}
          shadows={!lowMotion}
          camera={{ position: [0, 0, 5.2], fov: 38, near: 0.1, far: 40 }}
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
          <Suspense fallback={null}>
            <Scene onReady={handleModelReady} />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  );
}

useGLTF.preload(MODEL_URL);
