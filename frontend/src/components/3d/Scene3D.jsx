import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid, Environment, Sparkles, ContactShadows } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import CarModel from './CarModel';

function LoadingFallback() {
  return null; // Three.js canvas fallback - blank while loading
}

export default function Scene3D() {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-dark-bg">
      <Canvas camera={{ position: [-6, 3, 6], fov: 40 }} shadows>
        {/* Ambient base light */}
        <ambientLight intensity={0.15} />

        {/* Main key light — cool cyan from front-right */}
        <directionalLight
          position={[8, 8, 5]}
          intensity={1.5}
          color="#d4af37"
          castShadow
        />

        {/* Fill light — subtle blue from left */}
        <directionalLight position={[-8, 6, -5]} intensity={0.6} color="#aa8529" />

        {/* Rim / backlight — warm accent from behind */}
        <directionalLight position={[0, 4, -8]} intensity={0.4} color="#ff6b35" />

        {/* Spot on the car for dramatic highlights */}
        <spotLight
          position={[0, 10, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.8}
          color="#ffffff"
          castShadow
        />

        {/* Environment reflections */}
        <Environment preset="night" />

        {/* Background stars */}
        <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={0.8} />
        <Sparkles count={150} scale={15} size={2} speed={0.3} opacity={0.08} color="#d4af37" />

        {/* Ground grid */}
        <Grid
          position={[0, -1.2, 0]}
          args={[40, 40]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#d4af37"
          sectionSize={4}
          sectionThickness={1}
          sectionColor="#aa8529"
          fadeDistance={25}
          fadeStrength={1.5}
        />

        {/* Ground shadow */}
        <ContactShadows
          position={[0, -1.19, 0]}
          opacity={0.6}
          scale={20}
          blur={2}
          far={5}
          color="#d4af37"
        />

        {/* Car model with suspense fallback */}
        <Suspense fallback={<LoadingFallback />}>
          <CarModel />
        </Suspense>

        {/* Controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 5}
        />
      </Canvas>

      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,10,15,0.85)_100%)]"></div>
    </div>
  );
}
