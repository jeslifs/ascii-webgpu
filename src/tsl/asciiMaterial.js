import * as THREE from 'three/webgpu'
import { mx_noise_float, uv, texture, attribute, uniform, color, mix, floor, cross, dot, float, transformNormalToView, positionLocal, sign, step, Fn, varying, vec2, vec3, Loop, vec4, pow } from 'three/tsl';
// import { TextureLoader } from 'three';


const colors = [
    '#8c1dff',
    '#f223ff',
    '#ff2976',
    '#ff901f',
    '#ffd318'
]

export default function getMaterial({ asciiTexture, length, scene }) {

    // loaders
    const textureLoader = new THREE.TextureLoader()
    const uTexture = textureLoader.load('textures/picture-1.png')
    // const uTexture = textureLoader.load('textures/img62.jpg')
    

    const material = new THREE.NodeMaterial({
        // wireframe: true,
        // side: THREE.DoubleSide,
    })

    // uniform
    const uColor1 = uniform(color(colors[0]))
    const uColor2 = uniform(color(colors[1]))
    const uColor3 = uniform(color(colors[2]))
    const uColor4 = uniform(color(colors[3]))
    const uColor5 = uniform(color(colors[4]))

    // ascii
    const asciiCode = Fn(() => {
        // const textureColor = texture(uTexture, attribute('aPixelUV'));
        const textureColor = texture(scene, attribute('aPixelUV'));
        const brightness = pow(textureColor.r, 0.9).add(attribute('aRandom').mul(0.02));
        const asciiUV = vec2(
            uv().x.div(length).add(floor(brightness.mul(length)).div(length)),
            uv().y
        );
        const asciiCode = texture(asciiTexture, asciiUV);
        let finalColor = uColor1;
        finalColor = mix(finalColor, uColor2, step(0.2, brightness));
        finalColor = mix(finalColor, uColor3, step(0.4, brightness));
        finalColor = mix(finalColor, uColor4, step(0.6, brightness));
        finalColor = mix(finalColor, uColor5, step(0.8, brightness));


        // return vec4(uv().x, uv().y, 0.0, 1.0);

        // return vec4(finalColor, 1.0);
        return asciiCode.mul(finalColor);
        // return vec4(attribute('aPixelUV').x, attribute('aPixelUV').y, 0.0, 1.0);

    })

    material.colorNode = asciiCode();

    return material
}