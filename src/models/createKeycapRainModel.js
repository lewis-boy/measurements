import * as THREE from "three"
import { createKeycapModel } from "./createProductModel.js"

function random(min, max) {
    return Math.random() * (max - min) + min
}

const COLORS = [
    "#e63946", // red
    "#457b9d", // blue
    "#f4a261", // orange
    "#2a9d8f", // green
    "#9b5de5", // purple
    "#f15bb5", // pink
    "#f2f1ed", // white
    "#222222", // black
]

export function createKeycapRainModel({
    count = 20,
    spreadX = 7,
    spreadY = 9,
    spreadZ = 3,
    fallSpeed = 0.6,
    spawnInterval = 1.2,
} = {}) {
    const group = new THREE.Group()
    const keycaps = []

    let spawnTimer = 0
    let nextKeycap = 0
    let spawnOnLeft = true

    // Controls where new keycaps appear
    function spawnKeycap(keycap) {
        keycap.visible = true

        const half = spreadX / 2
        const halfGap = 3

        let x

        if (spawnOnLeft) {
            x = random(-half, -halfGap)
        } else {
            x = random(halfGap, half)
        }

        // Next keycap spawns on opposite side
        spawnOnLeft = !spawnOnLeft

        keycap.position.set(x, spreadY / 2 + 1, random(-spreadZ / 2, spreadZ / 2))

        // New random rotation every time it spawns
        keycap.rotation.set(random(0, Math.PI * 2), random(0, Math.PI * 2), random(0, Math.PI * 2))
    }

    // Create the keycap pool
    for (let i = 0; i < count; i++) {
        const color = COLORS[Math.floor(Math.random() * COLORS.length)]

        const keycap = createKeycapModel({
            color,
            legendColor: "#ffffff",
            showLegend: true,
        })

        // Start hidden
        keycap.visible = false

        // Keycap size
        const scale = random(0.25, 0.4)
        keycap.scale.setScalar(scale)

        // Fixed fall speed prevents keycaps catching each other
        keycap.userData.fallSpeed = fallSpeed

        // Random slow rotation
        keycap.userData.spin = new THREE.Vector3(random(-0.35, 0.35), random(-0.5, 0.5), random(-0.25, 0.25))

        keycaps.push(keycap)
        group.add(keycap)
    }

    group.userData.tick = (delta) => {
        // Prevent huge animation jumps
        delta = Math.min(delta, 0.05)

        // -------------------------
        // SPAWN TIMER
        // -------------------------

        spawnTimer += delta

        if (spawnTimer >= spawnInterval) {
            spawnTimer -= spawnInterval

            // Find an invisible keycap
            for (let i = 0; i < keycaps.length; i++) {
                const index = (nextKeycap + i) % keycaps.length

                const keycap = keycaps[index]

                if (!keycap.visible) {
                    spawnKeycap(keycap)

                    nextKeycap = (index + 1) % keycaps.length

                    break
                }
            }
        }

        // -------------------------
        // ANIMATE ACTIVE KEYCAPS
        // -------------------------

        for (const keycap of keycaps) {
            if (!keycap.visible) {
                continue
            }

            // Fall downward
            keycap.position.y -= keycap.userData.fallSpeed * delta

            // Slow tumbling
            keycap.rotation.x += keycap.userData.spin.x * delta

            keycap.rotation.y += keycap.userData.spin.y * delta

            keycap.rotation.z += keycap.userData.spin.z * delta

            // Recycle once below screen
            if (keycap.position.y < -spreadY / 2) {
                keycap.visible = false
            }
        }
    }

    return group
}
