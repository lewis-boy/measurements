import * as THREE from "three"
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js"

export function createProductModel() {
    const group = new THREE.Group()

    const body = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.5, 1),
        new THREE.MeshStandardMaterial({
            color: 0x222222,
            roughness: 0.35,
            metalness: 0.2,
        }),
    )

    body.castShadow = true
    body.receiveShadow = true

    group.add(body)

    return group
}

function createPixelHeartTexture(color) {
    const canvas = document.createElement("canvas")

    canvas.width = 256
    canvas.height = 256

    const ctx = canvas.getContext("2d")

    ctx.clearRect(0, 0, 256, 256)

    const pattern = ["00111100", "01111110", "11111111", "11111111", "01111110", "00111100", "00011000", "00000000"]

    const cell = 20
    const offsetX = 48
    const offsetY = 48

    ctx.fillStyle = color

    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col] === "1") {
                ctx.fillRect(offsetX + col * cell, offsetY + row * cell, cell, cell)
            }
        }
    }

    const texture = new THREE.CanvasTexture(canvas)

    texture.colorSpace = THREE.SRGBColorSpace

    return texture
}

function createTaperedRoundedBox({ width = 2, height = 0.6, depth = 2, radius = 0.18, segments = 8, topScale = 0.86 }) {
    const geometry = new RoundedBoxGeometry(width, height, depth, segments, radius)

    const positions = geometry.attributes.position

    const bottomY = -height / 2
    const topY = height / 2

    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const z = positions.getZ(i)

        // 0 at bottom → 1 at top
        const t = (y - bottomY) / (topY - bottomY)

        // bottom wider, top narrower
        const scale = THREE.MathUtils.lerp(1, topScale, t)

        positions.setX(i, x * scale)
        positions.setZ(i, z * scale)
    }

    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
}

export function createKeycapModel({
    color = "#f2f1ed",
    sideColor = color,
    legendColor = "#ff4fa3",
    showLegend = true,
} = {}) {
    const group = new THREE.Group()

    // Bottom tapered portion
    const skirtGeometry = createTaperedRoundedBox({
        width: 2.1,
        height: 0.6,
        depth: 2.1,

        radius: 0.11,
        segments: 10,

        topScale: 0.76,
    })

    const skirtMaterial = new THREE.MeshStandardMaterial({
        color: sideColor,
        roughness: 0.75,
        metalness: 0,
    })

    const skirt = new THREE.Mesh(skirtGeometry, skirtMaterial)

    // skirt.rotation.y = Math.PI / 4
    skirt.position.y = -0.08

    skirt.castShadow = true
    skirt.receiveShadow = true

    group.add(skirt)

    // Rounded top
    const topGeometry = new RoundedBoxGeometry(1.28, 0.42, 1.28, 6, 0.12)

    const topMaterial = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.7,
        metalness: 0,
    })

    const top = new THREE.Mesh(topGeometry, topMaterial)

    top.position.y = 0.26

    top.castShadow = true
    top.receiveShadow = true

    group.add(top)

    // Optional heart
    if (showLegend) {
        const heartTexture = createPixelHeartTexture(legendColor)

        const legendGeometry = new THREE.PlaneGeometry(0.62, 0.62)

        const legendMaterial = new THREE.MeshBasicMaterial({
            map: heartTexture,
            transparent: true,
        })

        const legend = new THREE.Mesh(legendGeometry, legendMaterial)

        legend.rotation.x = -Math.PI / 2
        legend.position.y = 0.48

        group.add(legend)
    }

    return group
}
