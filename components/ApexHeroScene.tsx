"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

const NODE_COUNT = 22;
const SPHERE_RADIUS = 2.4;
const CONNECTION_DISTANCE = 1.85;
const ACCENT = new THREE.Color("#adc6ff");
const GLOW = new THREE.Color("#4b8eff");

function fibonacciSphere(count: number, radius: number): THREE.Vector3[] {
  const goldenRatio = (1 + Math.sqrt(5)) / 2;
  const points: THREE.Vector3[] = [];

  for (let i = 0; i < count; i++) {
    const theta = (2 * Math.PI * i) / goldenRatio;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
    points.push(
      new THREE.Vector3(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      ),
    );
  }

  return points;
}

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { nodes, linePositions } = useMemo(() => {
    const nodePositions = fibonacciSphere(NODE_COUNT, SPHERE_RADIUS);
    const positions: number[] = [];

    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < CONNECTION_DISTANCE) {
          positions.push(
            nodePositions[i].x,
            nodePositions[i].y,
            nodePositions[i].z,
            nodePositions[j].x,
            nodePositions[j].y,
            nodePositions[j].z,
          );
        }
      }
    }

    return { nodes: nodePositions, linePositions: new Float32Array(positions) };
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.12;
      groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.15;
    }
    if (linesRef.current?.material instanceof THREE.LineBasicMaterial) {
      linesRef.current.material.opacity = 0.22 + Math.sin(t * 1.2) * 0.06;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={ACCENT} transparent opacity={0.25} />
      </lineSegments>

      {nodes.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.055 + (i % 3) * 0.012, 12, 12]} />
          <meshStandardMaterial
            color={ACCENT}
            emissive={GLOW}
            emissiveIntensity={0.6 + (i % 4) * 0.1}
            metalness={0.3}
            roughness={0.4}
          />
        </mesh>
      ))}
    </group>
  );
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const count = 120;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (pseudoRandom(i * 3) - 0.5) * 10;
      arr[i * 3 + 1] = (pseudoRandom(i * 3 + 1) - 0.5) * 10;
      arr[i * 3 + 2] = (pseudoRandom(i * 3 + 2) - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#adc6ff"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.35}
      />
    </Points>
  );
}

function CentralOrb() {
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.04);
    }
    if (ringRef.current) {
      ringRef.current.rotation.x = t * 0.4;
      ringRef.current.rotation.z = t * 0.25;
    }
  });

  return (
    <group>
      <mesh ref={orbRef}>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial
          color="#adc6ff"
          emissive="#4b8eff"
          emissiveIntensity={1.2}
          metalness={0.5}
          roughness={0.2}
          transparent
          opacity={0.85}
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.55, 0.008, 8, 64]} />
        <meshBasicMaterial color="#adc6ff" transparent opacity={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.7, 0.005, 8, 64]} />
        <meshBasicMaterial color="#4b8eff" transparent opacity={0.2} />
      </mesh>
      <pointLight color="#adc6ff" intensity={2} distance={4} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[4, 4, 4]} intensity={0.4} color="#adc6ff" />
      <ParticleField />
      <NeuralNetwork />
      <CentralOrb />
    </>
  );
}

type ApexHeroSceneProps = {
  onReady?: () => void;
};

export default function ApexHeroScene({ onReady }: ApexHeroSceneProps) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 5.5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      style={{ background: "transparent" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x131318, 0);
        onReady?.();
      }}
    >
      <Scene />
    </Canvas>
  );
}
