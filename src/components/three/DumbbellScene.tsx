"use client"

import { Suspense, useRef, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, OrbitControls, Environment, ContactShadows } from "@react-three/drei"
import * as THREE from "three"

function DumbbellModel({ scrollY = 0 }: { scrollY?: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF("/dumbbell.glb")

  // Clone scene to avoid sharing materials between instances
  const clonedScene = scene.clone()

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.add(clonedScene)
      // Center and scale the model
      const box = new THREE.Box3().setFromObject(clonedScene)
      const center = box.getCenter(new THREE.Vector3())
      clonedScene.position.sub(center)
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim
      clonedScene.scale.setScalar(scale)
    }
  }, [clonedScene])

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle auto-rotation
      groupRef.current.rotation.y += 0.003
      // Subtle floating animation
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <group ref={groupRef} />
  )
}

function Lights({ scrollY = 0 }: { scrollY?: number }) {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(() => {
    if (lightRef.current) {
      // UVC glow reacts to scroll position
      const intensity = 50 + (scrollY * 0.1)
      lightRef.current.intensity = Math.min(Math.max(intensity, 20), 200)
    }
  })

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={30} color="#ffffff" />
      <pointLight ref={lightRef} position={[-3, 2, -3]} intensity={50} color="#02F5D4" distance={10} />
      <pointLight position={[0, -3, 3]} intensity={40} color="#2272FF" distance={8} />
    </>
  )
}

export default function DumbbellScene({ className = "", scrollY = 0 }: { className?: string; scrollY?: number }) {
  return (
    <div className={`${className} relative`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Lights scrollY={scrollY} />
          <DumbbellModel scrollY={scrollY} />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
            far={4}
          />
          <Environment preset="city" />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            autoRotate
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload the model
useGLTF.preload("/dumbbell.glb")
