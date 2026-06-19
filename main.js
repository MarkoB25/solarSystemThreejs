import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { Pane, TabApi } from 'tweakpane';
import * as descService from './descriptionsService.js';
import { EffectComposer, FBXLoader, GLTFLoader, MTLLoader, OBJLoader, OutputPass } from 'three/examples/jsm/Addons.js';
import { DefaultScene } from './defaultScene.js';
import { SpaceViewerScene } from './spaceViewerScene.js';
import { RenderTransitionPass } from 'three/examples/jsm/postprocessing/RenderTransitionPass.js';
import { CharacterController } from './CharacterController.js';

let mixer = new THREE.AnimationMixer(); // initializing animation mixer
let animations = [];
let scene = new THREE.Scene(); // initializing scene
const textureLoader = new THREE.TextureLoader(); // initializing texture loader
const domRenderer = new CSS2DRenderer(); // css2dRendere for adding DOM elements to 3d space
domRenderer.setSize(window.innerWidth, window.innerHeight);
domRenderer.domElement.style.position = 'absolute';
domRenderer.domElement.style.top = '0px';
domRenderer.domElement.style.pointerEvents = 'none';

document.body.appendChild(domRenderer.domElement);

let currentScene = "default";
//setting the background
scene.background = textureLoader.load('static/stars/stars.jpg');

init();

function init(){
// camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);
camera.position.z = 1000;
camera.position.y = 5;

// canvas
const canvas = document.querySelector("canvas.threejs");
const canvasMenu = document.querySelector("canvas.menu");

// orbit controls
const orbitControls = new OrbitControls(camera, canvas);
orbitControls.enableDamping = true;

// loading scenes
const defaultScene = new DefaultScene(scene, camera , orbitControls);
const spaceViewerScene = new SpaceViewerScene();
const scene0 = defaultScene.getScene();
const scene1 = spaceViewerScene.getScene();

// loading the player characterController with the model and animations
let characterController;
const loader = new GLTFLoader();
loader.load('models/Soldier.glb', (gltf) => {

    const model = gltf.scene;
    model.scale.set(100, 100, 100); // setting the scale of our model

    model.traverse((object) => {
        if( object.isMesh ){
            object.castShadow = true;
            object.material.metalness = 1.0;
            object.material.roughness = 0.2;
            object.material.color.set( 1, 1, 1 );
			object.material.metalnessMap = object.material.map;
        }
    });
    const actions = new Map(); // map of our animation actions

    scene.add(model); // adding our model to the scene
    const animations = gltf.animations.filter(a => a.name != 'TPose');
    const mixer = new THREE.AnimationMixer(model);
    // adding the animations to the map
    const idleAction = mixer.clipAction(animations[0]);
    actions.set('idle', idleAction);
    const walkAction = mixer.clipAction(animations[2]);
    actions.set('walk', walkAction);
    const runAction = mixer.clipAction(animations[1]);
    actions.set('run', runAction);
    // initializing characterController
    characterController = new CharacterController(model, mixer, actions, orbitControls, camera, 'idle');
});
// renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});
 
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// raycaster
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove( event ) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};
// function for changing scene after click on wall object
function wallIntersect(){
    raycaster.setFromCamera( pointer, camera );
    let objs =  [];
    scene.children.forEach(child =>{
         if(typeof child === 'object'){
            objs.push(child);
        }
    })
    const intersects = raycaster.intersectObjects( objs );
    let currentElement = intersects[0];
    console.log(currentElement);

    if(typeof currentElement === 'object'){
        if(currentElement.object.name === 'firstWall'){
            currentScene = 'scene1';
         //   clearScene();
            setCamera();
        }
      
        if(currentElement.object.name === 'secondWall'){
            currentScene = 'scene2';
            setCamera();
           // clearScene();
        }
    };   
};
// rendering current scene
function renderCurrentScene(){
    if(currentScene == "default"){
        scene = scene0;
        if(!scene.background){
        scene.background = textureLoader.load('static/stars/stars.jpg');
       }      
    }
    if(currentScene == "scene1"){
        // render init
        scene = scene1;
        
        if(!scene.background){
            scene.background = textureLoader.load('static/stars/stars.jpg'); 
        }  
       // animate();
    }
    if(currentScene == "scene2"){
        // render init
        
    } 
}
// function to change camera based on wich scene is active
function setCamera(){
    
    if(currentScene == "default"){
        camera.position.z = 50;
        camera.position.y = 30;
        // render init
    }
    if(currentScene == "scene1"){
        // render init
        camera.position.z = 300;
        camera.position.y = 30;
    }
    if(currentScene == "scene2"){
        camera.position.z = 300;
        camera.position.y = 30;
    }
    renderer.render( scene, camera );
}


const keysPressed = [];
// keydown events
window.addEventListener('keydown', (e) => {
    if(e.key === 'Shift' && characterController  && currentScene === 'default'){
        keysPressed.push(e.key);
        characterController.toggleRun = true;
        console.log(characterController.toggleRun);
      //  console.log(keysPressed);
    };
    if(((e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') 
        && keysPressed.indexOf(e.key) === -1 ) &&
     characterController  &&
      currentScene === 'default'){
            keysPressed.push(e.key);
            characterController.toggleWalk = true;
           // console.log(keysPressed);
            // console.log('walk');
    };
     if(e.key === 'Escape'){
       currentScene = 'default';
    };
});
// keyup events
window.addEventListener('keyup', (e) => {
    if(e.key === 'Shift' && characterController){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        characterController.toggleRun = false;
    };
    if(e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd'){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        characterController.toggleWalk = false;
    };
});
// mousemove event
window.addEventListener('mousemove', onPointerMove);
// click events
window.addEventListener( 'click', () => {
    if(currentScene == 'default'){
        wallIntersect();
    }
    if(currentScene == 'scene1'){
        //showDesc();
    } 
    if(currentScene == 'scene2'){
        wallIntersect();
    }
} );
// reseize event
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; //azuriranje rez. ekrana
    camera.updateProjectionMatrix(); //azuriranje projekcije matrice sa ciljem dobijanja nove rezolucije prozora
    renderer.setSize(window.innerWidth, window.innerHeight);
    domRenderer.setSize(window.innerWidth, window.innerHeight);
});
// clock for delta time
const clock = new THREE.Clock();

// main gameloop
const gameloop = () => {
    let mixerUpadateDelta = clock.getDelta();
    if(characterController){
        characterController.update(mixerUpadateDelta, keysPressed); // azuriranje kontrola za karaktera
    }
    orbitControls.update(); // konstantno azuriranje, pri svakoj iteraciji
    renderCurrentScene(); // funkcija koja renderuje trenutnu scenu
    window.requestAnimationFrame(gameloop);
    domRenderer.render(scene, camera);
    renderer.render(scene, camera);
}
// calling the main loop
gameloop();
}