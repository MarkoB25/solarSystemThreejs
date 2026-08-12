import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {  GLTFLoader } from 'three/examples/jsm/Addons.js';
import { CharacterController } from '../js/CharacterController.js';
import { texture } from 'three/src/nodes/TSL.js';

export class DefaultScene{
    // constructor
    constructor(scene, camera, orbitControls, loader, physicsContext, textureLoader)
                    {
                        this.scene = scene;
                        this.camera = camera;
                        this.orbitControls = orbitControls;
                        this.loader = loader;
                        this.physicsContext = physicsContext;
                        this.textureLoader = textureLoader;

                        this.loaded = false;
                        this.bodies = [];
                        this.fixedBodies = [];
                        this.characterController = null;
                        this.mixers = [];
                        this.colliderTags = new Map();
                        this.isColliding = false;

                        // onLoadProgress is a callback we get from main js
                        this.onLoadProgress = null;
                        this.loadedAssets = 0;
                        this.totalAssests = 9;
                        this.skybox = null;
                    }
    // creating and returning the scene
    load(){
    const scene = this.scene;
    const loader = this.loader;

// --- physics context for rapier physics ---
this.physicsContext.onReady((RAPIER, world) => {
    // Floor (static)
    const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0));
    world.createCollider(RAPIER.ColliderDesc.cuboid(1000, 1, 1000).setDensity(5.0), floorBody);
  
    const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2000, 2, 2000),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
    )
    floorMesh.position.set(0, -1, 0);
    floorMesh.material.map = this.textureLoader.load('static/defaultScene/floor3.jfif');
    floorMesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.fixedBodies.push({rigid: floorBody, mesh: floorMesh});
    scene.add(floorMesh);  

    // planes 
    const planeGeometry = new THREE.PlaneGeometry( 30, 30, 30, 30 );
    const planeMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.position.y = 25;
    plane.name = 'firstPlane';
    scene.add( plane );
    
    const planeMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ffff, side: THREE.DoubleSide } );
    const planeGeometry2 = new THREE.PlaneGeometry( 90, 50, 30, 30 );
    const plane2 = new THREE.Mesh( planeGeometry2, planeMaterial2 );
    plane2.material.map = this.textureLoader.load('static/defaultScene/computer_panel.jpg');
    plane2.position.set(100, 50, 0);
    plane2.name = 'secondPlane';
    scene.add( plane2 );

    // Box (dynamic, falls with gravity)
        const boxBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(100, 50, 0));
        world.createCollider(RAPIER.ColliderDesc.cuboid(25, 25, 25), boxBody);

        const box = new THREE.Mesh(
        new THREE.BoxGeometry(50, 50, 50),
        new THREE.MeshStandardMaterial({ color: 0xff4444 })
        )
        scene.add(box);
        this.bodies.push({rigid: boxBody, mesh: box});
    // Sphere 
        const sphereBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(100, 100, 0));
        world.createCollider(RAPIER.ColliderDesc.ball(30).setDensity(2.0), sphereBody);

        const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(30, 30, 30),
        new THREE.MeshStandardMaterial({ color: 0xff4444 })
        )
        scene.add(sphere);
        this.bodies.push({rigid: sphereBody, mesh: sphere});

        // Walls with windows 
        // Each door istriangles 2k vertecies 1k
        const wallPositions = [ { x: 900, y: 1, z: 0 }, { x: -900, y: 1, z: 0 }, { x: 0, y: 1, z: 900 }];
        const rightWallPos = { x: 900, y: 3, z: 0 };
        const leftWallPos = {x: -900, y: 3, z: 0 };
        const frontWallPos = {  x: 0, y: 3, z: 900 };
        const wallPath = 'models/wall_with_window/scene.gltf';
        
        this.createWallAtPositions(wallPath, rightWallPos, RAPIER, world, 80, 'rightWall');
        this.createWallAtPositions(wallPath, leftWallPos, RAPIER, world, 80, 'leftWall');
        this.createWallAtPositions(wallPath, frontWallPos, RAPIER, world, 80, 'frontWall');
// SKYBOX
// Triangles: 5.5k Vertices: 3.1k
this.loader.load('models/skybox/scene.gltf', gltf => {
    const skyboxModel = gltf.scene;
    skyboxModel.scale.set(20, 20, 20); // setting the scale of our model
    skyboxModel.position.set(0, 0, 0);

    skyboxModel.traverse((object) => {
        // ids can be check in console when planeIntersects is active this scene
        // go to main.js to enable or disable
        if(object.isObject3D){
             let len = object.children.length;
                    for(let i = 0; i < len; i++){
                        if(object.children[i].name == 'Sphere003_gameasset_Sphere003_gameasset_Mat_1_0' 
                            || object.children[i].name == 'Sphere001_gameasset_Sphere001_gameasset_Mat_1_0'
                            || object.children[i].name == 'Sphere002_gameasset_Sphere002_gameasset_Mat_1_0'
                        )object.remove(object.children[i]);
                    }
        }
        if( object.isMesh && object.name == "Sphere_Material_0"){
            object.castShadow = true;
            object.material.map = this.textureLoader.load('models/skybox/textures/Sphere.002_gameasset_Mat_1_baseColor.png');
            this.reportProgress();
            object.material.normalMap = this.textureLoader.load('models/skybox/textures/Sphere.002_gameasset_Mat_1_normal.png');
            //object.material.color = this.textureLoader.load('models/skybox/textures/Sphere.001_gameasset_Mat_1_baseColor.png');
            this.reportProgress();
            this.skybox = object;
        }
    });
    console.log(skyboxModel)
    scene.add(skyboxModel);

    const box = new THREE.Box3().setFromObject(skyboxModel);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    this.isCreatingColliders = true;
    let skyboxDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
    let skyboxRigidBody = world.createRigidBody(skyboxDesc);

    let skyboxCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y, size.z/2)
        .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
        .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
    let skyboxColliderHandle = world.createCollider(skyboxCollider, skyboxRigidBody);
    this.colliderTags.set(skyboxColliderHandle.handle, 'skybox');

    this.fixedBodies.push({rigid: skyboxRigidBody, mesh: skyboxModel});
    this.isCreatingColliders = false;
    this.reportProgress();
    });  
      
            // Main door
            // triangles 9.7k vertecies 5.1k
            loader.load('models/door/scene.gltf', (gltf) => {
    
                const doorModel = gltf.scene;
                doorModel.scale.set(100, 100, 100);
                doorModel.position.set(0, 1, -900) // setting the scale of our model
    
                doorModel.traverse((object) => {
                    if( object.isMesh ){
                        object.castShadow = true;
                        object.material.color.set( 1, 1, 1 );
                    }
                });
                const actions = new Map(); // map of our animation actions
    
                scene.add(doorModel); // adding our model to the scene
                const animations = gltf.animations.filter(a => a.name != 'TPose');
                const doorMixer = new THREE.AnimationMixer(doorModel);
                // this model has animations for opening and closing the door
                // they are currently unused but do exist 
                this.mixers.push(doorMixer);

                const box = new THREE.Box3().setFromObject(doorModel);
                const center = new THREE.Vector3();
                const size = new THREE.Vector3();
                box.getCenter(center);
                box.getSize(size);
            
                // rigid body & collider
                let doorDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
                let doorRigidBody = world.createRigidBody(doorDesc);
               
                let doorCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2).setDensity(5.0)
                    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
                    .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
                
                let doorColliderHandle = world.createCollider(doorCollider, doorRigidBody);
                this.colliderTags.set(doorColliderHandle.handle, 'door');

                const helper = new THREE.BoxHelper(doorModel, 0xff0000);
                scene.add(helper);

                this.fixedBodies.push( {rigid: doorRigidBody, mesh: doorModel} );
                this.reportProgress();   
            });

            // wall computer
            loader.load('models/wall_computer_small/scene.gltf', (gltf) => {
    
                const wallComputerModel = gltf.scene;
                wallComputerModel.scale.set(10, 10, 10);// setting the scale of our model
                wallComputerModel.position.set(-200, 30, 0) 
              //  console.log(wallComputerModel.position);
    
                wallComputerModel.traverse((object) => {
                    if( object.isMesh ){
                        object.castShadow = true;
                        object.material.color.set( 1, 1, 1 );
                    }
                });
                const actions = new Map(); // map of our animation actions
    
                scene.add(wallComputerModel); // adding our model to the scene
                const animations = gltf.animations.filter(a => a.name != 'TPose');
                const wallComputerMixer = new THREE.AnimationMixer(wallComputerModel);
                // this model has animations for opening and closing the wallComputer
                // they are currently unused but do exist 
                this.mixers.push(wallComputerMixer);

                const box = new THREE.Box3().setFromObject(wallComputerModel);
                const center = new THREE.Vector3();
                const size = new THREE.Vector3();
                box.getCenter(center);
                box.getSize(size);

                // rigid body & collider
                let wallComputerDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
                let wallComputerRigidBody = world.createRigidBody(wallComputerDesc);
               
                let wallComputerCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2).setDensity(5.0)
                    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
                    .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
                
                let wallComputerColliderHandle = world.createCollider(wallComputerCollider, wallComputerRigidBody);
                this.colliderTags.set(wallComputerColliderHandle.handle, 'wallComputer');

                const helper = new THREE.BoxHelper(wallComputerModel, 0xff0000);
                scene.add(helper);

                this.fixedBodies.push( {rigid: wallComputerRigidBody, mesh: wallComputerModel} );
                this.reportProgress();   
            }); 
 // loading the player characterController with the model and animations
            // triangles 11k vertecies 7k
            loader.load('models/Soldier.glb', (gltf) => {
    
                const model = gltf.scene;
                model.scale.set(100, 100, 100); // setting the scale of our model
    
                model.traverse((object) => {
                    if( object.isMesh ){
                        object.castShadow = true;
                        object.material.color.set( 1, 1, 1 );
                    }
                });
                const actions = new Map(); // map of our animation actions
    
                scene.add(model); // adding our model to the scene
                const animations = gltf.animations.filter(a => a.name != 'TPose');
                const charMixer = new THREE.AnimationMixer(model);
                // adding the animations to the map
                const idleAction = charMixer.clipAction(animations[0]);
                actions.set('idle', idleAction);
                const walkAction = charMixer.clipAction(animations[2]);
                actions.set('walk', walkAction);
                const runAction = charMixer.clipAction(animations[1]);
                actions.set('run', runAction);

                this.mixers.push(charMixer);
    
                // rigid body
                let bodyDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(-1, 3, 1);
                let charRigidBody = world.createRigidBody(bodyDesc);
                // collider
                let charCollider = RAPIER.ColliderDesc.ball(10);
                let charColliderHandle = world.createCollider(charCollider, charRigidBody);

                this.colliderTags.set(charColliderHandle.handle, 'character');

                const ray =  new RAPIER.Ray( 
                { x: 0, y: 0, z: 0 },
                { x: 0, y: -1, z: 0} 
                );
                
                // initializing characterController
                this.characterController = new CharacterController(
                    model,
                    charMixer,
                    actions,
                    this.orbitControls,
                    this.camera,
                    'idle',
                    ray,
                    charRigidBody
                );
                this.characterController.setFixedCollisions(this.fixedBodies);
                this.reportProgress();   
            });
       
    });

    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xffffff, 9000);
    svetloIzTacke.position.y = 200;
    scene.add(svetloIzTacke);
    }

update(world, delta, keysPressed) {
    let len = this.mixers.length;
    for(let i = 0; i < len; i++){
        this.mixers[i].update(delta);
    }
    if (this.characterController) {
        this.characterController.update(world, delta, keysPressed);
    }
}

getScene(){
    return this.scene;
}
getCharacterController(){
    return this.characterController;
}
getBodies(){
    return this.bodies;
}

reportProgress(){
    this.loadedAssets++;
    if(this.onLoadProgress){
        this.onLoadProgress(this.loadedAssets, this.totalAssests);
    }
}

setColliderEnabled(rigidBody, enabled) {
    if (!rigidBody){ 
        return;
        }
    const numColliders = rigidBody.numColliders();
    
    for (let i = 0; i < numColliders; i++) {
        const collider =  rigidBody.collider(i);
        collider.setEnabled(enabled);
        }
    }
disablePhysics(world) {
    // dynamic/fixed bodies (floor, box, sphere)
    this.bodies.forEach(b => { this.setColliderEnabled(b.rigid, false) });
    this.fixedBodies.forEach(b => { this.setColliderEnabled(b.rigid, false) });

    // not in bodies so must be done manually
    if (this.characterController && this.characterController.rigidBody) {
        this.setColliderEnabled(this.characterController.rigidBody, false);
        }
       if(world)world.gravity = { x: 0.0, y: 0.0, z: 0.0 };
        }
enablePhysics(world) {
    this.bodies.forEach(b => { this.setColliderEnabled(b.rigid, true) });
    this.fixedBodies.forEach(b => { this.setColliderEnabled(b.rigid, true) });

    if (this.characterController && this.characterController.rigidBody) {
        this.setColliderEnabled(this.characterController.rigidBody, true);
        }
    if(world)world.gravity = { x: 0.0, y: -9.81, z: 0.0 };
        
        }

handleCollision(handle1, handle2, started){
        const tag1 = this.colliderTags.get(handle1);
        const tag2 = this.colliderTags.get(handle2);
        console.log('collision:', tag1, tag2, 'started:', started);

        const isDoorCollision = (tag1 === 'door'  && tag2 === 'character') || (tag1 === 'character' && tag2 === 'door' );
        const isRightWallCollision = (tag1 === 'rightWall'  && tag2 === 'character') || (tag1 === 'character' && tag2 === 'rightWall' );
        const isLeftWallCollision = (tag1 === 'leftWall'  && tag2 === 'character') || (tag1 === 'character' && tag2 === 'leftWall' );
        const isFrontWallCollision = (tag1 === 'frontWall'  && tag2 === 'character') || (tag1 === 'character' && tag2 === 'frontWall' );
        const isWallComputerCol = (tag1 === 'wallComputer'  && tag2 === 'character') || (tag1 === 'character' && tag2 === 'wallComputer' );

        if(isDoorCollision || isWallComputerCol){
            if(started){
                this.characterController.onCollisionStart();
            }else{
                this.characterController.onCollisionEnd();
            }
        }
        if(isRightWallCollision){
            if(started){
                this.characterController.onWallCollisionStart('rightWall');
            }else{
                this.characterController.onWallCollisionEnd('rightWall');
            }
        }
        if(isLeftWallCollision){
            if(started){
                this.characterController.onWallCollisionStart('leftWall');
            }else{
                this.characterController.onWallCollisionEnd('leftWall');
            }
        }
        if(isFrontWallCollision){
            if(started){
                this.characterController.onWallCollisionStart('frontWall');
            }else{
                this.characterController.onWallCollisionEnd('frontWall');
            }
        }

    }
    createWallAtPositions(modelPath, position, RAPIER, world, scale, colliderTag){
            this.loader.load(modelPath, (gltf) => {
                
                    const model = gltf.scene.clone(true);
                    model.scale.set(scale, scale, scale);
                    model.position.set(position.x, position.y, position.z);
                    // setting the scale of our model
                    if(position.x == 0 && position.y == 3 && position.z == 900){
                        model.rotateY(Math.PI/2);
                    }
                    model.traverse((object) => {
                        if( object.isMesh ){
                            object.castShadow = true;
                            object.material.metalness = 0.6;
                            object.material.roughness = 0.4;
                        }
                    });
                    
                    this.scene.add(model);
                    const box = new THREE.Box3().setFromObject(model);
                    const center = new THREE.Vector3();
                    const size = new THREE.Vector3();
                    box.getCenter(center);
                    box.getSize(size);

                    // rigid body & collider
                    let modelDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
                    let modelRigidBody = world.createRigidBody(modelDesc);
                
                    let modelCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2).setDensity(5.0)
                        .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
                        .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
                    
                    let modelColliderHandle = world.createCollider(modelCollider, modelRigidBody);
                    this.colliderTags.set(modelColliderHandle.handle, colliderTag);

                    /* const helper = new THREE.BoxHelper(wallSideModel, 0xff0000);
                    scene.add(helper); */

                    this.fixedBodies.push( {rigid: modelRigidBody, mesh: model} );
                    this.reportProgress();   
                
               
            });
    }
    animate(){
        if(this.skybox){
           this.skybox.rotateY(0.0005);
}
    }
   
}