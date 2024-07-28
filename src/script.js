
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

// Quotes API
window.onload = getFetch;
function getFetch(){
    const url = `https://type.fit/api/quotes`;
    fetch(url)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            const num = Math.floor(Math.random() * 16);
            console.log(data[num].text);
        })
        .catch(err => {
            console.log(`error ${err}`);
        });
}

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Models
 */
const gltfLoader = new GLTFLoader();
let character;

gltfLoader.load(
    "/models/Ape/Ape.gltf",
    (gltf) => {
        character = gltf.scene;
        scene.add(character);
        character.children[0].position.set(-2.9, 6.6, 1.1);
        character.children[1].position.set(0.4, 7.7, 1.75);
        character.children[2].position.set(-0.6, 7.7, 1.75);
        character.children[3].position.set(-0.1, 6.4, 2.3);
        character.children[4].position.set(-0.1, 6.4, 1.5);
    },
    undefined,
    function (error) {
        console.error(error);
    }
);

/**
 * Floor
 */
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0,
        roughness: 0.5
    })
);
floor.receiveShadow = true;
floor.position.set(0, -2, 0);
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(60, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 8, 8);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0.15, 6.5, 0);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

// Movement controls
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    // Disable OrbitControls when arrow keys are pressed
    controls.enabled = false;
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
    // Enable OrbitControls when arrow keys are released
    controls.enabled = true;
});

const moveCharacter = (deltaTime) => {
    if (!character) return;

    const speed = 2.0;
    const distance = speed * deltaTime;

    if (keys.ArrowUp) character.position.z -= distance;
    if (keys.ArrowDown) character.position.z += distance;
    if (keys.ArrowLeft) character.position.x -= distance;
    if (keys.ArrowRight) character.position.x += distance;
};

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Update controls only when enabled
    if (controls.enabled) {
        controls.update();
    }

    // Move character
    moveCharacter(deltaTime);

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();