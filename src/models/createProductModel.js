import * as THREE from "three"

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
