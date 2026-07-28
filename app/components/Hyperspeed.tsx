"use client";

import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./Hyperspeed.css";

type NumberRange = [number, number];

type HyperspeedColors = {
  roadColor: number;
  islandColor: number;
  background: number;
  shoulderLines: number;
  brokenLines: number;
  leftCars: number[];
  rightCars: number[];
  sticks: number;
};

export type HyperspeedEffectOptions = {
  onSpeedUp?: () => void;
  onSlowDown?: () => void;
  distortion: "turbulentDistortion";
  length: number;
  roadWidth: number;
  islandWidth: number;
  lanesPerRoad: number;
  fov: number;
  fovSpeedUp: number;
  speedUp: number;
  carLightsFade: number;
  totalSideLightSticks: number;
  lightPairsPerRoadWay: number;
  shoulderLinesWidthPercentage: number;
  brokenLinesWidthPercentage: number;
  brokenLinesLengthPercentage: number;
  lightStickWidth: NumberRange;
  lightStickHeight: NumberRange;
  movingAwaySpeed: NumberRange;
  movingCloserSpeed: NumberRange;
  carLightsLength: NumberRange;
  carLightsRadius: NumberRange;
  carWidthPercentage: NumberRange;
  carShiftX: NumberRange;
  carFloorSeparation: NumberRange;
  colors: HyperspeedColors;
};

type HyperspeedProps = {
  effectOptions?: HyperspeedEffectOptions;
  className?: string;
};

const DEFAULT_EFFECT_OPTIONS: HyperspeedEffectOptions = {
  distortion: "turbulentDistortion",
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80],
  movingCloserSpeed: [-120, -160],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x050805,
    islandColor: 0x0b1409,
    background: 0x000000,
    shoulderLines: 0x263b18,
    brokenLines: 0x1d3112,
    leftCars: [0x2d5a17, 0x6fae2b, 0xb8ff3d],
    rightCars: [0x173b0d, 0x4e851d, 0x91d72d],
    sticks: 0xa8f335,
  },
};

const TURBULENT_DISTORTION = `
uniform vec4 uFreq;
uniform vec4 uAmp;

float nsin(float value) {
  return sin(value) * 0.5 + 0.5;
}

#define PI 3.14159265358979

float getDistortionX(float progress) {
  return (
    cos(PI * progress * uFreq.r + uTime) * uAmp.r +
    pow(
      cos(
        PI * progress * uFreq.g +
        uTime * (uFreq.g / uFreq.r)
      ),
      2.0
    ) * uAmp.g
  );
}

float getDistortionY(float progress) {
  return (
    -nsin(PI * progress * uFreq.b + uTime) * uAmp.b -
    pow(
      nsin(
        PI * progress * uFreq.a +
        uTime / (uFreq.b / uFreq.a)
      ),
      5.0
    ) * uAmp.a
  );
}

vec3 getDistortion(float progress) {
  return vec3(
    getDistortionX(progress) - getDistortionX(0.0125),
    getDistortionY(progress) - getDistortionY(0.0125),
    0.0
  );
}
`;

const CAR_LIGHTS_VERTEX = `
#define USE_FOG
${THREE.ShaderChunk.fog_pars_vertex}

attribute vec3 aOffset;
attribute vec3 aMetrics;
attribute vec3 aColor;
uniform float uTravelLength;
uniform float uTime;
varying vec2 vUv;
varying vec3 vColor;

${TURBULENT_DISTORTION}

void main() {
  vec3 transformed = position.xyz;
  float radius = aMetrics.r;
  float lightLength = aMetrics.g;
  float speed = aMetrics.b;

  transformed.xy *= radius;
  transformed.z *= lightLength;
  transformed.z +=
    lightLength - mod(uTime * speed + aOffset.z, uTravelLength);
  transformed.xy += aOffset.xy;

  float progress = abs(transformed.z / uTravelLength);
  transformed.xyz += getDistortion(progress);

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
  vColor = aColor;
  ${THREE.ShaderChunk.fog_vertex}
}
`;

const CAR_LIGHTS_FRAGMENT = `
#define USE_FOG
${THREE.ShaderChunk.fog_pars_fragment}

varying vec3 vColor;
varying vec2 vUv;
uniform vec2 uFade;

void main() {
  float alpha = smoothstep(uFade.x, uFade.y, vUv.x);
  gl_FragColor = vec4(vColor, alpha);
  if (gl_FragColor.a < 0.0001) discard;
  ${THREE.ShaderChunk.fog_fragment}
}
`;

const SIDE_STICKS_VERTEX = `
#define USE_FOG
${THREE.ShaderChunk.fog_pars_vertex}

attribute float aOffset;
attribute vec3 aColor;
attribute vec2 aMetrics;
uniform float uTravelLength;
uniform float uTime;
varying vec3 vColor;

${TURBULENT_DISTORTION}

mat4 rotationY(float angle) {
  return mat4(
    cos(angle), 0.0, sin(angle), 0.0,
    0.0, 1.0, 0.0, 0.0,
    -sin(angle), 0.0, cos(angle), 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}

void main() {
  vec3 transformed = position.xyz;
  float width = aMetrics.x;
  float height = aMetrics.y;
  float travelTime = mod(
    uTime * 120.0 + aOffset,
    uTravelLength
  );

  transformed.xy *= vec2(width, height);
  transformed =
    (rotationY(PI / 2.0) * vec4(transformed, 1.0)).xyz;
  transformed.z += -uTravelLength + travelTime;

  float progress = abs(transformed.z / uTravelLength);
  transformed.xyz += getDistortion(progress);
  transformed.y += height / 2.0;
  transformed.x -= width / 2.0;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vColor = aColor;
  ${THREE.ShaderChunk.fog_vertex}
}
`;

const SIDE_STICKS_FRAGMENT = `
#define USE_FOG
${THREE.ShaderChunk.fog_pars_fragment}

varying vec3 vColor;

void main() {
  gl_FragColor = vec4(vColor, 1.0);
  ${THREE.ShaderChunk.fog_fragment}
}
`;

const ROAD_VERTEX = `
#define USE_FOG
${THREE.ShaderChunk.fog_pars_vertex}

uniform float uTime;
uniform float uTravelLength;
varying vec2 vUv;

${TURBULENT_DISTORTION}

void main() {
  vec3 transformed = position.xyz;
  float progress =
    (transformed.y + uTravelLength / 2.0) / uTravelLength;
  vec3 distortion = getDistortion(progress);
  transformed.x += distortion.x;
  transformed.z += distortion.y;
  transformed.y -= distortion.z;

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  vUv = uv;
  ${THREE.ShaderChunk.fog_vertex}
}
`;

const ROAD_FRAGMENT = `
#define USE_FOG
${THREE.ShaderChunk.fog_pars_fragment}

varying vec2 vUv;
uniform vec3 uColor;
uniform vec3 uBrokenLinesColor;
uniform vec3 uShoulderLinesColor;
uniform float uLanes;
uniform float uShoulderLinesWidthPercentage;
uniform float uBrokenLinesWidthPercentage;
uniform float uBrokenLinesLengthPercentage;
uniform float uTime;

void main() {
  vec2 uv = vUv;
  vec3 color = uColor;

  float laneWidth = 1.0 / uLanes;
  float lanePosition = fract(uv.x / laneWidth);
  float laneEdge = min(lanePosition, 1.0 - lanePosition);
  float brokenWidth =
    uBrokenLinesWidthPercentage * uLanes * 0.5;
  float laneLine =
    1.0 - smoothstep(brokenWidth, brokenWidth + 0.015, laneEdge);
  float dash =
    step(
      1.0 - uBrokenLinesLengthPercentage,
      fract((uv.y + uTime * 0.045) * 10.0)
    );
  float brokenLines = laneLine * dash;

  float shoulderLines =
    1.0 -
    step(uShoulderLinesWidthPercentage, uv.x) +
    step(1.0 - uShoulderLinesWidthPercentage, uv.x);

  color = mix(color, uBrokenLinesColor, brokenLines);
  color = mix(
    color,
    uShoulderLinesColor,
    clamp(shoulderLines, 0.0, 1.0)
  );

  gl_FragColor = vec4(color, 1.0);
  ${THREE.ShaderChunk.fog_fragment}
}
`;

const ISLAND_FRAGMENT = `
#define USE_FOG
${THREE.ShaderChunk.fog_pars_fragment}

uniform vec3 uColor;

void main() {
  gl_FragColor = vec4(uColor, 1.0);
  ${THREE.ShaderChunk.fog_fragment}
}
`;

type FogUniforms = {
  fogColor: { value: THREE.Color };
  fogNear: { value: number };
  fogFar: { value: number };
};

type DistortionUniforms = {
  uFreq: { value: THREE.Vector4 };
  uAmp: { value: THREE.Vector4 };
};

type AnimatedLayer = {
  mesh: THREE.Mesh;
  update: (time: number) => void;
};

function randomRange([minimum, maximum]: NumberRange) {
  return Math.random() * (maximum - minimum) + minimum;
}

function randomColor(colors: number[]) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function createCarLights(
  scene: THREE.Scene,
  options: HyperspeedEffectOptions,
  colors: number[],
  speed: NumberRange,
  fade: THREE.Vector2,
  fogUniforms: FogUniforms,
  distortionUniforms: DistortionUniforms,
) {
  const curve = new THREE.LineCurve3(
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, -1),
  );
  const sourceGeometry = new THREE.TubeGeometry(curve, 40, 1, 8, false);
  const geometry = new THREE.InstancedBufferGeometry().copy(sourceGeometry);
  sourceGeometry.dispose();
  geometry.instanceCount = options.lightPairsPerRoadWay * 2;

  const offsets: number[] = [];
  const metrics: number[] = [];
  const colorValues: number[] = [];
  const laneWidth = options.roadWidth / options.lanesPerRoad;

  for (let index = 0; index < options.lightPairsPerRoadWay; index += 1) {
    const radius = randomRange(options.carLightsRadius);
    const lightLength = randomRange(options.carLightsLength);
    const lightSpeed = randomRange(speed);
    const lane = index % options.lanesPerRoad;
    let laneX =
      lane * laneWidth - options.roadWidth / 2 + laneWidth / 2;
    const carWidth =
      randomRange(options.carWidthPercentage) * laneWidth;
    laneX += randomRange(options.carShiftX) * laneWidth;

    const offsetY =
      randomRange(options.carFloorSeparation) + radius * 1.3;
    const offsetZ = -Math.random() * options.length;
    const color = new THREE.Color(randomColor(colors));

    offsets.push(
      laneX - carWidth / 2,
      offsetY,
      offsetZ,
      laneX + carWidth / 2,
      offsetY,
      offsetZ,
    );
    metrics.push(
      radius,
      lightLength,
      lightSpeed,
      radius,
      lightLength,
      lightSpeed,
    );
    colorValues.push(
      color.r,
      color.g,
      color.b,
      color.r,
      color.g,
      color.b,
    );
  }

  geometry.setAttribute(
    "aOffset",
    new THREE.InstancedBufferAttribute(
      new Float32Array(offsets),
      3,
      false,
    ),
  );
  geometry.setAttribute(
    "aMetrics",
    new THREE.InstancedBufferAttribute(
      new Float32Array(metrics),
      3,
      false,
    ),
  );
  geometry.setAttribute(
    "aColor",
    new THREE.InstancedBufferAttribute(
      new Float32Array(colorValues),
      3,
      false,
    ),
  );

  const timeUniform = { value: 0 };
  const material = new THREE.ShaderMaterial({
    vertexShader: CAR_LIGHTS_VERTEX,
    fragmentShader: CAR_LIGHTS_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uTime: timeUniform,
      uTravelLength: { value: options.length },
      uFade: { value: fade },
      ...fogUniforms,
      ...distortionUniforms,
    },
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);

  return {
    mesh,
    update: (time: number) => {
      timeUniform.value = time;
    },
  } satisfies AnimatedLayer;
}

function createSideSticks(
  scene: THREE.Scene,
  options: HyperspeedEffectOptions,
  fogUniforms: FogUniforms,
  distortionUniforms: DistortionUniforms,
) {
  const sourceGeometry = new THREE.PlaneGeometry(1, 1);
  const geometry = new THREE.InstancedBufferGeometry().copy(sourceGeometry);
  sourceGeometry.dispose();
  geometry.instanceCount = options.totalSideLightSticks;

  const offsets: number[] = [];
  const colors: number[] = [];
  const metrics: number[] = [];
  const spacing =
    options.length / Math.max(1, options.totalSideLightSticks - 1);
  const color = new THREE.Color(options.colors.sticks);

  for (let index = 0; index < options.totalSideLightSticks; index += 1) {
    offsets.push((index - 1) * spacing * 2 + spacing * Math.random());
    colors.push(color.r, color.g, color.b);
    metrics.push(
      randomRange(options.lightStickWidth),
      randomRange(options.lightStickHeight),
    );
  }

  geometry.setAttribute(
    "aOffset",
    new THREE.InstancedBufferAttribute(
      new Float32Array(offsets),
      1,
      false,
    ),
  );
  geometry.setAttribute(
    "aColor",
    new THREE.InstancedBufferAttribute(
      new Float32Array(colors),
      3,
      false,
    ),
  );
  geometry.setAttribute(
    "aMetrics",
    new THREE.InstancedBufferAttribute(
      new Float32Array(metrics),
      2,
      false,
    ),
  );

  const timeUniform = { value: 0 };
  const material = new THREE.ShaderMaterial({
    vertexShader: SIDE_STICKS_VERTEX,
    fragmentShader: SIDE_STICKS_FRAGMENT,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
    uniforms: {
      uTravelLength: { value: options.length },
      uTime: timeUniform,
      ...fogUniforms,
      ...distortionUniforms,
    },
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.position.x = -(options.roadWidth + options.islandWidth / 2);
  scene.add(mesh);

  return {
    mesh,
    update: (time: number) => {
      timeUniform.value = time;
    },
  } satisfies AnimatedLayer;
}

function createRoad(
  scene: THREE.Scene,
  options: HyperspeedEffectOptions,
  fogUniforms: FogUniforms,
  distortionUniforms: DistortionUniforms,
) {
  const timeUniform = { value: 0 };
  const meshes: THREE.Mesh[] = [];

  const createPlane = (
    side: -1 | 0 | 1,
    width: number,
    isRoad: boolean,
  ) => {
    const geometry = new THREE.PlaneGeometry(
      width,
      options.length,
      20,
      100,
    );
    const material = new THREE.ShaderMaterial({
      vertexShader: ROAD_VERTEX,
      fragmentShader: isRoad ? ROAD_FRAGMENT : ISLAND_FRAGMENT,
      side: THREE.DoubleSide,
      uniforms: {
        uTravelLength: { value: options.length },
        uColor: {
          value: new THREE.Color(
            isRoad
              ? options.colors.roadColor
              : options.colors.islandColor,
          ),
        },
        uTime: timeUniform,
        ...(isRoad
          ? {
              uLanes: { value: options.lanesPerRoad },
              uBrokenLinesColor: {
                value: new THREE.Color(options.colors.brokenLines),
              },
              uShoulderLinesColor: {
                value: new THREE.Color(options.colors.shoulderLines),
              },
              uShoulderLinesWidthPercentage: {
                value: options.shoulderLinesWidthPercentage,
              },
              uBrokenLinesWidthPercentage: {
                value: options.brokenLinesWidthPercentage,
              },
              uBrokenLinesLengthPercentage: {
                value: options.brokenLinesLengthPercentage,
              },
            }
          : {}),
        ...fogUniforms,
        ...distortionUniforms,
      },
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.z = -options.length / 2;
    mesh.position.x +=
      (options.islandWidth / 2 + options.roadWidth / 2) * side;
    scene.add(mesh);
    meshes.push(mesh);
  };

  createPlane(-1, options.roadWidth, true);
  createPlane(1, options.roadWidth, true);
  createPlane(0, options.islandWidth, false);

  return {
    meshes,
    update: (time: number) => {
      timeUniform.value = time;
    },
  };
}

function turbulentLookAt(progress: number, time: number) {
  const frequency = new THREE.Vector4(4, 8, 8, 1);
  const amplitude = new THREE.Vector4(25, 5, 10, 10);
  const normalizedSine = (value: number) => Math.sin(value) * 0.5 + 0.5;
  const getX = (value: number) =>
    Math.cos(Math.PI * value * frequency.x + time) * amplitude.x +
    Math.cos(
      Math.PI * value * frequency.y +
        time * (frequency.y / frequency.x),
    ) **
      2 *
      amplitude.y;
  const getY = (value: number) =>
    -normalizedSine(Math.PI * value * frequency.z + time) * amplitude.z -
    normalizedSine(
      Math.PI * value * frequency.w +
        time / (frequency.z / frequency.w),
    ) **
      5 *
      amplitude.w;

  return new THREE.Vector3(
    (getX(progress) - getX(progress + 0.007)) * -2,
    (getY(progress) - getY(progress + 0.007)) * -5,
    -10,
  );
}

export default function Hyperspeed({
  effectOptions = DEFAULT_EFFECT_OPTIONS,
  className = "",
}: HyperspeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    const options = effectOptions;
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(1);
    renderer.setSize(width, height, false);
    renderer.setClearColor(options.colors.background, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;
    const fog = new THREE.Fog(
      options.colors.background,
      options.length * 0.2,
      options.length * 500,
    );
    scene.fog = fog;
    const fogUniforms: FogUniforms = {
      fogColor: { value: fog.color },
      fogNear: { value: fog.near },
      fogFar: { value: fog.far },
    };
    const distortionUniforms: DistortionUniforms = {
      uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
      uAmp: { value: new THREE.Vector4(25, 5, 10, 10) },
    };

    const camera = new THREE.PerspectiveCamera(
      options.fov,
      width / height,
      0.1,
      10_000,
    );
    camera.position.set(0, 8, -5);

    const road = createRoad(
      scene,
      options,
      fogUniforms,
      distortionUniforms,
    );
    const leftLights = createCarLights(
      scene,
      options,
      options.colors.leftCars,
      options.movingAwaySpeed,
      new THREE.Vector2(0, 1 - options.carLightsFade),
      fogUniforms,
      distortionUniforms,
    );
    leftLights.mesh.position.x =
      -options.roadWidth / 2 - options.islandWidth / 2;

    const rightLights = createCarLights(
      scene,
      options,
      options.colors.rightCars,
      options.movingCloserSpeed,
      new THREE.Vector2(1, options.carLightsFade),
      fogUniforms,
      distortionUniforms,
    );
    rightLights.mesh.position.x =
      options.roadWidth / 2 + options.islandWidth / 2;

    const sideSticks = createSideSticks(
      scene,
      options,
      fogUniforms,
      distortionUniforms,
    );

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new BloomEffect({
      intensity: 1,
      luminanceThreshold: 0.2,
      luminanceSmoothing: 0.1,
      resolutionScale: 1,
    });
    const effectPass = new EffectPass(camera, bloom);
    effectPass.renderToScreen = true;
    composer.addPass(effectPass);

    let animationFrame = 0;
    let lastFrame = performance.now();
    let lastDraw = 0;
    let elapsed = 0;
    let speedUp = 0;
    let speedTarget = 0;
    let fovTarget = options.fov;
    let onScreen = true;
    let documentVisible = document.visibilityState !== "hidden";
    let needsRender = true;
    let disposed = false;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;

    const resize = () => {
      const nextWidth = Math.max(1, container.clientWidth);
      const nextHeight = Math.max(1, container.clientHeight);
      renderer.setSize(nextWidth, nextHeight, false);
      composer.setSize(nextWidth, nextHeight);
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      needsRender = true;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const intersectionObserver =
      typeof IntersectionObserver === "undefined"
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              onScreen = entry.isIntersecting;
              needsRender = true;
            },
            { rootMargin: "120px 0px", threshold: 0.01 },
          );
    intersectionObserver?.observe(container);

    const isInside = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      return (
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom
      );
    };
    const speedUpEffect = (event: PointerEvent) => {
      if (!isInside(event) || reducedMotion) return;
      fovTarget = options.fovSpeedUp;
      speedTarget = options.speedUp;
      options.onSpeedUp?.();
    };
    const slowDownEffect = () => {
      fovTarget = options.fov;
      speedTarget = 0;
      options.onSlowDown?.();
    };
    const handleVisibility = () => {
      documentVisible = document.visibilityState !== "hidden";
      needsRender = true;
    };
    const handleMotionPreference = () => {
      reducedMotion = motionQuery.matches;
      if (reducedMotion) slowDownEffect();
      needsRender = true;
    };

    window.addEventListener("pointerdown", speedUpEffect, {
      passive: true,
    });
    window.addEventListener("pointerup", slowDownEffect, {
      passive: true,
    });
    window.addEventListener("pointercancel", slowDownEffect, {
      passive: true,
    });
    window.addEventListener("blur", slowDownEffect);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotionPreference);

    const draw = (now: number) => {
      if (disposed) return;
      animationFrame = window.requestAnimationFrame(draw);

      if (!onScreen || !documentVisible) {
        lastFrame = now;
        return;
      }

      const frameInterval = reducedMotion
        ? Number.POSITIVE_INFINITY
        : 1000 / 45;
      if (!needsRender && now - lastDraw < frameInterval) return;
      if (!reducedMotion && now - lastDraw < frameInterval) return;

      const delta = Math.max(0, Math.min(0.1, (now - lastFrame) / 1000));
      lastFrame = now;
      lastDraw = now;

      if (!reducedMotion) {
        const response = 1 - Math.exp(-8 * delta);
        speedUp += (speedTarget - speedUp) * response;
        camera.fov += (fovTarget - camera.fov) * response;
        elapsed += delta * (1 + speedUp);
      }

      leftLights.update(elapsed);
      rightLights.update(elapsed);
      sideSticks.update(elapsed);
      road.update(elapsed);

      const distortion = turbulentLookAt(0.025, elapsed);
      camera.lookAt(
        camera.position.x + distortion.x,
        camera.position.y + distortion.y,
        camera.position.z + distortion.z,
      );
      camera.updateProjectionMatrix();
      composer.render(delta);
      needsRender = false;
    };

    resize();
    animationFrame = window.requestAnimationFrame(draw);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener("pointerdown", speedUpEffect);
      window.removeEventListener("pointerup", slowDownEffect);
      window.removeEventListener("pointercancel", slowDownEffect);
      window.removeEventListener("blur", slowDownEffect);
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotionPreference);

      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      });
      scene.clear();
      composer.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [effectOptions]);

  return (
    <div
      ref={containerRef}
      className={`hyperspeed${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
