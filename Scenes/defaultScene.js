import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {  GLTFLoader } from 'three/examples/jsm/Addons.js';
import { CharacterController } from '../js/CharacterController.js';

export class DefaultScene{
    // constructor
    constructor(scene, camera, orbitControls, loader, physicsContext)
                    {
                        this.scene = scene;
                        this.camera = camera;
                        this.orbitControls = orbitControls;
                        this.loader = loader;
                        this.physicsContext = physicsContext;
                        this.loaded = false;

                        this.bodies = [];
                        this.fixedBodies = [];
                        this.characterController = null;
                        this.mixers = [];

                        // onLoadProgress is a callback we get from main js
                        this.onLoadProgress = null;
                        this.loadedAssets = 0;
                        this.totalAssests = 1;
                    }
    // creating and returning the scene
    load(){
    const scene = this.scene;
    const loader = this.loader;
    let controller;
// --- physics context for rapier physics ---
    this.physicsContext.onReady((RAPIER, world) => {
 // Floor (static)
    const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0));
    world.createCollider(RAPIER.ColliderDesc.cuboid(1000, 1, 1000).setDensity(5.0), floorBody);
  
    const floorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2000, 2, 2000),
    new THREE.MeshStandardMaterial({ color: 0x888888 })
    )
    this.fixedBodies.push({rigid: floorBody, mesh: floorMesh});
    scene.add(floorMesh);  
    // Walls 
    const wallGeometry = new THREE.PlaneGeometry( 30, 30, 30, 30 );
    const wallMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    const wall = new THREE.Mesh( wallGeometry, wallMaterial );
    wall.position.y = 25;
    wall.name = 'firstWall';
    scene.add( wall );
    
   
    const wallMaterial2 = new THREE.MeshBasicMaterial( { color: 0x00ffff, side: THREE.DoubleSide } );
    const wallGeometry2 = new THREE.PlaneGeometry( 30, 30, 30, 30 );
    const wall2 = new THREE.Mesh( wallGeometry2, wallMaterial2 );
    wall2.position.x = 50;
    wall2.position.y = 50;
    wall2.name = 'secondWall';
    scene.add( wall2 );

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
                this.reportProgress()   
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
        this.mixers.forEach(m => m.update(delta));
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
        console.log('rigi body not right')
        return;
        }
    const numColliders = rigidBody.numColliders();
    console.log('rigidBody ima', numColliders, 'collidera, setujem enabled:', enabled);
    for (let i = 0; i < numColliders; i++) {
       const collider =  rigidBody.collider(i);
        console.log('collider:', collider, 'pre setEnabled');
        collider.setEnabled(enabled);
        console.log('posle setEnabled, collider.isEnabled():', collider.isEnabled ? collider.isEnabled() : 'nema isEnabled metodu')
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
   
}