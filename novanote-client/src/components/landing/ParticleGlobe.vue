<template>
  <div ref="host" class="particle-globe" role="img" aria-label="緩慢旋轉的 3D 金色粒子星球與環繞軌道">
    <canvas ref="canvas" class="particle-globe__canvas" aria-hidden="true"></canvas>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as THREE from 'three'

const host = ref(null)
const canvas = ref(null)

let renderer
let scene
let camera
let globe
let orbitRig
let frameId = 0
let resizeObserver
let motionQuery
let lastFrame = 0
let disposed = false

const makeGlobe = (pixelRatio) => {
  const count = 10500
  const radius = 1.3
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  const opacities = new Float32Array(count)
  let seed = 93471
  const random = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  const palette = {
    ivory: new THREE.Color('#F8F6EE'),
    moonlight: new THREE.Color('#5D7EA8'),
    constellation: new THREE.Color('#254A7A'),
    midnight: new THREE.Color('#142B52'),
    gold: new THREE.Color('#D4B06A'),
    softGold: new THREE.Color('#F0D79A')
  }

  for (let i = 0; i < count; i += 1) {
    // Independent spherical samples avoid latitude bands and repeated rows.
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    const radialJitter = 1 + (random() - 0.5) * 0.012
    const sinPhi = Math.sin(phi)
    const offset = i * 3

    positions[offset] = radius * radialJitter * sinPhi * Math.cos(theta)
    positions[offset + 1] = radius * radialJitter * Math.cos(phi)
    positions[offset + 2] = radius * radialJitter * sinPhi * Math.sin(theta)

    // 75% cool white/moonlight, 18% deep blue, 7% restrained gold accents.
    const tone = random()
    const color = tone < 0.18
      ? palette.ivory
      : tone < 0.75
        ? palette.moonlight
        : tone < 0.93
          ? palette.constellation
          : random() < 0.7 ? palette.gold : palette.softGold
    const variation = 0.78 + random() * 0.22
    colors[offset] = color.r * variation
    colors[offset + 1] = color.g * variation
    colors[offset + 2] = color.b * variation
    sizes[i] = 0.012 + random() * 0.008
    opacities[i] = 0.38 + random() * 0.34
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  geometry.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uScale: { value: 1 },
      uPixelRatio: { value: pixelRatio }
    },
    vertexShader: `
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aOpacity;
      uniform float uScale;
      uniform float uPixelRatio;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 viewNormal = normalize(mat3(modelViewMatrix) * normalize(position));
        vec3 lightDirection = normalize(vec3(0.58, 0.68, 0.44));
        float front = smoothstep(-0.35, 0.12, viewNormal.z);
        float diffuse = max(dot(viewNormal, lightDirection), 0.0);
        float rim = smoothstep(0.08, 0.92, 1.0 - abs(viewNormal.z));
        float centerShade = 1.0 - 0.48 * pow(max(viewNormal.z, 0.0), 2.0);
        float brightness = clamp((0.08 + 0.68 * diffuse + 0.12 * rim) * centerShade, 0.035, 0.70);
        vec3 deepBlue = vec3(0.014, 0.035, 0.082);
        vColor = mix(deepBlue, aColor, brightness);
        vAlpha = mix(0.035, 0.66, front) * aOpacity * (0.30 + 0.70 * diffuse + 0.16 * rim);

        gl_Position = projectionMatrix * viewPosition;
        float perspectiveSize = aSize * uScale / max(0.1, -viewPosition.z);
        gl_PointSize = clamp(perspectiveSize, 1.0 * uPixelRatio, 2.5 * uPixelRatio);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
        if (distanceFromCenter > 0.5) discard;
        float softEdge = 1.0 - smoothstep(0.36, 0.5, distanceFromCenter);
        gl_FragColor = vec4(vColor, vAlpha * softEdge);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  })

  const points = new THREE.Points(geometry, material)
  points.renderOrder = 1
  return points
}

const makeOrbitArc = (radius, start, end, opacity, tilt, roll, renderOrder, clipToGlobe = false) => {
  const points = []
  const segments = 220
  for (let i = 0; i <= segments; i += 1) {
    const angle = start + ((end - start) * i) / segments
    points.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uColor: { value: new THREE.Color('#D4B06A') },
      uOpacity: { value: opacity },
      uClipToGlobe: { value: clipToGlobe ? 1 : 0 },
      uCameraDistance: { value: 6.8 },
      uGlobeRadius: { value: 1.31 }
    },
    vertexShader: `
      varying vec2 vViewXY;
      varying float vViewDepth;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vViewXY = viewPosition.xy;
        vViewDepth = -viewPosition.z;
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform float uClipToGlobe;
      uniform float uCameraDistance;
      uniform float uGlobeRadius;
      varying vec2 vViewXY;
      varying float vViewDepth;
      void main() {
        float projectedRadius = length(vViewXY) * uCameraDistance / max(vViewDepth, 0.01);
        if (uClipToGlobe > 0.5 && projectedRadius < uGlobeRadius) discard;
        gl_FragColor = vec4(uColor, uOpacity);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `
  })
  const arc = new THREE.Line(geometry, material)
  arc.rotation.set(tilt, 0, roll)
  arc.renderOrder = renderOrder
  return arc
}

const disposeScene = () => {
  if (disposed) return
  disposed = true
  cancelAnimationFrame(frameId)
  resizeObserver?.disconnect()
  motionQuery?.removeEventListener?.('change', handleMotionChange)
  scene?.traverse((object) => {
    object.geometry?.dispose()
    if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose())
    else object.material?.dispose()
  })
  renderer?.dispose()
  renderer?.forceContextLoss()
  scene = null
  renderer = null
}

const renderFrame = (now) => {
  if (disposed || !renderer) return
  frameId = requestAnimationFrame(renderFrame)
  if (!lastFrame) lastFrame = now
  const delta = Math.min((now - lastFrame) / 1000, 0.05)
  lastFrame = now

  if (!motionQuery?.matches && globe) {
    globe.rotation.y += delta * 0.045
    globe.rotation.x = Math.sin(now * 0.00008) * 0.004
    orbitRig.rotation.y += delta * 0.006
  }
  renderer.render(scene, camera)
}

function handleMotionChange() {
  if (motionQuery.matches) {
    cancelAnimationFrame(frameId)
    renderer?.render(scene, camera)
  } else if (renderer) {
    lastFrame = 0
    frameId = requestAnimationFrame(renderFrame)
  }
}

onMounted(() => {
  try {
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30)
    camera.position.set(0, 0, 6.8)

    renderer = new THREE.WebGLRenderer({
      canvas: canvas.value,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power'
    })
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5)
    renderer.setPixelRatio(pixelRatio)
    renderer.setClearColor(0x000000, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace

    globe = makeGlobe(pixelRatio)
    scene.add(globe)

    orbitRig = new THREE.Group()
    // The rear arc is cut out beneath the globe silhouette. The front arc renders above the particle shell.
    orbitRig.add(makeOrbitArc(1.67, Math.PI, Math.PI * 2, 0.14, 2.0, 0.2, 0, true))
    orbitRig.add(makeOrbitArc(1.67, 0, Math.PI, 0.28, 2.0, 0.2, 2))

    const node = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 8, 6),
      new THREE.MeshBasicMaterial({ color: '#D4B06A', transparent: true, opacity: 0.62, depthTest: false, depthWrite: false })
    )
    node.position.set(1.67 * Math.cos(1.05), 1.67 * Math.sin(1.05), 0)
    node.renderOrder = 2
    orbitRig.add(node)
    scene.add(orbitRig)

    const resize = () => {
      if (!host.value || !renderer) return
      const width = Math.max(1, host.value.clientWidth)
      const height = Math.max(1, host.value.clientHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      const fov = THREE.MathUtils.degToRad(camera.fov)
      const scale = renderer.domElement.height / (2 * Math.tan(fov / 2))
      globe.material.uniforms.uScale.value = scale
      globe.material.uniforms.uPixelRatio.value = renderer.getPixelRatio()
      renderer.render(scene, camera)
    }
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host.value)
    resize()

    motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    motionQuery.addEventListener?.('change', handleMotionChange)
    if (!motionQuery.matches) frameId = requestAnimationFrame(renderFrame)
  } catch (error) {
    console.error('Unable to initialize the NovaNote particle globe:', error)
    disposeScene()
  }
})

onBeforeUnmount(disposeScene)
</script>

<style scoped>
.particle-globe {
  position: relative;
  overflow: visible;
  aspect-ratio: 1;
  isolation: isolate;
}

.particle-globe::before {
  position: absolute;
  inset: 13%;
  z-index: -1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(72, 108, 165, 0.13), rgba(205, 184, 121, 0.035) 54%, transparent 73%);
  content: '';
  filter: blur(20px);
}

.particle-globe__canvas {
  display: block;
  width: 100%;
  height: 100%;
}
</style>