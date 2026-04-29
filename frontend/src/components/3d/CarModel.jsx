import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function CarModel() {
  const groupRef = useRef();
  const { scene } = useGLTF('/mustang.glb');

  // Apply a sleek material to all meshes in the model
  const model = useMemo(() => {
    const cloned = scene.clone();
    cloned.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color('#0a0a12'),
          metalness: 0.95,
          roughness: 0.05,
          envMapIntensity: 1.5,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Center and scale the model
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 4 / maxDim;

    cloned.scale.setScalar(scale);
    cloned.position.set(-center.x * scale, -center.y * scale, -center.z * scale);

    return cloned;
  }, [scene]);

  // Slow rotation + hover float
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y -= delta * 0.15;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <primitive object={model} />
      </Float>
    </group>
  );
}

useGLTF.preload('/mustang.glb');
