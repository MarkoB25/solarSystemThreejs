import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {EntityCreator} from '../js/entityCreator.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { SpaceshipController } from '../js/SpaceshipController.js';

export class SpaceshipScene{
    // constructor
  constructor(camera, orbitControls, loader, physicsContext, textureLoader){
        this. scene = new THREE.Scene();
        this.camera = camera;
        this.orbitControls = orbitControls;
        this.spaceshipController = null;
        this.loader = loader;
        this.physicsContext = physicsContext;
        this.textureLoader = textureLoader;

        this.entityCreator = new EntityCreator();

        // arrays for storing rigid bodies and animtion mixers
        this.bodies = [];
        this.fixedBodies = [];
        this.mixers = [];
        // map of entites that have collison and collision flag
        this.colliderTags = new Map();
        this.isCreatingColliders = false;
        // onLoadProgress is a callback we get from main js
        this.onLoadProgress = null;
        this.loadedAssets = 0;
        this.totalAssests = 5;
        this.isLoaded = false;
    }
    // creating and returning the scene
    load(){
    const scene = this.scene;

// --- physics context for rapier physics ---
    this.physicsContext.onReady((RAPIER, world, eventQueue) => {

    const mercury = this.entityCreator.createPlanet(20, 30, 'Mercury');
    
        mercury.mesh.material.map = this.textureLoader.load('static/mercury/mercurymap.jpg');
        mercury.mesh.material.bumpMap = this.textureLoader.load('static/mercury/mercurybump.jpg');
        mercury.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        mercury.object.position.x = -500;

    scene.add(mercury.object);

    const asteroidBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(600, 0, 700));
    world.createCollider(RAPIER.ColliderDesc.ball(300).setDensity(10), asteroidBody);

    const asteroid = new THREE.Mesh(
            new THREE.SphereGeometry(300, 300, 300),
            new THREE.MeshStandardMaterial({ color: 0xff4444 })
            )
    asteroid.material.map = this.textureLoader.load('static/uranus/umbriel.jpg');
    asteroid.material.map.colorSpace = THREE.SRGBColorSpace;
            scene.add(asteroid);
            this.reportProgress();
            this.bodies.push({rigid: asteroidBody, mesh: asteroid});

        
    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xffffff, 9000);
    scene.add(svetloIzTacke);
    svetloIzTacke.position.y = 200;

    // CREATING SPACESHIP
    // Triangles: 2.7 Vertices: 1.4k
    this.loader.load('models/spaceship_lowpoly/scene.gltf', gltf => {
        const model = gltf.scene;
        model.scale.set(20, 20, 20); // setting the scale of our model
       // model.rotation.y = Math.PI/2;
    
        model.traverse((object) => {
            if( object.isMesh ){
                object.castShadow = true;
                object.material.metalness = 1.0;
                object.material.roughness = 0.2;
                object.material.color.set( 1, 1, 1 );
                object.material.metalnessMap = object.material.map;
            }
        });
        const animations = gltf.animations;
        const spaceshipMixer = new THREE.AnimationMixer(model);
        this.mixers.push(spaceshipMixer);
        const animationLoop = spaceshipMixer.clipAction(animations[0]);

        const ray =  new RAPIER.Ray( 
            { x: 0, y: 0, z: 0 },
            { x: 1, y: 0, z: 0} 
        );
        // rigid body
        this.isCreatingColliders = true;
        let shipDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0, 0);
        let shipRigidBody = world.createRigidBody(shipDesc);

        // getting the dimension of our model in order to make a cuboid c shaped collider
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        // collider
        let shipCollider = RAPIER.ColliderDesc.cuboid(size.x, size.y, size.z)
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
            .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);

        let shipColliderHandle = world.createCollider(shipCollider, shipRigidBody); 
        this.colliderTags.set(shipColliderHandle.handle, 'ship');
        // spaceship controller
        
        this.isCreatingColliders = false;
     // NOVO — wireframe capsule tačno kao collider
        const helperGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
        const helperMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const helper = new THREE.Mesh(helperGeo, helperMat);
        scene.add(helper);
        this.spaceshipController = new SpaceshipController(model, this.orbitControls, this.camera, 'idle', ray, shipRigidBody, helper);
        scene.add(model);  
        this.reportProgress();
    });

    // SPACE STATION
        // Triangles: 5.4k Vertices: 3.1k

    this.loader.load('models/the_saturn_orbiter/scene.gltf', (gltf) => {

        const stationModel = gltf.scene;
        stationModel.scale.set(100, 100, 100); // setting the scale of our model

        stationModel.traverse((object) => {
            if( object.isMesh ){
                object.castShadow = true;
                object.material.metalness = 1.0;
                object.material.roughness = 0.2;
                object.material.color.set( 1, 1, 1 );
                object.material.metalnessMap = object.material.map;
            }
        });
        const actions = new Map(); // map of our animation actions

        const stationPos = { x: 500, y: -150, z: 0 };
        //scene.add(stationModel); // adding our model to the scene
        const animations = gltf.animations;
        const stationMixer = new THREE.AnimationMixer(stationModel);
        this.mixers.push(stationMixer);
        const animationLoop = stationMixer.clipAction(animations[0]);
        animationLoop.play();  
        
        // 1. prvo pozicioniraj model TAMO gde treba da bude
        stationModel.position.set(stationPos.x, stationPos.y, stationPos.z);
        scene.add(stationModel);
        stationModel.updateMatrixWorld(true);

        // 2. TEK SAD meri — ovo meri stvarni world-space bounding box na finalnoj poziciji
        const box = new THREE.Box3().setFromObject(stationModel);
        const center = new THREE.Vector3();
        const size = new THREE.Vector3();
        box.getCenter(center);
        box.getSize(size);

        this.isCreatingColliders = true;
        // 3. rigid body ide na IZMERENI centar (koji sad odražava stvarnu poziciju modela + pivot offset)
        let stationDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
        let stationRigidBody = world.createRigidBody(stationDesc);

        let stationCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2)
            .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
            .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
        let stationColliderHandle = world.createCollider(stationCollider, stationRigidBody);
        this.colliderTags.set(stationColliderHandle.handle, 'station');

        const helper = new THREE.BoxHelper(stationModel, 0xff0000);
        scene.add(helper);

        this.fixedBodies.push({rigid: stationRigidBody, mesh: stationModel});
        this.isCreatingColliders = false;
        this.reportProgress();
    });
    // BLACK HOLE SUN
        // Triangles: 10.3k Vertices: 5.4k
        this.loader.load('models/black_hole/scene.gltf', gltf => {
            const blackHoleModel = gltf.scene;
            blackHoleModel.scale.set(100, 100, 100); // setting the scale of our model
            blackHoleModel.position.set(-700, 0, -400);
    
            blackHoleModel.traverse((object) => {
                if( object.isMesh ){
                    object.castShadow = true;
                    /* object.material.metalness = 1.0;
                    object.material.roughness = 0.2;
                    object.material.color.set( 1, 1, 1 );
                    object.material.metalnessMap = object.material.map; */
                }
            });
            const animations = gltf.animations;
            const blackHoleMixer = new THREE.AnimationMixer(blackHoleModel);
            this.mixers.push(blackHoleMixer);
            const animationLoop = blackHoleMixer.clipAction(animations[0]);
            animationLoop.play();
            scene.add(blackHoleModel);

            const box = new THREE.Box3().setFromObject(blackHoleModel);
            const center = new THREE.Vector3();
            const size = new THREE.Vector3();
            box.getCenter(center);
            box.getSize(size);

            this.isCreatingColliders = true;
            let blackHoleDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
            let blackHoleRigidBody = world.createRigidBody(blackHoleDesc);

            let blackHoleCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y, size.z/2)
                .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
                .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
            let blackHoleColliderHandle = world.createCollider(blackHoleCollider, blackHoleRigidBody);
            this.colliderTags.set(blackHoleColliderHandle.handle, 'blackHole');
        
            const helper = new THREE.BoxHelper(blackHoleModel, 0xff0000);
            scene.add(helper);

            this.fixedBodies.push({rigid: blackHoleRigidBody, mesh: blackHoleModel});
            this.isCreatingColliders = false;
            this.reportProgress();
        });    
    // SPACE GATE
        // Triangles: 5.5k Vertices: 3.1k
        this.loader.load('models/space_gate/scene.gltf', gltf => {
            const spaceGateModel = gltf.scene;
            spaceGateModel.scale.set(200, 200, 200); // setting the scale of our model
            spaceGateModel.position.set(0, 0, -1300);
    
            spaceGateModel.traverse((object) => {
                if( object.isMesh ){
                    object.castShadow = true;
                    /* object.material.metalness = 1.0;
                    object.material.roughness = 0.2;
                    object.material.color.set( 1, 1, 1 );
                    object.material.metalnessMap = object.material.map; */
                }
            });
            const animations = gltf.animations;
            const spaceGateMixer = new THREE.AnimationMixer(spaceGateModel);
            this.mixers.push(spaceGateMixer);
            const animationLoop = spaceGateMixer.clipAction(animations[0]);
            animationLoop.play();
            scene.add(spaceGateModel);

            const box = new THREE.Box3().setFromObject(spaceGateModel);
            const center = new THREE.Vector3();
            const size = new THREE.Vector3();
            box.getCenter(center);
            box.getSize(size);

            this.isCreatingColliders = true;
            let spaceGateDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
            let spaceGateRigidBody = world.createRigidBody(spaceGateDesc);

            let spaceGateCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y, size.z/2)
                .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
                .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
            let spaceGateColliderHandle = world.createCollider(spaceGateCollider, spaceGateRigidBody);
            this.colliderTags.set(spaceGateColliderHandle.handle, 'spaceGate');
        
            const helper = new THREE.BoxHelper(spaceGateModel, 0xff0000);
            scene.add(helper);

            this.fixedBodies.push({rigid: spaceGateRigidBody, mesh: spaceGateModel});
            this.isCreatingColliders = false;
            this.reportProgress();
        });    
    });

    this.isLoaded = true;
    }
    update(world, delta, keysPressed) {
        this.mixers.forEach(m => m.update(delta));
        if (this.spaceshipController) {
            this.spaceshipController.update(world, delta, keysPressed);
        }
    }
    getScene(){
        return this.scene;
    }
    getIsLoaded(){
        return this.isLoaded;
    }
    getBodies(){
        return this.bodies;
    }
    getSpaceshipController(){
        return this.spaceshipController;
    }
    getthisIsCreatingColliders(){
        return this.isCreatingColliders;
    }
    handleCollision(handle1, handle2, started){
        const tag1 = this.colliderTags.get(handle1);
        const tag2 = this.colliderTags.get(handle2);
        console.log('collision:', tag1, tag2, 'started:', started);

        const isStationCollision = (tag1 === 'ship' && tag2 === 'station') || (tag1 === 'station' && tag2 === 'ship');

        const isBlackHoleCollision = (tag1 === 'ship' && tag2 === 'blackHole') || (tag1 === 'blackHole' && tag2 === 'ship');

        if(isStationCollision){
            if(started){
                this.spaceshipController.onCollisionStart();
            }else{
                this.spaceshipController.onCollisionEnd();
            }
        }
        if(isBlackHoleCollision){
            if(started){
                this.spaceshipController.onCollisionStartTeleport();
                }else{
                    this.spaceshipController.onCollisionEndTeleport();
                }
            
        }
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
        //console.log('rigidBody ima', numColliders, 'collidera, setujem enabled:', enabled);
        for (let i = 0; i < numColliders; i++) {
        const collider =  rigidBody.collider(i);
            //console.log('collider:', collider, 'pre setEnabled');
            collider.setEnabled(enabled);
            //console.log('posle setEnabled, collider.isEnabled():', collider.isEnabled ? collider.isEnabled() : 'nema isEnabled metodu')
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
        if(world)world.gravity = { x: 0.0, y: -9.81, z: 0.0 };
    }
    enablePhysics(world) {
        this.bodies.forEach(b => { this.setColliderEnabled(b.rigid, true) });
        this.fixedBodies.forEach(b => { this.setColliderEnabled(b.rigid, true) });

        if (this.spaceshipController && this.spaceshipController.rigidBody) {
            this.setColliderEnabled(this.spaceshipController.rigidBody, true);
            }
        if(world)world.gravity = { x: 0.0, y: 0.0, z: 0.0 };
    }
}