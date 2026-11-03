"use client";

import React, { useRef, useMemo, useState } from "react";
import { useFrame, useThree, ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { PROJECTS_DATA, ProjectItem } from "@/data/projects";

// ============================================================================
// 1. SHADER GLSL DE LAS TARJETAS CURVAS 3D DEL CARRUSEL (ENCUADRE MÓVIL ÓPTIMO)
// ============================================================================
const projectCardVertexShader = /* glsl */ `
  uniform float uCardOffset;
  uniform float uScrollVelocity;
  uniform float uHover;
  uniform float uIsMobile;

  varying vec2 vUv;
  varying float vBend;

  void main() {
    vUv = uv;
    vec3 pos = position;

    // Curvatura cilíndrica sutil adaptada a la pantalla
    float localArch = (uv.x - 0.5);
    float bendDepth = uIsMobile > 0.5 ? 0.18 : 0.42;
    pos.z -= (localArch * localArch) * bendDepth;

    float waveTwist = clamp(uScrollVelocity * 0.15, -0.2, 0.2);
    pos.z += sin((uv.x - 0.5) * 3.14159) * waveTwist;
    pos.z += uHover * 0.12;

    vBend = localArch;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const projectCardFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uImageAspect;
  uniform float uPlaneAspect;
  uniform float uOpacity;
  uniform float uHover;
  uniform float uActiveFactor;
  uniform float uTime;
  uniform vec3 uAccent;
  uniform float uIsMobile;

  varying vec2 vUv;
  varying float vBend;

  void main() {
    // En móvil usamos un ajuste de contención perfecto para que la captura vertical no se recorte
    vec2 ratio = vec2(
      min(uPlaneAspect / uImageAspect, 1.0),
      min(uImageAspect / uPlaneAspect, 1.0)
    );

    if (uIsMobile > 0.5) {
      ratio = vec2(1.0, 1.0); // Cobertura completa sin deformación en teléfonos
    }

    float zoom = 1.0 - uHover * 0.025;
    vec2 sampleUv = (vUv - 0.5) * ratio * zoom + 0.5;
    sampleUv = clamp(sampleUv, 0.001, 0.999);

    vec3 imgCol = texture2D(uTexture, sampleUv).rgb;

    float specularBand = exp(-pow((vUv.x - 0.5 + sin(uTime * 0.7) * 0.18) * 3.2, 2.0)) * 0.06;
    imgCol += vec3(specularBand);

    float sideDim = mix(0.45, 1.0, uActiveFactor);
    imgCol *= sideDim;

    vec2 borderDist = min(vUv, 1.0 - vUv);
    vec2 borderPx = borderDist / fwidth(vUv);
    float minBorderPx = min(borderPx.x, borderPx.y);
    float borderLine = 1.0 - smoothstep(1.0, 2.0, minBorderPx);

    vec3 frameColor = mix(vec3(0.35, 0.45, 0.48), uAccent + vec3(0.35), uActiveFactor * 0.7 + uHover * 0.3);
    vec3 finalCol = mix(imgCol, frameColor, borderLine * 0.85);

    gl_FragColor = vec4(finalCol, uOpacity);
  }
`;

// ============================================================================
// 2. TARJETA INDIVIDUAL 3D CURVA (OPTIMIZADA PARA MÓVIL Y ORDENADOR)
// ============================================================================
function CurvedProjectCardMesh({
  index,
  project,
  texture,
  imageAspect,
  isMobile,
  scrollRef,
  onSelectProject,
}: {
  index: number;
  project: ProjectItem;
  texture: THREE.Texture;
  imageAspect: number;
  isMobile: boolean;
  scrollRef: React.MutableRefObject<{
    current: number;
    target: number;
    velocity: number;
  }>;
  onSelectProject: (p: ProjectItem) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const { viewport } = useThree();

  const { cardWidth, cardHeight, planeAspect } = useMemo(() => {
    if (isMobile) {
      // Dimensiones proporcionales exactas para la pantalla vertical del celular
      const w = Math.min(viewport.width * 0.78, 2.45);
      const h = w * 1.32; // Formato vertical óptimo para '*-mobil.png'
      return { cardWidth: w, cardHeight: h, planeAspect: w / h };
    } else {
      const w = Math.min(viewport.width * 0.48, 5.45);
      const h = w * 0.575;
      return { cardWidth: w, cardHeight: h, planeAspect: w / h };
    }
  }, [isMobile, viewport.width, viewport.height]);

  const uniforms = useMemo(
    () => ({
      uTexture: { value: texture },
      uImageAspect: { value: imageAspect },
      uPlaneAspect: { value: planeAspect },
      uCardOffset: { value: 0 },
      uScrollVelocity: { value: 0 },
      uHover: { value: 0 },
      uOpacity: { value: 0 },
      uActiveFactor: { value: 0 },
      uTime: { value: 0 },
      uIsMobile: { value: isMobile ? 1.0 : 0.0 },
      uAccent: {
        value: new THREE.Vector3(
          project.accentRGB[0],
          project.accentRGB[1],
          project.accentRGB[2]
        ),
      },
    }),
    [texture, imageAspect, planeAspect, isMobile, project.accentRGB]
  );

  useFrame((state) => {
    if (!meshRef.current || !matRef.current) return;
    const s = scrollRef.current.current;
    const total = PROJECTS_DATA.length;

    const carouselVisibility = THREE.MathUtils.smoothstep(s, 0.07, 0.14);
    const activeFloat = Math.max(0, (s - 0.14) / 0.86) * (total - 1);
    const diff = index - activeFloat;

    // Espaciado horizontal adaptado para móvil y ordenador
    const spacingX = isMobile ? cardWidth * 1.08 : cardWidth * 1.14;
    const centerShiftX = isMobile ? 0.0 : 0.35;
    const centerShiftY = isMobile ? 0.32 : 0.18; // Elevado en móvil para dejar espacio al HUD inferior

    const targetX = centerShiftX + diff * spacingX;
    const arcZ =
      (isMobile ? 1.1 : 1.05) -
      Math.pow(Math.abs(diff), 1.25) * (isMobile ? 0.55 : 0.95) -
      (1.0 - carouselVisibility) * 3.2;
    const arcRotY = -diff * (isMobile ? 0.12 : 0.22);

    meshRef.current.position.x = targetX;
    meshRef.current.position.y =
      centerShiftY - (1.0 - carouselVisibility) * 1.4;
    meshRef.current.position.z = arcZ;
    meshRef.current.rotation.y = arcRotY;

    const distVisibility =
      1.0 - THREE.MathUtils.smoothstep(Math.abs(diff), 1.8, 2.7);
    const finalOpacity = carouselVisibility * distVisibility;
    meshRef.current.visible = finalOpacity > 0.01;

    matRef.current.uniforms.uTexture.value = texture;
    matRef.current.uniforms.uImageAspect.value = imageAspect;
    matRef.current.uniforms.uPlaneAspect.value = planeAspect;
    matRef.current.uniforms.uIsMobile.value = isMobile ? 1.0 : 0.0;
    matRef.current.uniforms.uCardOffset.value = diff;
    matRef.current.uniforms.uScrollVelocity.value = scrollRef.current.velocity;
    matRef.current.uniforms.uOpacity.value = finalOpacity;
    matRef.current.uniforms.uActiveFactor.value =
      1.0 - Math.min(Math.abs(diff), 1.0);
    matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    matRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
      matRef.current.uniforms.uHover.value,
      hovered ? 1.0 : 0.0,
      0.12
    );
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (scrollRef.current.current < 0.1) return;
    onSelectProject(project);
  };

  return (
    <mesh
      ref={meshRef}
      onClick={handleClick}
      onPointerOver={() => {
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      <planeGeometry args={[cardWidth, cardHeight, 48, 24]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={projectCardVertexShader}
        fragmentShader={projectCardFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

// ============================================================================
// 3. GALERÍA CARRUSEL 3D DE LOS 9 PROYECTOS
// ============================================================================
export function ProjectsCurvedCarousel3D({
  scrollRef,
  projectTextures,
  onSelectProject,
}: {
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
  onSelectProject: (p: ProjectItem) => void;
}) {
  const { size } = useThree();
  const isMobile = size.width < 768;

  return (
    <group>
      {PROJECTS_DATA.map((proj, idx) => {
        const tex = isMobile
          ? projectTextures.mobile[idx]
          : projectTextures.desktop[idx];
        const aspect = isMobile
          ? projectTextures.mobileAspects[idx]
          : projectTextures.desktopAspects[idx];

        if (!tex) return null;

        return (
          <CurvedProjectCardMesh
            key={proj.slug}
            index={idx}
            project={proj}
            texture={tex}
            imageAspect={aspect || (isMobile ? 0.75 : 1.77)}
            isMobile={isMobile}
            scrollRef={scrollRef}
            onSelectProject={onSelectProject}
          />
        );
      })}
    </group>
  );
}