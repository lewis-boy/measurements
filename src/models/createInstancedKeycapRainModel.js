import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

function random(min, max) {
    return Math.random() * (max - min) + min
}

const COLORS = ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#9b5de5", "#f15bb5", "#f2f1ed", "#222222"]

// Creates the tapered lower portion of the keycap
function createTaperedRoundedBox({ width = 2, height = 0.6, depth = 2, radius = 0.2, segments = 8, topScale = 0.88 }) {
    const geometry = new RoundedBoxGeometry(width, height, depth, segments, radius)

    const positions = geometry.attributes.position

    const bottomY = -height / 2
    const topY = height / 2

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = positions.getZ(i)

        const t = (y - bottomY) / (topY - bottomY)

        const scale = THREE.MathUtils.lerp(1, topScale, t)

        positions.setX(i, x * scale)
        positions.setZ(i, z * scale)
    }

    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
}

export function createInstancedKeycapRainModel({
    count = 12,
    spreadX = 12,
    spreadY = 16,
    spreadZ = 3,
    fallSpeed = 0.5,
    spacing = 3,
    centerGap = 3,
} = {}) {
    const group = new THREE.Group()

    // ------------------------------
    // GEOMETRY
    // ------------------------------

    // ONE geometry shared by every skirt
    const skirtGeometry = createTaperedRoundedBox({
        width: 2.1,
        height: 0.65,
        depth: 2.1,
        radius: 0.2,
        segments: 6,
        topScale: 0.88,
    })

    // ONE geometry shared by every top
    const topGeometry = new RoundedBoxGeometry(1.28, 0.42, 1.28, 6, 0.16)

    // ------------------------------
    // MATERIAL
    // ------------------------------

    const skirtMaterial = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.75,
        metalness: 0,
    })

    const topMaterial = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        roughness: 0.7,
        metalness: 0,
    })

    // ------------------------------
    // INSTANCED MESHES
    // ------------------------------

    const skirts = new THREE.InstancedMesh(skirtGeometry, skirtMaterial, count)

    const tops = new THREE.InstancedMesh(topGeometry, topMaterial, count)

    // We're changing these matrices every frame
    skirts.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    tops.instanceMatrix.setUsage(THREE.DynamicDrawUsage)

    // Background rain doesn't need shadows
    skirts.castShadow = false
    skirts.receiveShadow = false

    tops.castShadow = false
    tops.receiveShadow = false

    group.add(skirts)
    group.add(tops)

    // ------------------------------
    // INSTANCE STATE
    // ------------------------------

    const keycaps = []

    const halfX = spreadX / 2

    for (let i = 0; i < count; i++) {
        const onLeft = i % 2 === 0

        const x = onLeft ? random(-halfX, -centerGap) : random(centerGap, halfX)

        const y = spreadY / 2 - i * spacing

        const z = random(-spreadZ / 2, spreadZ / 2)

        const color = new THREE.Color(COLORS[i % COLORS.length])

        const scale = random(0.22, 0.32)

        const state = {
            position: new THREE.Vector3(x, y, z),

            rotation: new THREE.Euler(random(0, Math.PI * 2), random(0, Math.PI * 2), random(0, Math.PI * 2)),

            scale,

            spin: new THREE.Vector3(random(-0.25, 0.25), random(-0.35, 0.35), random(-0.2, 0.2)),
        }

        keycaps.push(state)

        // Same color for skirt + top
        skirts.setColorAt(i, color)
        tops.setColorAt(i, color)
    }

    if (skirts.instanceColor) {
        skirts.instanceColor.needsUpdate = true
    }

    if (tops.instanceColor) {
        tops.instanceColor.needsUpdate = true
    }

    // ------------------------------
    // MATRIX HELPERS
    // ------------------------------

    const quaternion = new THREE.Quaternion()

    const baseMatrix = new THREE.Matrix4()

    const skirtMatrix = new THREE.Matrix4()
    const topMatrix = new THREE.Matrix4()

    const scaleVector = new THREE.Vector3()

    // Local positioning within one keycap
    const skirtOffset = new THREE.Matrix4().makeTranslation(0, -0.08, 0)

    const topOffset = new THREE.Matrix4().makeTranslation(0, 0.26, 0)

    function updateInstance(index) {
        const keycap = keycaps[index]

        quaternion.setFromEuler(keycap.rotation)

        scaleVector.setScalar(keycap.scale)

        baseMatrix.compose(keycap.position, quaternion, scaleVector)

        // Keycap skirt
        skirtMatrix.multiplyMatrices(baseMatrix, skirtOffset)

        skirts.setMatrixAt(index, skirtMatrix)

        // Keycap top
        topMatrix.multiplyMatrices(baseMatrix, topOffset)

        tops.setMatrixAt(index, topMatrix)
    }

    // Initial placement
    for (let i = 0; i < count; i++) {
        updateInstance(i)
    }

    skirts.instanceMatrix.needsUpdate = true
    tops.instanceMatrix.needsUpdate = true

    // ------------------------------
    // ANIMATION
    // ------------------------------

    group.userData.tick = (delta) => {
        delta = Math.min(delta, 0.05)

        for (let i = 0; i < count; i++) {
            const keycap = keycaps[i]

            // Fall
            keycap.position.y -= fallSpeed * delta

            // Rotate
            keycap.rotation.x += keycap.spin.x * delta

            keycap.rotation.y += keycap.spin.y * delta

            keycap.rotation.z += keycap.spin.z * delta

            // Recycle when leaving bottom
            if (keycap.position.y < -spreadY / 2) {
                let highestY = -Infinity

                for (let j = 0; j < count; j++) {
                    if (j !== i && keycaps[j].position.y > highestY) {
                        highestY = keycaps[j].position.y
                    }
                }

                keycap.position.y = highestY + spacing

                const onLeft = i % 2 === 0

                keycap.position.x = onLeft ? random(-halfX, -centerGap) : random(centerGap, halfX)

                keycap.position.z = random(-spreadZ / 2, spreadZ / 2)
            }

            updateInstance(i)
        }

        // This tells Three.js to upload the
        // new instance matrices to the GPU
        skirts.instanceMatrix.needsUpdate = true

        tops.instanceMatrix.needsUpdate = true
    }

    return group
}
