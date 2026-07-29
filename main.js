import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { GLTFLoader, WorkerPool } from 'three/examples/jsm/Addons.js';
import { DefaultScene } from './Scenes/defaultScene.js';
import { SpaceViewerScene } from './Scenes/spaceViewerScene.js';
import { SpaceshipScene } from './Scenes/spaceshipScene.js';
import { CharacterController } from './js/CharacterController.js';
import { SpaceshipController } from './js/SpaceshipController.js';
import { PhysicsContext } from './js/physicsContext.js';


let scene = new THREE.Scene(); // initializing scene
const textureLoader = new THREE.TextureLoader(); // initializing texture loader
const domRenderer = new CSS2DRenderer(); // css2dRendere for adding DOM elements to 3d space
domRenderer.setSize(window.innerWidth, window.innerHeight);
domRenderer.domElement.style.position = 'absolute';
domRenderer.domElement.style.top = '0px';
domRenderer.domElement.style.pointerEvents = 'none';

document.body.appendChild(domRenderer.domElement);

const loadingScreen = document.getElementById('loadingScreen');
const loadingBar = document.getElementById('loadingBar');
const loadingText = document.getElementById('loadingText');

function showLoadingScreen() {
    loadingScreen.style.display = 'flex';
    loadingScreen.style.opacity = '1';
    loadingBar.style.width = '0%';
}

function hideLoadingScreen() {
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500); // sačekaj tranziciju
}

function updateLoadingProgress(loaded, total) {
    const percent = Math.round((loaded / total) * 100);
    loadingBar.style.width = percent + '%';
    loadingText.textContent = `Progress... ${percent}%`;
    if (loaded >= total) {
        hideLoadingScreen();
    }
}

let currentScene = "default";
//setting the background
const backgroundImage = textureLoader.load('static/stars/stars.jpg');
scene.background = backgroundImage;

const spaceshipSceneFlag = 'spaceshipScene';
const defaulSceneFlag = 'default';
const spaceViewerSceneFlag = 'spaceViewerScene';

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

let upadateDelta;
let world;
let eventQueue; 

const loader = new GLTFLoader();
const physicsContext = new PhysicsContext();

// physics engine
import('@dimforge/rapier3d').then(RAPIER => {
    // Use the RAPIER module here.
    let gravity = { x: 0.0, y: -9.81, z: 0.0 };
    world = new RAPIER.World(gravity);

    eventQueue = new RAPIER.EventQueue(true);

    physicsContext.init(RAPIER, world, eventQueue);
});

// initiating scenes
const defaultSceneClass = new DefaultScene(scene, camera , orbitControls, loader, physicsContext);
const spaceViewerSceneClass = new SpaceViewerScene();
const spaceshipSceneClass = new SpaceshipScene(camera, orbitControls, loader, physicsContext, textureLoader);
// loading deafult scene
defaultSceneClass.totalAssests = 1;
defaultSceneClass.onLoadProgress = updateLoadingProgress;
showLoadingScreen();
defaultSceneClass.load();

defaultSceneClass.enablePhysics(world);
scene = defaultSceneClass.getScene();

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
            currentScene = spaceViewerSceneFlag;
            let isLoaded = spaceViewerSceneClass.getIsLoaded();

            if(!isLoaded){
                showLoadingScreen();
                spaceViewerSceneClass.onLoadProgress = updateLoadingProgress;
                scene = spaceViewerSceneClass.load();

            }

            scene = spaceViewerSceneClass.getScene();
        
            if(!scene.background){
                scene.background = backgroundImage;
            }  
            setCamera();
        }
      
        if(currentElement.object.name === 'secondWall'){
            currentScene = spaceshipSceneFlag;
            defaultSceneClass.disablePhysics(world);
            let isLoaded = spaceshipSceneClass.getIsLoaded();

            if(!isLoaded){
                showLoadingScreen();
                spaceshipSceneClass.onLoadProgress = updateLoadingProgress;
                spaceshipSceneClass.load();
            }
            spaceshipSceneClass.enablePhysics(world);
            scene = spaceshipSceneClass.getScene();
        
            if(!scene.background){
                scene.background = backgroundImage; 
            }  
            setCamera();
           // clearScene();
        }
    };   
};
// function to change camera based on wich scene is active
function setCamera(){
    
    if(currentScene === defaulSceneFlag){
        camera.position.x = defaultSceneClass.characterController.model.position.x; 
        camera.position.y = 30;
        camera.position.z = 300;
    }
    if(currentScene === spaceViewerSceneFlag){
        camera.position.x = 50;
        camera.position.y = 30;
        camera.position.z = 300;
    }
    if(currentScene === spaceshipSceneFlag){
        camera.position.y = 30;
        camera.position.z = 1000;
    }
    renderer.render( scene, camera );
}


const keysPressed = [];
// keydown events
window.addEventListener('keydown', (e) => {
    let cc = defaultSceneClass.getCharacterController();
    let sc = spaceshipSceneClass.getSpaceshipController();
    if(e.key === 'Shift' && cc  && currentScene == defaulSceneFlag && keysPressed.indexOf(e.key) === -1 ){
        keysPressed.push(e.key);
        cc.toggleRun = true;
       // console.log(characterController.toggleRun);
       console.log(keysPressed);
    }else if(e.key === 'Shift' && sc  && currentScene == spaceshipSceneFlag && keysPressed.indexOf(e.key) === -1 ){
        keysPressed.push(e.key);
        sc.toggleBoost = true;
        //console.log(keysPressed);
    };
    if((
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        keysPressed.indexOf(e.key) === -1 ) &&
        cc  &&
        currentScene == defaulSceneFlag
    ){
            keysPressed.push(e.key);
            cc.toggleWalk = true;
            console.log(keysPressed);
            // console.log('walk');
    }else if(
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        keysPressed.indexOf(e.key) === -1  &&
        sc  &&
        currentScene == spaceshipSceneFlag
    )
    {
        keysPressed.push(e.key);
        sc.toggleMove = true;
       // console.log(keysPressed);
    };
    if(e.key === 'Escape' && currentScene != defaulSceneFlag){
        if(currentScene == spaceshipSceneFlag){
            spaceshipSceneClass.disablePhysics(world);
        }
       currentScene = defaulSceneFlag;
       scene = defaultSceneClass.getScene();
       defaultSceneClass.enablePhysics(world);
       setCamera();
    };
});
// keyup events
window.addEventListener('keyup', (e) => {
    let cc = defaultSceneClass.getCharacterController();
    let sc = spaceshipSceneClass.getSpaceshipController();

    if(e.key === 'Shift' && cc && currentScene === defaulSceneFlag){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        cc.toggleRun = false;
    }else if(e.key === 'Shift' && sc && currentScene === spaceshipSceneFlag){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        sc.toggleBoost = false;
    };
    if(
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        cc  &&
        currentScene == defaulSceneFlag
    ){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        cc.toggleWalk = false;
    }else if(
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        sc  &&
        currentScene == spaceshipSceneFlag
    ){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        sc.toggleMove = false;
    };
});
// mousemove event
window.addEventListener('mousemove', onPointerMove);
// click events
window.addEventListener( 'click', () => {
    if(currentScene == defaulSceneFlag){
        wallIntersect();
    }
    if(currentScene == spaceViewerSceneFlag){
        //showDesc();
    } 
    if(currentScene == spaceshipSceneFlag){
      //  wallIntersect();
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
    // flag for creating cilliders, if false colliders are created
    let isCreatingColliders = spaceshipSceneClass.getthisIsCreatingColliders();
    upadateDelta = clock.getDelta();
    //console.log(isCreatingColliders)
if(world){
    if(!isCreatingColliders){
        world.step(eventQueue);

        eventQueue.drainCollisionEvents((handle1, handle2, started) => {
            if(currentScene == defaulSceneFlag){
                defaultSceneClass.handleCollision(handle1, handle2, started);
            }
            if(currentScene == spaceshipSceneFlag){
                spaceshipSceneClass.handleCollision(handle1, handle2, started);
            }
        
        });
    }
    //console.log(eventQueue);
/* world.colliders.forEach(c => {
    console.log('handle:', c.handle, 'shape:', c.shape.type);
}); */

    if(currentScene == defaulSceneFlag){
        defaultSceneClass.update(world, upadateDelta, keysPressed);
        const defaultBodies = defaultSceneClass.getBodies();
        defaultBodies.forEach(body => {
        const position = body.rigid.translation();
        const rotation = body.rigid.rotation();

        body.mesh.position.set(position.x, position.y, position.z);
        body.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        });
    }
    if(currentScene == spaceshipSceneFlag){
        spaceshipSceneClass.update(world, upadateDelta, keysPressed);
        const spaceshipBodies = spaceshipSceneClass.getBodies();
        spaceshipBodies.forEach(body => {
        const position = body.rigid.translation();
        const rotation = body.rigid.rotation();

        body.mesh.position.set(position.x, position.y, position.z);
        body.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
        });
    }
}
    if(currentScene == spaceViewerSceneFlag){
        const planetGroup = spaceViewerSceneClass.getPlanets();
        const naturalSatellites = spaceViewerSceneClass.getNaturalSatellites();
        const sun = spaceViewerSceneClass.getSun();
        if(planetGroup){
            spaceViewerSceneClass.animate(planetGroup, naturalSatellites, sun);
        }
        
    }

    orbitControls.update(); // konstantno azuriranje, pri svakoj iteraciji
    window.requestAnimationFrame(gameloop);
    domRenderer.render(scene, camera);
    renderer.render(scene, camera);
}
// calling the main loop
gameloop();
}