"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { PROJECTS_DATA } from "@/data/projects";

// ============================================================================
// 1. SHADER GLSL DE LA PARED LED PLANA CON SURCOS NEGROS + REFLEJO DEL CARRUSEL
// ============================================================================
const ledWallVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec3 pos = position;

    float nx = pos.x / 19.0;
    float ny = pos.y / 11.0;
    float r2 = nx * nx + ny * ny;
    pos.z += r2 * 6.8;

    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const ledWallFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uMouseSpeed;
  uniform sampler2D uKineticTextTex;
  uniform sampler2D uProjTexCurr;
  uniform sampler2D uProjTexNext;
  uniform float uProjMix;
  uniform float uCarouselBlend;
  uniform vec3 uAccentColor;

  varying vec2 vUv;
  varying vec3 vWorldPos;

  float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 74.7);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float crispGroove(vec2 uv, vec2 gridCount, float grooveWidthPx) {
    vec2 g = abs(fract(uv * gridCount - 0.5) - 0.5) / fwidth(uv * gridCount);
    float distToSeam = min(g.x, g.y);
    return 1.0 - smoothstep(grooveWidthPx * 0.45, grooveWidthPx * 0.95, distToSeam);
  }

  float moduleWatermarkG(vec2 p) {
    p = (p - 0.5) * 2.5;
    float boxOuter = max(abs(p.x), abs(p.y));
    float ring = step(boxOuter, 0.52) * step(0.36, boxOuter);
    float cutOpening = step(0.08, p.x) * step(0.0, p.y) * step(p.y, 0.36);
    float innerBar = step(0.02, p.x) * step(p.x, 0.52) * step(abs(p.y + 0.04), 0.08);
    return clamp(ring - cutOpening + innerBar, 0.0, 1.0);
  }

  void main() {
    vec2 macroGrid = vec2(6.0, 3.5);
    vec2 cabinetGrid = macroGrid * 2.0;
    vec2 subPanelGrid = macroGrid * 4.0;
    vec2 ledMatrixGrid = macroGrid * 32.0;

    vec2 cabId = floor(vUv * cabinetGrid);
    vec2 subId = floor(vUv * subPanelGrid);

    float randCab = hash21(cabId);
    float randSub = hash21(subId + 41.7);

    float isSplit = step(0.46, randCab);
    vec2 activePanelId = mix(cabId, subId, isSplit);
    vec2 activePanelGrid = mix(cabinetGrid, subPanelGrid, isSplit);
    vec2 activePanelUv = mix(fract(vUv * cabinetGrid), fract(vUv * subPanelGrid), isSplit);
    float activeRand   = mix(randCab, randSub, isSplit);

    vec2 centered = (vUv - 0.5) * vec2(1.77, 1.0);
    float distCenter = length(centered);

    float kineticLuma = texture2D(uKineticTextTex, vUv).r;

    float t = uTime * 0.35;
    float slowField = noise(centered * 2.5 + vec2(t * 0.35, -t * 0.2));
    float centerBeam = exp(-distCenter * distCenter * 2.9);
    float movingBeam = exp(-length(centered - vec2(sin(t * 0.9) * 0.25, cos(t * 0.7) * 0.15)) * 2.4);

    vec3 colBlack      = vec3(0.008, 0.012, 0.015);
    vec3 colAlcheGreen = mix(vec3(0.032, 0.375, 0.240), uAccentColor, uCarouselBlend * 0.75);
    vec3 colDeepTeal   = mix(vec3(0.022, 0.215, 0.255), uAccentColor * 0.65, uCarouselBlend * 0.65);

    vec3 baseEmission = mix(colDeepTeal, colAlcheGreen, centerBeam * 0.85 + slowField * 0.25);
    float totalLuma = clamp(centerBeam * 0.92 + movingBeam * 0.38, 0.0, 1.0);
    vec3 screenColor = mix(colBlack, baseEmission, totalLuma);

    if (uCarouselBlend > 0.001) {
      vec2 panelCenterUv = (activePanelId + 0.5) / activePanelGrid;
      vec2 projSampleUv = mix(vUv, panelCenterUv, 0.38);
      vec2 framedUv = clamp((projSampleUv - 0.5) * vec2(1.15, 1.25) + 0.5, 0.02, 0.98);

      vec3 texA = texture2D(uProjTexCurr, framedUv).rgb;
      vec3 texB = texture2D(uProjTexNext, framedUv).rgb;
      vec3 projReflect = mix(texA, texB, uProjMix);

      float reflectMask = exp(-distCenter * distCenter * 1.65) * uCarouselBlend;
      screenColor = mix(screenColor, projReflect * 0.52 + uAccentColor * 0.22, reflectMask * 0.78);
    }

    screenColor *= mix(1.0, 0.24, kineticLuma * 0.85);

    float panelPulse = sin(uTime * 0.8 + activeRand * 6.2831) * 0.06;
    float flatPanelExposure = mix(0.45, 1.28, activeRand) + panelPulse;

    float darkPanelState = step(0.18, fract(activeRand + floor(uTime * 0.22) * 0.17));
    screenColor *= flatPanelExposure * mix(0.26, 1.0, darkPanelState);

    float watermark = moduleWatermarkG(activePanelUv);
    screenColor *= (1.0 + watermark * 0.14);

    vec2 mouseUv = uMouse * 0.5 + 0.5;
    float distMouse = length((vUv - mouseUv) * vec2(1.77, 1.0));
    float mouseGlow = exp(-distMouse * 7.0) * (0.30 + uMouseSpeed * 0.95);
    screenColor += mix(vec3(0.05, 0.35, 0.28), uAccentColor, uCarouselBlend) * mouseGlow;

    float ledPixelGroove = crispGroove(vUv, ledMatrixGrid, 0.72);
    screenColor *= (1.0 - ledPixelGroove * 0.52);

    float subPanelGroove = crispGroove(vUv, subPanelGrid, 1.35) * isSplit;
    float cabinetGroove = crispGroove(vUv, cabinetGrid, 1.85);
    float macroGroove = crispGroove(vUv, macroGrid, 2.55);

    float totalBlackTrench = clamp(max(max(macroGroove, cabinetGroove * 0.92), subPanelGroove * 0.82), 0.0, 1.0);

    vec3 chassisBlack = vec3(0.005, 0.007, 0.009);
    screenColor = mix(screenColor, chassisBlack, totalBlackTrench);

    float lipHighlight = crispGroove(vUv + vec2(0.0004, -0.0006), macroGrid, 1.0) * (1.0 - macroGroove);
    screenColor += vec3(0.08, 0.16, 0.14) * lipHighlight * 0.55;

    vec2 crossUv = fract(vUv * macroGrid + 0.5) - 0.5;
    vec2 crossDeriv = fwidth(vUv * macroGrid);
    float armH = (1.0 - smoothstep(0.0, crossDeriv.y * 1.15, abs(crossUv.y))) * step(abs(crossUv.x), 0.024);
    float armV = (1.0 - smoothstep(0.0, crossDeriv.x * 1.15, abs(crossUv.x))) * step(abs(crossUv.y), 0.024);
    float plusSymbol = max(armH, armV);

    vec2 subCrossUv = fract(vUv * cabinetGrid + 0.5) - 0.5;
    vec2 subCrossDeriv = fwidth(vUv * cabinetGrid);
    float subArmH = (1.0 - smoothstep(0.0, subCrossDeriv.y * 1.05, abs(subCrossUv.y))) * step(abs(subCrossUv.x), 0.020);
    float subArmV = (1.0 - smoothstep(0.0, subCrossDeriv.x * 1.05, abs(subCrossUv.x))) * step(abs(subCrossUv.y), 0.020);
    float subPlusSymbol = max(subArmH, subArmV) * (1.0 - plusSymbol);

    screenColor = mix(screenColor, vec3(0.68, 0.78, 0.75), plusSymbol * 0.62);
    screenColor = mix(screenColor, vec3(0.42, 0.52, 0.50), subPlusSymbol * 0.32);

    float vignette = smoothstep(1.06, 0.22, length(centered * vec2(0.94, 1.12)));
    screenColor *= (0.07 + 0.93 * vignette);

    gl_FragColor = vec4(screenColor, 1.0);
  }
`;

// ============================================================================
// 2. COMPONENTE DE LA BÓVEDA LED PROFUNDA EN 3D
// ============================================================================
export function CurvedLEDWall({
  mouseRef,
  scrollRef,
  projectTextures,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number; speed: number }>;
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    velocity: number;
  }>;
  projectTextures: {
    desktop: THREE.Texture[];
    mobile: THREE.Texture[];
    desktopAspects: number[];
    mobileAspects: number[];
  };
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();
  const isMobile = size.width < 768;

  const { kineticCanvas, kineticTexture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return { kineticCanvas: canvas, kineticTexture: texture };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseSpeed: { value: 0 },
      uKineticTextTex: { value: kineticTexture },
      uProjTexCurr: { value: kineticTexture },
      uProjTexNext: { value: kineticTexture },
      uProjMix: { value: 0 },
      uCarouselBlend: { value: 0 },
      uAccentColor: { value: new THREE.Vector3(0.032, 0.375, 0.24) },
    }),
    [kineticTexture]
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const s = scrollRef.current.current;
    const ctx = kineticCanvas.getContext("2d");

    if (ctx) {
      const w = kineticCanvas.width;
      const h = kineticCanvas.height;

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.translate(w * 0.5, h * 0.36);
      ctx.rotate(-0.18);
      ctx.font = "900 265px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const drift = Math.sin(t * 0.28) * 140;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(s > 0.08 ? "PROYECTOS" : "GUIPORDI", drift, -35);

      ctx.font = "800 175px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
      ctx.fillText("SOLUCIONES", -drift * 0.8, 155);
      ctx.restore();

      kineticTexture.needsUpdate = true;
    }

    if (!materialRef.current) return;
    materialRef.current.uniforms.uTime.value = t;
    materialRef.current.uniforms.uMouse.value.lerp(
      new THREE.Vector2(mouseRef.current.x, mouseRef.current.y),
      0.08
    );
    materialRef.current.uniforms.uMouseSpeed.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uMouseSpeed.value,
      mouseRef.current.speed,
      0.08
    );

    const carouselBlend = THREE.MathUtils.smoothstep(s, 0.05, 0.16);
    materialRef.current.uniforms.uCarouselBlend.value = carouselBlend;

    const totalProjects = PROJECTS_DATA.length;
    const carouselProgress =
      Math.max(0, (s - 0.14) / 0.86) * (totalProjects - 1);
    const idxCurr = Math.min(
      Math.max(Math.floor(carouselProgress), 0),
      totalProjects - 1
    );
    const idxNext = Math.min(idxCurr + 1, totalProjects - 1);
    const fractMix = carouselProgress - idxCurr;

    const activeTexArray = isMobile
      ? projectTextures.mobile
      : projectTextures.desktop;

    if (activeTexArray[idxCurr] && activeTexArray[idxNext]) {
      materialRef.current.uniforms.uProjTexCurr.value = activeTexArray[idxCurr];
      materialRef.current.uniforms.uProjTexNext.value = activeTexArray[idxNext];
      materialRef.current.uniforms.uProjMix.value = fractMix;
    }

    const cA = PROJECTS_DATA[idxCurr].accentRGB;
    const cB = PROJECTS_DATA[idxNext].accentRGB;
    materialRef.current.uniforms.uAccentColor.value.set(
      THREE.MathUtils.lerp(cA[0], cB[0], fractMix),
      THREE.MathUtils.lerp(cA[1], cB[1], fractMix),
      THREE.MathUtils.lerp(cA[2], cB[2], fractMix)
    );
  });

  return (
    <mesh position={[0, 0, -14.5]}>
      <planeGeometry args={[46, 27, 192, 112]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={ledWallVertexShader}
        fragmentShader={ledWallFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// ============================================================================
// 3. PLANO TIPOGRÁFICO MONUMENTAL ("GuiporDI" -> "PROYECTOS")
// ============================================================================
export function BrandTypographyPlane({
  mouseRef,
  scrollRef,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number; speed: number }>;
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    velocity: number;
  }>;
}) {
  const heroMeshRef = useRef<THREE.Mesh>(null);
  const worksMeshRef = useRef<THREE.Mesh>(null);
  const heroMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const worksMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const { viewport } = useThree();

  const { heroTexture, worksTexture } = useMemo(() => {
    const canvasHero = document.createElement("canvas");
    canvasHero.width = 4096;
    canvasHero.height = 1536;
    const ctxH = canvasHero.getContext("2d");

    if (ctxH) {
      ctxH.clearRect(0, 0, canvasHero.width, canvasHero.height);
      ctxH.textAlign = "center";
      ctxH.textBaseline = "middle";

      ctxH.fillStyle = "#FFFFFF";
      ctxH.font =
        "900 730px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctxH.letterSpacing = "-6px";
      ctxH.fillText("GuiporDI", canvasHero.width / 2, canvasHero.height * 0.46);

      ctxH.font =
        "700 86px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctxH.fillStyle = "rgba(255, 255, 255, 0.86)";
      ctxH.letterSpacing = "92px";
      ctxH.fillText(
        "SOLUCIONES",
        canvasHero.width / 2 + 46,
        canvasHero.height * 0.89
      );
    }

    const texHero = new THREE.CanvasTexture(canvasHero);
    texHero.anisotropy = 16;
    texHero.needsUpdate = true;

    const canvasWorks = document.createElement("canvas");
    canvasWorks.width = 4096;
    canvasWorks.height = 1536;
    const ctxW = canvasWorks.getContext("2d");

    if (ctxW) {
      ctxW.clearRect(0, 0, canvasWorks.width, canvasWorks.height);
      ctxW.textAlign = "center";
      ctxW.textBaseline = "middle";
      ctxW.fillStyle = "rgba(255, 255, 255, 0.32)";
      ctxW.font =
        "900 580px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctxW.letterSpacing = "12px";
      ctxW.fillText(
        "PROYECTOS",
        canvasWorks.width / 2,
        canvasWorks.height * 0.5
      );
    }

    const texWorks = new THREE.CanvasTexture(canvasWorks);
    texWorks.anisotropy = 16;
    texWorks.needsUpdate = true;

    return { heroTexture: texHero, worksTexture: texWorks };
  }, []);

  useFrame(() => {
    const s = scrollRef.current.current;

    const heroOpacity = 1.0 - THREE.MathUtils.smoothstep(s, 0.02, 0.13);
    const worksEnter = THREE.MathUtils.smoothstep(s, 0.06, 0.15);
    const worksFade = 1.0 - THREE.MathUtils.smoothstep(s, 0.18, 0.34);
    const worksOpacity = worksEnter * Math.max(0.28, worksFade);

    if (heroMeshRef.current && heroMatRef.current) {
      heroMatRef.current.opacity = heroOpacity;
      heroMeshRef.current.visible = heroOpacity > 0.01;
      heroMeshRef.current.position.x = THREE.MathUtils.lerp(
        heroMeshRef.current.position.x,
        -mouseRef.current.x * 0.14,
        0.06
      );
      heroMeshRef.current.position.y = THREE.MathUtils.lerp(
        heroMeshRef.current.position.y,
        0.04 - mouseRef.current.y * 0.08 + s * 2.2,
        0.08
      );
    }

    if (worksMeshRef.current && worksMatRef.current) {
      worksMatRef.current.opacity = worksOpacity;
      worksMeshRef.current.visible = worksOpacity > 0.01;
      worksMeshRef.current.rotation.z = -0.05;
      worksMeshRef.current.rotation.y = 0.12 - mouseRef.current.x * 0.08;
      worksMeshRef.current.position.x = THREE.MathUtils.lerp(
        worksMeshRef.current.position.x,
        -mouseRef.current.x * 0.18,
        0.06
      );
    }
  });

  const planeWidth = Math.min(viewport.width * 1.24, 17.8);
  const planeHeight = planeWidth * (1536 / 4096);

  return (
    <>
      <mesh ref={heroMeshRef} position={[0, 0.04, -3.2]}>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial
          ref={heroMatRef}
          map={heroTexture}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh ref={worksMeshRef} position={[0, 0.12, -3.6]} visible={false}>
        <planeGeometry args={[planeWidth * 1.05, planeHeight * 1.05]} />
        <meshBasicMaterial
          ref={worksMatRef}
          map={worksTexture}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

// ============================================================================
// 4. MONOLITO ARQUITECTÓNICO "G" CON ROTACIÓN DE SCROLL
// ============================================================================
export function ArchitecturalGlassMonolithG({
  mouseRef,
  scrollRef,
  onNormalUpdate,
}: {
  mouseRef: React.MutableRefObject<{ x: number; y: number; speed: number }>;
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    velocity: number;
  }>;
  onNormalUpdate: (nx: number, ny: number, nz: number) => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { viewport } = useThree();

  const mineralRoughnessMap = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.fillStyle = "#6e6e6e";
      ctx.fillRect(0, 0, size, size);

      const imgData = ctx.getImageData(0, 0, size, size);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const grain = 85 + Math.floor(Math.random() * 115);
        data[i] = grain;
        data[i + 1] = grain;
        data[i + 2] = grain;
        data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 3);
    tex.needsUpdate = true;
    return tex;
  }, []);

  const outerGGeometry = useMemo(() => {
    const gShape = new THREE.Shape();

    gShape.moveTo(1.65, 1.35);
    gShape.lineTo(1.0, 2.2);
    gShape.lineTo(-1.0, 2.2);
    gShape.lineTo(-1.85, 1.25);
    gShape.lineTo(-1.85, -1.25);
    gShape.lineTo(-1.0, -2.2);
    gShape.lineTo(1.05, -2.2);
    gShape.lineTo(1.85, -1.3);
    gShape.lineTo(1.85, 0.18);
    gShape.lineTo(0.08, 0.18);
    gShape.lineTo(-0.22, -0.42);
    gShape.lineTo(1.12, -0.42);
    gShape.lineTo(1.12, -1.08);
    gShape.lineTo(0.65, -1.52);
    gShape.lineTo(-0.65, -1.52);
    gShape.lineTo(-1.12, -1.0);
    gShape.lineTo(-1.12, 1.0);
    gShape.lineTo(-0.65, 1.52);
    gShape.lineTo(0.65, 1.52);
    gShape.lineTo(1.12, 0.95);
    gShape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.62,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.07,
      bevelThickness: 0.09,
      curveSegments: 12,
    };

    const geom = new THREE.ExtrudeGeometry(gShape, extrudeSettings);
    geom.center();
    return geom;
  }, []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const s = scrollRef.current.current;

    const scrollSpinY = s * Math.PI * 1.35;
    const scrollTiltX = Math.sin(s * Math.PI) * 0.22;
    const scrollDepthZ =
      -0.4 - THREE.MathUtils.smoothstep(s, 0.04, 0.18) * 1.35;
    const scrollPosX = THREE.MathUtils.smoothstep(s, 0.05, 0.18) * -0.45;

    const targetRotY =
      mouseRef.current.x * 0.38 + Math.sin(t * 0.4) * 0.05 + scrollSpinY;
    const targetRotX =
      -mouseRef.current.y * 0.24 + Math.cos(t * 0.32) * 0.035 + scrollTiltX;
    const targetRotZ = -mouseRef.current.x * 0.04;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetRotY,
      0.06
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.06
    );
    groupRef.current.rotation.z = THREE.MathUtils.lerp(
      groupRef.current.rotation.z,
      targetRotZ,
      0.06
    );

    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      scrollDepthZ,
      0.08
    );
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      scrollPosX,
      0.08
    );

    const normalVec = new THREE.Vector3(0, 0, 1)
      .applyEuler(groupRef.current.rotation)
      .normalize();
    onNormalUpdate(normalVec.x, normalVec.y, normalVec.z);
  });

  const responsiveScale = Math.min(
    Math.max(viewport.width * 0.062, 0.45),
    0.66
  );

  return (
    <group ref={groupRef} position={[0, 0.05, -0.4]} scale={responsiveScale}>
      <mesh geometry={outerGGeometry}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={0.6}
          thickness={1.35}
          roughness={0.28}
          roughnessMap={mineralRoughnessMap}
          transmission={1}
          ior={1.32}
          chromaticAberration={0.26}
          anisotropy={0.35}
          distortion={0.18}
          distortionScale={0.32}
          temporalDistortion={0.05}
          clearcoat={0.65}
          clearcoatRoughness={0.22}
          attenuationDistance={3.2}
          attenuationColor="#d1fae5"
          color="#ecfdf5"
          resolution={1024}
          samples={6}
        />
      </mesh>
    </group>
  );
}