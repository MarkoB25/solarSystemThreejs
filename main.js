import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { Pane, TabApi } from 'tweakpane';
import * as descService from './descriptionsService.js';
import { EffectComposer, FBXLoader, GLTFLoader, MTLLoader, OBJLoader, OutputPass } from 'three/examples/jsm/Addons.js';
import { DefaultScene } from './Scenes/defaultScene.js';
import { SpaceViewerScene } from './Scenes/spaceViewerScene.js';
import { RenderTransitionPass } from 'three/examples/jsm/postprocessing/RenderTransitionPass.js';
import { CharacterController } from './js/CharacterController.js';
import { RapierPhysics } from 'three/addons/physics/RapierPhysics.js';
import { RigidBody } from '@dimforge/rapier3d';
import { SpaceshipScene } from './Scenes/spaceshipScene.js';
import { warnOnce } from 'three/src/utils.js';
import { SpaceshipController } from './js/SpaceshipController.js';

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

async function init(){
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
const defaultSceneClass = new DefaultScene(scene, camera , orbitControls);
const spaceViewerSceneClass = new SpaceViewerScene();
let spaceshipSceneClass = new SpaceshipScene(camera, orbitControls);

const defScene = defaultSceneClass.getScene();
const spaceScene = spaceViewerSceneClass.getScene();
const spaceshipScene = spaceshipSceneClass.getScene();
let spaceshipController;
 // getScene is an async function so to access the result(scene) we need to use then


// initializing the player characterController 
let characterController;
let world;
let bodies;
let shipRigidBody;
//let  = spaceshipSceneClass.spaceshipController;
 const loader = new GLTFLoader();
 const gltf = await loader.loadAsync('models/spaceship/scene.gltf');

const shipModel = gltf.scene;
shipModel.scale.set(10, 10, 10); // setting the scale of our model
shipModel.rotation.y = Math.PI/2;

shipModel.traverse((object) => {
    if( object.isMesh ){
        object.castShadow = true;
        object.material.metalness = 1.0;
        object.material.roughness = 0.2;
        object.material.color.set( 1, 1, 1 );
        object.material.metalnessMap = object.material.map;
    }
});
   
// physics engine
    import('@dimforge/rapier3d').then(RAPIER => {
        // Use the RAPIER module here.
        let gravity = { x: 0.0, y: -9.81, z: 0.0 };
        world = new RAPIER.World(gravity);

        // --- Floor (static) ---
        const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0));
        world.createCollider(RAPIER.ColliderDesc.cuboid(1000, 1, 1000).setDensity(5.0), floorBody.handle);

        const floorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2000, 2, 2000),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
        )
        scene.add(floorMesh);  

        // --- Box (dynamic, falls with gravity) ---
        const boxBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(100, 50, 0));
        console.log();
        world.createCollider(RAPIER.ColliderDesc.cuboid(25, 25, 25), boxBody);

        const box = new THREE.Mesh(
        new THREE.BoxGeometry(50, 50, 50),
        new THREE.MeshStandardMaterial({ color: 0xff4444 })
        )
        scene.add(box);

        // sphere 
        const sphereBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(100, 100, 0));
        world.createCollider(RAPIER.ColliderDesc.ball(30).setDensity(2.0), sphereBody);

        const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(30, 30, 30),
        new THREE.MeshStandardMaterial({ color: 0xff4444 })
        )
        scene.add(sphere);

        // bodies
        let bodies = [];
        bodies.push( { rigid: sphereBody, mesh: sphere } );
        bodies.push( { rigid: boxBody, mesh: box } );
        bodies.push({ rigid: floorBody, mesh: floorMesh });
        
        // loading the player characterController with the model and animations
       
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

        // CHARACTER RIGID BODY
            let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-1, 3, 1);
            let charRigidBody = world.createRigidBody(bodyDesc);
            // collider
            let dynamicCollider = RAPIER.ColliderDesc.ball(10);
            world.createCollider(dynamicCollider, charRigidBody);

            const ray =  new RAPIER.Ray( 
            { x: 0, y: 0, z: 0 },
            { x: 0, y: -1, z: 0} 
            );
            
            // initializing characterController
            characterController = new CharacterController(
                model,
                mixer,
                actions,
                orbitControls,
                camera,
                'idle',
                ray,
                charRigidBody
            );
        });

        // loading spaceship
        let shipDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0);
        let shipRigidBody = world.createRigidBody(shipDesc);
        // collider
        let shipCollider = RAPIER.ColliderDesc.capsule(10, 20);
        world.createCollider(shipCollider, shipRigidBody); 

        spaceshipController = new SpaceshipController(shipModel, orbitControls, camera, 'idle', shipRigidBody);
       
        let loop = () => {
        // Step the simulation forward.  
        world.step();
            bodies.forEach(body => {
            const position = body.rigid.translation();
            const rotation = body.rigid.rotation();

            body.mesh.position.set(position.x, position.y, position.z);
            body.mesh.quaternion.set(rotation.x, rotation.y, rotation.z, rotation.w);
            });
            
        setTimeout(loop, 16);
            };

        loop();

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

// rendering current scene
function renderCurrentScene(){
    if(currentScene == "default"){
        scene = defScene;
        if(!scene.background){
        scene.background = textureLoader.load('static/stars/stars.jpg');
       }     
    }
    if(currentScene == "spaceScene"){
        // render init
        scene = spaceScene;
        
        if(!scene.background){
            scene.background = textureLoader.load('static/stars/stars.jpg'); 
        }  
       // animate();
    }
    if(currentScene == "spaceshipScene"){
        // render init
        scene = spaceshipScene;
        if(!scene.background){
            scene.background = textureLoader.load('static/stars/stars.jpg'); 
        } 
        if(!scene.children.includes(spaceshipController.model)){
            scene.add(spaceshipController.model);
        }
    } 
}
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
            currentScene = 'spaceScene';
         //   clearScene();
            setCamera();
        }
      
        if(currentElement.object.name === 'secondWall'){
            currentScene = 'spaceshipScene';
            setCamera();
           // clearScene();
        }
    };   
};
// function to change camera based on wich scene is active
function setCamera(){
    
    if(currentScene == "default"){
        camera.position.z = 50;
        camera.position.y = 30;
        // render init
    }
    if(currentScene == "spaceScene"){
        // render init
        camera.position.z = 300;
        camera.position.y = 30;
    }
    if(currentScene == "spaceshipScene"){
        camera.position.z = 1000;
        camera.position.y = 30;
    }
    renderer.render( scene, camera );
}


const keysPressed = [];
// keydown events
window.addEventListener('keydown', (e) => {
    if(e.key === 'Shift' && characterController  && currentScene === 'default' && keysPressed.indexOf(e.key) === -1 ){
        keysPressed.push(e.key);
        characterController.toggleRun = true;
       // console.log(characterController.toggleRun);
      //  console.log(keysPressed);
    }else if(e.key === 'Shift' && spaceshipController  && currentScene === 'spaceshipScene' && keysPressed.indexOf(e.key) === -1 ){
        keysPressed.push(e.key);
        spaceshipController.toggleBoost = true;
        console.log(keysPressed);
    };
    if((
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        keysPressed.indexOf(e.key) === -1 ) &&
        characterController  &&
        currentScene === 'default'
    ){
            keysPressed.push(e.key);
            characterController.toggleWalk = true;
            // console.log(keysPressed);
            // console.log('walk');
    }else if(
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        keysPressed.indexOf(e.key) === -1  &&
        spaceshipController  &&
        currentScene === 'spaceshipScene'
    )
    {
        keysPressed.push(e.key);
        spaceshipController.toggleMove = true;
        console.log(keysPressed);
    };
     if(e.key === 'Escape'){
       currentScene = 'default';
       setCamera();
    };
});
// keyup events
window.addEventListener('keyup', (e) => {
    if(e.key === 'Shift' && characterController && currentScene === 'default'){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        characterController.toggleRun = false;
    }else if(e.key === 'Shift' && spaceshipController && currentScene === 'spaceshipScene'){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        spaceshipController.toggleBoost = false;
    };
    if(
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        characterController  &&
        currentScene === 'default'
    ){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        characterController.toggleWalk = false;
    }else if(
        (e.key === 'w' || e.key === 'a' || e.key === 's' || e.key === 'd') && 
        spaceshipController  &&
        currentScene === 'spaceshipScene'
    ){
        keysPressed.splice(keysPressed.indexOf(e.key), 1);
        spaceshipController.toggleMove = false;
    };
});
// mousemove event
window.addEventListener('mousemove', onPointerMove);
// click events
window.addEventListener( 'click', () => {
    if(currentScene == 'default'){
        wallIntersect();
    }
    if(currentScene == 'spaceScene'){
        //showDesc();
    } 
    if(currentScene == 'spaceshipScene'){
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
    let upadateDelta = clock.getDelta();
    if(characterController && currentScene == 'default'){
        characterController.update(world ,upadateDelta, keysPressed); // azuriranje kontrola za karaktera
    }else if(spaceshipController && currentScene == 'spaceshipScene'){
        spaceshipController.update(upadateDelta, keysPressed);
       // console.log('spaceee') // azuriranje kontrola za karaktera
    }
    orbitControls.update(); // konstantno azuriranje, pri svakoj iteraciji
    renderCurrentScene(); // funkcija koja renderuje trenutnu scenu
    window.requestAnimationFrame(gameloop);
    domRenderer.render(scene, camera);
    renderer.render(scene, camera);
   //console.log(spaceshipController)
}
// calling the main loop
gameloop();
}