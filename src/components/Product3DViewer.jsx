// src/components/Product3DViewer.jsx

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js"

export default function Product3DViewer({ createModel }) {
    const mountRef = useRef(null)

    useEffect(() => {
        const mount = mountRef.current

        if (!mount) return

        // Scene
        const scene = new THREE.Scene()
        // scene.background = new THREE.Color(0xf4f4f4)

        // Camera
        const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / mount.clientHeight, 0.1, 100)

        camera.position.set(2.5, 1.8, 3.5)

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
        })

        renderer.setClearColor(0xffffff, 0)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        renderer.setSize(mount.clientWidth, mount.clientHeight)
        renderer.outputColorSpace = THREE.SRGBColorSpace
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.shadowMap.enabled = true
        renderer.shadowMap.type = THREE.PCFShadowMap
        mount.appendChild(renderer.domElement)

        // Environment lighting
        const pmrem = new THREE.PMREMGenerator(renderer)
        const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

        scene.environment = environment
        pmrem.dispose()

        // Camera controls
        const controls = new OrbitControls(camera, renderer.domElement)

        controls.enableDamping = true
        controls.target.set(0, 0, 0)

        // Lights
        const keyLight = new THREE.DirectionalLight(0xffffff, 2)

        keyLight.position.set(3, 5, 4)
        keyLight.castShadow = true

        keyLight.shadow.mapSize.width = 2048
        keyLight.shadow.mapSize.height = 2048

        keyLight.shadow.camera.near = 0.1
        keyLight.shadow.camera.far = 20

        keyLight.shadow.camera.left = -3
        keyLight.shadow.camera.right = 3
        keyLight.shadow.camera.top = 3
        keyLight.shadow.camera.bottom = -3

        keyLight.shadow.bias = -0.0005

        scene.add(keyLight)

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5)

        fillLight.position.set(-4, 2, -3)

        scene.add(fillLight)

        // Generate model
        const model = createModel()

        scene.add(model)

        // Center model automatically
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())

        model.position.sub(center)

        const centeredBox = new THREE.Box3().setFromObject(model)

        const shadowMaterial = new THREE.ShadowMaterial({
            color: 0x000000,
            opacity: 0.18,
        })

        const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), shadowMaterial)

        shadowPlane.rotation.x = -Math.PI / 2
        shadowPlane.position.y = centeredBox.min.y - 0.02
        shadowPlane.receiveShadow = true

        scene.add(shadowPlane)

        // Find optional img2threejs animation functions
        const tickers = []

        model.traverse((object) => {
            if (typeof object.userData?.tick === "function") {
                tickers.push(object.userData.tick)
            }
        })

        const clock = new THREE.Clock()

        let animationFrameId

        function animate() {
            animationFrameId = requestAnimationFrame(animate)

            const delta = clock.getDelta()
            const elapsed = clock.elapsedTime

            for (const tick of tickers) {
                tick(delta, elapsed)
            }

            controls.update()
            renderer.render(scene, camera)
        }

        animate()

        // Responsive resizing
        const resizeObserver = new ResizeObserver(() => {
            const width = mount.clientWidth
            const height = mount.clientHeight

            camera.aspect = width / height
            camera.updateProjectionMatrix()

            renderer.setSize(width, height)
        })

        resizeObserver.observe(mount)

        return () => {
            resizeObserver.disconnect()

            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId)
            }

            controls.dispose()

            model.traverse((object) => {
                if (object.geometry) {
                    object.geometry.dispose()
                }

                if (object.material) {
                    const materials = Array.isArray(object.material) ? object.material : [object.material]

                    materials.forEach((material) => material.dispose())
                }
            })

            environment.dispose()
            renderer.dispose()

            if (mount.contains(renderer.domElement)) {
                mount.removeChild(renderer.domElement)
            }
        }
    }, [createModel])

    return (
        <div
            ref={mountRef}
            style={{
                width: "100%",
                height: "500px",
            }}
        />
    )
}
