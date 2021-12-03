import * as THREE from './js/three.module.js';
import { OrbitControls } from './js/OrbitControls.js';
import { GLTFLoader } from './js/GLTFLoader.js';
import { Reflector } from './jsm/objects/Reflector.js';
import * as dat from './jsm/libs/dat.gui.module.js'
import { DragControls } from './js/DragControls.js';

class FogGUIHelper {
    constructor(fog, backgroundColor) {
        this.fog = fog;
        this.backgroundColor = backgroundColor;
    }
    get near() {
        return this.fog.near;
    }
    set near(v) {
        this.fog.near = v;
        this.fog.far = Math.max(this.fog.far, v);
    }
    get far() {
        return this.fog.far;
    }
    set far(v) {
        this.fog.far = v;
        this.fog.near = Math.min(this.fog.near, v);
    }
    get color() {
        return `#${this.fog.color.getHexString()}`;
    }
    set color(hexString) {
        this.fog.color.set(hexString);
        this.backgroundColor.set(hexString);
    }
}


// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene();

// Dat GUI
const gui = new dat.GUI()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

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
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 1, 100);
camera.position.x = -15;
camera.position.y = 10;
camera.position.z = 20;
scene.add(camera);

// orbit controls
const controls = new OrbitControls(camera, canvas);
controls.autoRotate = true;


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.render(scene, camera, controls);
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.gammaOutput = true;


/**
 * Panorama 
 */
const panorama = new THREE.CubeTextureLoader();
const textureSun = panorama.load([
    'sky-map/px.jpg',
    'sky-map/nx.jpg',
    'sky-map/py.jpg',
    'sky-map/ny.jpg',
    'sky-map/pz.jpg',
    'sky-map/nz.jpg',

]);
scene.background = textureSun;


/**
 * Object: Sphere (for Sun)
 
let geometry = new THREE.SphereGeometry(1.54, 10, 10);
const loader3 = new THREE.TextureLoader();
loader3.load('img/sunmap.jpg', (sun) => {
    const material = new THREE.MeshBasicMaterial({
        map: sun,
    });
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.x = 20;
    sphere.position.z = -20;
    sphere.position.y = 20;
    scene.add(sphere);

});
*/
/**
 * Object: Plane
 */

const loader4 = new THREE.TextureLoader();
const grass = loader4.load('grass.jpg');
grass.wrapS = THREE.RepeatWrapping;
grass.wrapT = THREE.RepeatWrapping;
const repeats = 10;
grass.repeat.set(repeats, repeats);

let grassPlane = new THREE.BoxGeometry(40, 40);
let grassMaterial = new THREE.MeshLambertMaterial({
    map: grass

});


let plane = new THREE.Mesh(grassPlane, grassMaterial);
plane.rotation.x = Math.PI / 2;
plane.position.y = -5.5;
plane.receiveShadow = true;
scene.add(plane);

/**
 * Object: GLTF
 */

const loader = new GLTFLoader()
loader.load('./model/scene.gltf', function(gltf) {
    const root = gltf.scene;
    root.position.x = 0;
    root.position.y = -5;
    scene.add(root);
    // console.log(dumpObject(root).join('\n'));

    root.traverse(n => {
        if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
        }
    });

})

const loader2 = new GLTFLoader()
loader2.load('./model/scene.gltf', function(gltf) {
    const root = gltf.scene;
    root.position.x = 0;
    root.position.y = 15;
    scene.add(root);
    // console.log(dumpObject(root).join('\n'));

    root.traverse(n => {
        if (n.isMesh) {
            n.castShadow = true;
            n.receiveShadow = true;
        }
    });

})


/**
 * Lights
 */
const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(-100, 200, 100);
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x000000);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight();
directionalLight.position.set(500, 500, -500);
directionalLight.castShadow = true;
directionalLight.intensity = 2;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 250;
directionalLight.shadow.camera.far = 1000;

let intensity = 50;

directionalLight.shadow.camera.left = -intensity;
directionalLight.shadow.camera.right = intensity;
directionalLight.shadow.camera.top = intensity;
directionalLight.shadow.camera.bottom = -intensity;
scene.add(directionalLight);

// directional light helper
const directionalLightFolder = gui.addFolder('Directional Light');
directionalLightFolder.add(directionalLight, 'visible');
directionalLightFolder.add(directionalLight.position, 'x').min(-500).max(500).step(10);
directionalLightFolder.add(directionalLight.position, 'y').min(-500).max(500).step(10);
directionalLightFolder.add(directionalLight.position, 'z').min(-500).max(500).step(10);
directionalLightFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.1);


/**
 * Fog
 */

const near = 20;
const far = 70;
const color = 'lightgreen';
scene.fog = new THREE.Fog(color, near, far);

// fog helper
const fogGUIHelper = new FogGUIHelper(scene.fog, scene.background);
gui.add(fogGUIHelper, 'near', near, far).listen();
gui.add(fogGUIHelper, 'far', near, far).listen();
gui.addColor(fogGUIHelper, 'color');

/**
 * Object: Reflective Sphere
 */
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(128, { format: THREE.RGBFormat, generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
let sphereCamera = new THREE.CubeCamera(1, 500, cubeRenderTarget);
sphereCamera.position.set(-3, 3, 0);
scene.add(sphereCamera);
const sphereMirror = new THREE.MeshBasicMaterial({
    envMap: sphereCamera.renderTarget.texture,
});
const sphereGeo = new THREE.SphereGeometry(1.5, 32, 16);
const mirrorBall = new THREE.Mesh(sphereGeo, sphereMirror);
mirrorBall.position.y = 3;
mirrorBall.position.x = -3;
scene.add(mirrorBall);

/**
 * Drag Controls
 */


const dragGeo = new THREE.ConeGeometry()
const dragMaterial = [
    new THREE.MeshPhongMaterial({ color: 'black', transparent: true }),
]

const cubes = [
    new THREE.Mesh(dragGeo, dragMaterial[0]),
]
cubes[0].position.set(0, -4.5, 10)

cubes.forEach((c) => scene.add(c))

const dragControls = new DragControls(cubes, camera, canvas)

dragControls.addEventListener('dragstart', function() { controls.enabled = false; });
dragControls.addEventListener('dragend', function() { controls.enabled = true; });

renderer.render(scene, camera, dragControls);

/**
 * Object: Mirror
 */

let planeMirror = new THREE.PlaneGeometry(40, 20);
const verticalMirror = new Reflector(planeMirror, {
    clipBias: 0.003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0x889999
});
verticalMirror.position.y = 5.5;
verticalMirror.position.z = -20;
scene.add(verticalMirror);

/**
 * Animate
 */

const tick = () => {

    // Update Orbital Controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    sphereCamera.update(renderer, scene);
    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}
tick();
