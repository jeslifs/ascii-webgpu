import * as THREE from 'three/webgpu'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import getMaterial from './tsl/asciiMaterial'

/**
 * Base
 */
// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Loaders


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Materials
    // particles.material.uniforms.uResolution.value.set(sizes.width * sizes.pixelRatio, sizes.height * sizes.pixelRatio)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    camera2.aspect = sizes.width / sizes.height
    camera2.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 8 * 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGPURenderer({
    canvas: canvas,
    antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

debugObject.clearColor = '#000000'
// gui.addColor(debugObject, 'clearColor').onChange(() => { renderer.setClearColor(debugObject.clearColor) })
renderer.setClearColor(debugObject.clearColor)

let scene2
let camera2
let renderTarget
let cubes = []
const setAnotherScene = () => {
    const directionalLight = new THREE.DirectionalLight('#ffffff', 1.5)
    directionalLight.position.set(1, 1, 0.866)
    const ambientLigth = new THREE.AmbientLight('#ffffff', 1)

    scene2 = new THREE.Scene()
    camera2 = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
    camera2.position.set(0, 0, 3 * 2)
    renderTarget = new THREE.RenderTarget(sizes.width, sizes.height)

    let cubeCount = 10
    for(let i = 0; i < cubeCount; i++)
    {
        let size = Math.random()
        let mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size, size, size),
            new THREE.MeshPhysicalMaterial()
        )
        mesh.position.set(Math.random() * 4 - 1, Math.random() * 4 - 1,  Math.random() * 4 - 1)
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI)
        scene2.add(mesh)
        cubes.push(mesh)
    }
    scene2.add(camera, directionalLight, ambientLigth)
}
setAnotherScene()

// create Ascii texture
let length
const createAsciiTexture = () => {
    const characters = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"
    length = characters.length
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    // document.body.append(canvas)
    canvas.width = length * 64
    canvas.height = 64

    context.fillStyle = '#000000'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.font = 'bold 40px Menlo'
    context.textAlign = 'center'
    // context.textBaseline = 'middle'

    for(let i = 0; i < length; i++)
    {
        // slight glow
        if(i > 50)
        {
            for(let j = 0; j < 7; j ++)
            {
                context.filter = `blur(${j * 2})px`
                context.fillText(characters[i], 32 + i * 64, 46)
            }
        }
        context.filter = 'none'
        context.fillText(characters[i], 32 + i * 64, 46)
    }

    const asciiTexture = new THREE.Texture(canvas)
    asciiTexture.needsUpdate = true

    return asciiTexture

}
// createAsciiTexture()

/**
 * object
 */
const setObject = () => {
    let material = new THREE.MeshBasicMaterial({
        color: '#000000',
        // wireframe: true,
    })
    material = getMaterial({
        asciiTexture: createAsciiTexture(),
        length: length,
        scene: renderTarget.texture,

    })

    // instance mesh
    let row = 50
    let columns = 50
    let instance = row * columns
    let size = 0.1


    const geometry = new THREE.PlaneGeometry(size, size, 1, 1)

    // attributes
    const position = new Float32Array(instance * 3)
    // const color = new Float32Array(instance * 3)
    const uv = new Float32Array(instance * 2)
    const randomness = new Float32Array(instance)

    // for(let i = 0; i < instance; i++)
    // {
    //     let i3 = i * 3

    // }

    const asciiMesh = new THREE.InstancedMesh(geometry, material, instance)


    for(let i = 0; i < row; i++)
    {
        for(let j = 0; j < columns; j ++)
        {
            let index = (i * columns) + j
            randomness[index] = Math.pow(Math.random(), 2)
            uv[index * 2] = i / (row - 1)
            uv[index * 2 + 1] = j / (columns - 1)
            position[index * 3] = i * size - size * (row - 1) / 2
            position[index * 3 + 1] = j * size - size * (columns - 1) / 2
            position[index * 3 + 2] = 0

            let matrix = new THREE.Matrix4()
            matrix.setPosition(position[index * 3], position[index * 3 + 1], position[index * 3 + 2])
            asciiMesh.setMatrixAt(index, matrix)
        }
    }
    asciiMesh.instanceMatrix.needsUpdate = true
    geometry.setAttribute('aPixelUV', new THREE.InstancedBufferAttribute(uv, 2))
    geometry.setAttribute('aRandom', new THREE.InstancedBufferAttribute(randomness, 1))



    // const plane = new THREE.Mesh(
    //     geometry,
    //     material,
    // )
    scene.add(asciiMesh)
}

setObject()



/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // animate cubes
    cubes.forEach((cube, index) => {
        cube.rotation.x = Math.sin(elapsedTime * 0.2 * cube.position.x)
        cube.rotation.y = Math.sin(elapsedTime * 0.2 * cube.position.y)
        cube.rotation.z = Math.sin(elapsedTime * 0.2 * cube.position.z)
        cube.position.y = Math.sin(elapsedTime * 0.2 * index)

    })

    // Update controls
    controls.update()

    // Render normal scene
    // renderer.renderAsync(scene, camera)
    renderer.setRenderTarget(renderTarget)
    renderer.renderAsync(scene2, camera2)
    renderer.setRenderTarget(null)
    renderer.renderAsync(scene, camera)





    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()