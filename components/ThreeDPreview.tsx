import React, { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PresentationControls, Html, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

// A procedural car model to avoid external fetch errors (404/CORS)
const GenericCar = ({ textureUrl }: { textureUrl: string | null }) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    if (textureUrl) {
      new THREE.TextureLoader().load(textureUrl, (loadedTex) => {
        // loadedTex.flipY = false; 
        loadedTex.colorSpace = THREE.SRGBColorSpace;
        setTex(loadedTex);
      });
    } else {
        setTex(null);
    }
  }, [textureUrl]);

  // Car Body Material - Updated for better look in dark mode
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: tex ? '#ffffff' : '#111111', // Default to black car if no texture
    map: tex,
    roughness: 0.3,
    metalness: 0.2,
  });

  // Windows/Cabin Material
  const glassMaterial = new THREE.MeshStandardMaterial({
    color: '#050505',
    roughness: 0.1,
    metalness: 0.9,
  });

  // Wheel Material
  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: '#000000',
    roughness: 0.5,
  });

  return (
    <group position={[0, -0.5, 0]}>
      {/* Main Chassis */}
      <RoundedBox args={[2, 0.8, 4.2]} radius={0.1} smoothness={4} position={[0, 0.6, 0]}>
        <primitive object={bodyMaterial} attach="material" />
      </RoundedBox>

      {/* Cabin/Roof */}
      <RoundedBox args={[1.6, 0.6, 2.2]} radius={0.1} smoothness={4} position={[0, 1.3, -0.2]}>
        <primitive object={glassMaterial} attach="material" />
      </RoundedBox>

      {/* Wheels */}
      {/* Front Left */}
      <mesh position={[-1.1, 0.4, 1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <primitive object={wheelMaterial} attach="material" />
      </mesh>
      {/* Front Right */}
      <mesh position={[1.1, 0.4, 1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <primitive object={wheelMaterial} attach="material" />
      </mesh>
      {/* Rear Left */}
      <mesh position={[-1.1, 0.4, -1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <primitive object={wheelMaterial} attach="material" />
      </mesh>
      {/* Rear Right */}
      <mesh position={[1.1, 0.4, -1.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 32]} />
        <primitive object={wheelMaterial} attach="material" />
      </mesh>
    </group>
  );
};

export const ThreeDPreview: React.FC<{ textureUrl: string | null }> = ({ textureUrl }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#000000' : '#ffffff';
  const floorColor = isDark ? '#050505' : '#f5f5f5';
  const fogColor = isDark ? '#000000' : '#ffffff';

  return (
    <div className={`w-full h-full relative ${isDark ? 'bg-black' : 'bg-white'}`}>
      <Canvas dpr={[1, 2]} shadows camera={{ position: [5, 5, 5], fov: 45 }}>
        <color attach="background" args={[bgColor]} />
        
        <PresentationControls 
          speed={1.5} 
          global 
          zoom={1} 
          polar={[-0.1, Math.PI / 4]}
          snap={false}
        >
          <Suspense fallback={
            <Html center>
              <div className={`text-xs tracking-widest uppercase ${isDark ? 'text-white' : 'text-black'}`}>
                Loading...
              </div>
            </Html>
          }>
            <GenericCar textureUrl={textureUrl} />
          </Suspense>
        </PresentationControls>
        
        {/* Adaptive Lighting */}
        <ambientLight intensity={isDark ? 0.2 : 0.6} />
        <spotLight position={[10, 15, 10]} angle={0.3} penumbra={1} intensity={isDark ? 2 : 1.5} castShadow color="#ffffff" />
        <pointLight position={[-10, 5, -10]} intensity={isDark ? 0.5 : 0.8} color={isDark ? "#a1a1aa" : "#e5e7eb"} />
        <spotLight position={[0, 10, -10]} intensity={isDark ? 1.5 : 1} angle={0.5} penumbra={1} color="#ffffff" />
        
        {/* Reflective Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color={floorColor} roughness={isDark ? 0.1 : 0.3} metalness={isDark ? 0.8 : 0.2} />
        </mesh>

        <fog attach="fog" args={[fogColor, 5, 25]} />
      </Canvas>
      
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <p className={`text-[10px] uppercase tracking-[0.2em] inline-block px-3 py-1 rounded-full border backdrop-blur ${
          isDark 
            ? 'text-zinc-500 bg-black/50 border-zinc-900' 
            : 'text-zinc-600 bg-white/80 border-zinc-300'
        }`}>
          {t('main.interactive3DView')}
        </p>
      </div>
    </div>
  );
};