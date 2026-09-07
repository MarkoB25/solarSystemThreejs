import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {EntityCreator} from '../js/entityCreator.js';
import { GLTFLoader, RectAreaLightHelper } from 'three/examples/jsm/Addons.js';
import { SpaceshipController } from '../js/SpaceshipController.js';
import { mainTheme } from '../main.js';

export class SpaceshipScene{
    // constructor
  constructor(camera, orbitControls, loader, physicsContext, textureLoader, entityCreator){
        this. scene = new THREE.Scene();
        this.camera = camera;
        this.orbitControls = orbitControls;
        this.spaceshipController = null;
        this.loader = loader;
        this.physicsContext = physicsContext;
        this.textureLoader = textureLoader;

        this.entityCreator = entityCreator;

        // arrays for storing rigid bodies and animtion mixers
        this.bodies = [];
        this.fixedBodies = [];
        this.mixers = [];
        // arrays for colliders and animations
        this.planetTags = [];
        this.planetObjects = [];
        this.naturalSatellites = [];
        this.animationCallback = null;
        this.sun = null;
        // map of entites that have collison and collision flag
        this.colliderTags = new Map();
        this.isCreatingColliders = false;
        // onLoadProgress is a callback we get from main js
        this.onLoadProgress = null;
        this.loadedAssets = 0;
        this.totalAssests = 37;
        this.isLoaded = false;
        this.skybox = null;
    }
    // creating and returning the scene
    load(){
    const scene = this.scene;

// --- physics context for rapier physics ---
this.physicsContext.onReady((RAPIER, world, eventQueue) => {

    
    const asteroidPositions = [ { x: 8000, y: 1, z: 0 }, { x: 7000, y: 1, z: 0 }, { x: 7500, y: 1, z: 900 }];
    for(let i = 0; i < asteroidPositions.length; i++){
        const asteroidBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(asteroidPositions[i].x, asteroidPositions[i].y, asteroidPositions[i].z));
        world.createCollider(RAPIER.ColliderDesc.ball(80).setDensity(1000), asteroidBody);
        const asteroid = new THREE.Mesh(
                new THREE.SphereGeometry(80, 80, 80),
                new THREE.MeshStandardMaterial()
                );
        // static/uranus/titania.jpg
        asteroid.material.map = this.textureLoader.load('static/saturn/mimas.jpg');
        asteroid.material.map.colorSpace = THREE.SRGBColorSpace;
        asteroid.position.set(asteroidPositions[i].x, asteroidPositions[i].y, asteroidPositions[i].z);
        asteroid.name = 'asteroid' + i;
        console.log(asteroid.name)
        scene.add(asteroid);
        this.reportProgress();
        this.bodies.push({rigid: asteroidBody, mesh: asteroid});
    }

// Sun
    const sun = this.entityCreator.createSphereMesh('sun', 1800);
     // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xe1eb2d, 9000);
    if(!(svetloIzTacke in sun.children)){
            sun.add(svetloIzTacke);
        }
    const sunCenter = new THREE.Object3D();
    
    // reflektor - pravougaono svetlo za odgovarajucim dimenzijama
    const pravougaonoSvetlo = new THREE.RectAreaLight(0xe3ba05, 3, 5000, 5000);
    pravougaonoSvetlo.position.set(0, 3000, -4000);
    pravougaonoSvetlo.lookAt(0, 0, -4000);
    scene.add(pravougaonoSvetlo)
            
    //drugo svetlo
    const pravougaonoSvetlo2 = new THREE.RectAreaLight(0xf5d742, 3, 5000, 5000);
    pravougaonoSvetlo2.position.set(0, -3000, -4000);
    pravougaonoSvetlo2.lookAt(0, 0, -4000);
    scene.add(pravougaonoSvetlo2)

        
    sun.material.map = this.textureLoader.load('static/sun/material_diffuse.png');
    sun.material.map.colorSpace = THREE.SRGBColorSpace;

    sun.position.set(0, 0, -4000);
    sunCenter.position.set(sun.position.x, sun.position.y, sun.position.z);

    this.entityCreator.addBallColliderAndRigidBody(sun, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    this.reportProgress();
    scene.add(sun);

    this.sun = sun;
    
// Mercury
    const mercury = this.entityCreator.createSphereMesh('mercury', 170);

    mercury.material.map = this.textureLoader.load('static/mercury/mercurymap.jpg');
    this.reportProgress(); 
    mercury.material.bumpMap = this.textureLoader.load('static/mercury/mercurybump.jpg');
    this.reportProgress(); 
    mercury.material.map.colorSpace = THREE.SRGBColorSpace;

    mercury.position.set(3500, 0, -2500);

    this.entityCreator.addBallColliderAndRigidBody(mercury, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('mercury');
    this.planetObjects.push(mercury);
    scene.add(mercury);
    

// Venus
    const venus = this.entityCreator.createSphereMesh('venus', 220);

    venus.material.map = this.textureLoader.load('static/venus/venus.jpg');
    venus.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    venus.position.set(-500, 0, -7500);

    this.entityCreator.addBallColliderAndRigidBody(venus, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('venus');
    this.planetObjects.push(venus);
    scene.add(venus);
// Earth
    const earth = this.entityCreator.createSphereMesh('earth', 200);
    earth.material.map = this.textureLoader.load('static/earth/earth.jpg');
    earth.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    earth.position.set(-3500, 0, -1000);

    this.entityCreator.addBallColliderAndRigidBody(earth, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('earth');
    this.planetObjects.push(earth);
    scene.add(earth);

        const moon = this.entityCreator.createMoon(80, 400, 0.5, 0, earth, 'moon');
        moon.mesh.material.map = this.textureLoader.load('static/earth/moon.jpg');
        moon.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        this.naturalSatellites.push(moon);
    
// Mars
    const mars = this.entityCreator.createSphereMesh('mars', 160);
    mars.material.map = this.textureLoader.load('static/mars/mars.jpg');
    mars.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    mars.position.set(-4500, 0, -8000);
    console.log(mars.castShadow.valueOf())

    this.entityCreator.addBallColliderAndRigidBody(mars, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('mars');
    this.planetObjects.push(mars);
    scene.add(mars);

      //prvi mesec Marsa - Phobos
        const phobos = this.entityCreator.createMoon(70, 410, 0, -200, mars, 'phobos');
        phobos.mesh.material.map = this.textureLoader.load('static/mars/phobos.jpg');
        phobos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        //drugi mesec Marsa - Deimos
        const deimos = this.entityCreator.createMoon(60, -430, 0, 300, mars, 'deimos');
        deimos.mesh.material.map = this.textureLoader.load('static/mars/deimos.jpg');
        deimos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        this.naturalSatellites.push(phobos);
        this.naturalSatellites.push(deimos);
// Jupiter
    const jupiter = this.entityCreator.createSphereMesh('jupiter', 630);
    jupiter.material.map = this.textureLoader.load('static/jupiter/jup0vss1.jpg');
    jupiter.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    jupiter.position.set(8500, 0, -4000);

    this.entityCreator.addBallColliderAndRigidBody(jupiter, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('jupiter');
    this.planetObjects.push(jupiter);
    scene.add(jupiter);

    //četiri najveća meseca Jupitera
        //Ganymede
        const ganymede = this.entityCreator.createMoon(190, 1800, 0, 0, jupiter, 'ganymede');
        ganymede.mesh.material.map = this.textureLoader.load('static/jupiter/ganymede.jpg');
        ganymede.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        //Callisto
        const callisto = this.entityCreator.createMoon(170, -1600, 0.5, 500, jupiter,'callisto');
        callisto.mesh.material.map = this.textureLoader.load('static/jupiter/callisto.jpg');
        callisto.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        //Io
        const io = this.entityCreator.createMoon(100, -500, 1, 1400, jupiter, 'io');
        io.mesh.material.map = this.textureLoader.load('static/jupiter/io.jpg');
        io.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        //Europa
        const europa = this.entityCreator.createMoon(70, 900, -1, -1400, jupiter, 'europa');
        europa.mesh.material.map = this.textureLoader.load('static/jupiter/europa.jpg');
        europa.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        this.naturalSatellites.push(ganymede);
        this.naturalSatellites.push(callisto);
        this.naturalSatellites.push(io);
        this.naturalSatellites.push(europa);
    
// Saturn
    const saturn = this.entityCreator.createSphereMesh('saturn', 600);
    saturn.material.map = this.textureLoader.load('static/saturn/saturn.jpg');
    saturn.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    // saturns ring
    const ringGeometry = new THREE.RingGeometry(600, 1100, 30);
    const ringMaterial = new THREE.MeshStandardMaterial({side: THREE.DoubleSide});

    const ringOfSaturn = new THREE.Mesh(ringGeometry, ringMaterial);
    ringOfSaturn.rotation.x = Math.PI/2; // 90 stepeni u radijanima

    ringOfSaturn.material.map = this.textureLoader.load('static/saturn/saturnRing.png');
    ringOfSaturn.material.transparent = true;
    ringOfSaturn.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress();
    saturn.add(ringOfSaturn);

    saturn.position.set(5000, 0, 4500);

    this.entityCreator.addBallColliderAndRigidBody(saturn, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('saturn');
    this.planetObjects.push(saturn);
    scene.add(saturn);

     //meseci Saturna
        //Titan
        const titan = this.entityCreator.createMoon(170, -1600, 0.5, 300, saturn, 'titan');
        titan.mesh.material.map = this.textureLoader.load('static/saturn/titan.jpg');
        titan.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
        //Rhea
        const rhea = this.entityCreator.createMoon(60, -600, 0.5, 1500, saturn, 'rhea');
        rhea.mesh.material.map = this.textureLoader.load('static/saturn/rhea.jpg');
        rhea.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
        //Iapetus
        const iapetus = this.entityCreator.createMoon(60, 1600, 0.5, 200, saturn, 'iapetus');
        iapetus.mesh.material.map = this.textureLoader.load('static/saturn/iapetus.jpg');
        iapetus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
        //Dione
        const dione = this.entityCreator.createMoon(60, 200, 0, -1450, saturn, 'dione');
        dione.mesh.material.map = this.textureLoader.load('static/saturn/dione.jpg');
        dione.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
        //Tethys
        const tethys = this.entityCreator.createMoon(60, 1450, 0, -800, saturn, 'tethys');
        tethys.mesh.material.map = this.textureLoader.load('static/saturn/tethys.jpg');
        tethys.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
        //Enceladus
        const enceladus = this.entityCreator.createMoon(60, 1300, 0, 1100, saturn, 'enceladus');
        enceladus.mesh.material.map = this.textureLoader.load('static/saturn/enceladus.jpg');
        enceladus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
        //Mimas
        const mimas = this.entityCreator.createMoon(60, -2000, 0, -850, saturn, 'mimas');
        mimas.mesh.material.map = this.textureLoader.load('static/saturn/mimas.jpg');
        mimas.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 

        this.naturalSatellites.push(titan);
        this.naturalSatellites.push(rhea);
        this.naturalSatellites.push(iapetus);
        this.naturalSatellites.push(dione);
        this.naturalSatellites.push(tethys);
        this.naturalSatellites.push(enceladus);
        this.naturalSatellites.push(mimas);
    
// Uranus
    const uranus = this.entityCreator.createSphereMesh('uranus', 380);
    uranus.material.map = this.textureLoader.load('static/uranus/uranus.jpg');
    uranus.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    uranus.position.set(-9000, 0, 2000);

    this.entityCreator.addBallColliderAndRigidBody(uranus, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('uranus');
    this.planetObjects.push(uranus);
    scene.add(uranus);

      //meseci Uranusa
        //Titania
        const titania = this.entityCreator.createMoon(70, 800, 0, 50, uranus, 'titania');
        titania.mesh.material.map = this.textureLoader.load('static/uranus/titania.jpg');
        titania.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        //Umbriel
        const umbriel = this.entityCreator.createMoon(70, -850, 0, 50, uranus, 'umbriel');
        umbriel.mesh.material.map = this.textureLoader.load('static/uranus/umbriel.jpg');
        umbriel.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress(); 
    
        this.naturalSatellites.push(titania);
        this.naturalSatellites.push(umbriel);
    
// Neptune
    const neptune = this.entityCreator.createSphereMesh('neptune', 360);
    neptune.material.map = this.textureLoader.load('static/neptune/neptune.jpg');
    neptune.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    neptune.position.set(12500, 0, -9000);

    this.entityCreator.addBallColliderAndRigidBody(neptune, 'fixed', this.bodies, this.fixedBodies, this.colliderTags, RAPIER, world);
    // values added to this array must be the same as the ones in colliderTags
    this.planetTags.push('neptune');
    this.planetObjects.push(neptune);
    scene.add(neptune);

    //Triton - najveći mesec Neptuna
        const triton = this.entityCreator.createMoon(70, -600, 0, 50, neptune, 'triton');
        triton.mesh.material.map = this.textureLoader.load('static/neptune/triton.jpg');
        triton.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        this.reportProgress();
        this.naturalSatellites.push(triton);
// SKYBOX
       // Triangles: 3.8k Vertices: 1.9k
        this.loader.load('models/skybox/scene.gltf', gltf => {
            const skyboxModel = gltf.scene;
            skyboxModel.scale.set(20, 20, 20); // setting the scale of our model
            skyboxModel.position.set(0, 0, 0);
    
            skyboxModel.traverse((object) => {
                // names can be check in console when planeIntersects is active this scene
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

    // CREATING SPACESHIP
    // Triangles: 2.7 Vertices: 1.4k
    this.loader.load('models/spaceship_lowpoly/scene.gltf', gltf => {
        const model = gltf.scene;
        model.scale.set(20, 20, 20); // setting the scale of our model
        model.position.set(0, 0, 4000);
    
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
        let shipDesc = RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(model.position.x, model.position.y, model.position.z);
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
       /*  const helperGeo = new THREE.BoxGeometry(size.x, size.y, size.z);
        const helperMat = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const helper = new THREE.Mesh(helperGeo, helperMat);
        helper.position.set(model.position.x, model.position.y, model.position.z);
        scene.add(helper); */
        let helper;
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
            object.material.metalness = 0.6;
            object.material.roughness = 0.4;
        }
    });
    const actions = new Map(); // map of our animation actions

    const stationPos = { x: -1500, y: -150, z: 4000 };
    const animations = gltf.animations;
    const stationMixer = new THREE.AnimationMixer(stationModel);
    this.mixers.push(stationMixer);
    const animationLoop = stationMixer.clipAction(animations[0]);
    animationLoop.play();  
    
    stationModel.position.set(stationPos.x, stationPos.y, stationPos.z);
    scene.add(stationModel);
    stationModel.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(stationModel);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    box.getCenter(center);
    box.getSize(size);

    this.isCreatingColliders = true;
    let stationDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(center.x, center.y, center.z);
    let stationRigidBody = world.createRigidBody(stationDesc);

    let stationCollider = RAPIER.ColliderDesc.cuboid(size.x/2, size.y/2, size.z/2)
        .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS)
        .setActiveCollisionTypes(RAPIER.ActiveCollisionTypes.ALL);
    let stationColliderHandle = world.createCollider(stationCollider, stationRigidBody);
    this.colliderTags.set(stationColliderHandle.handle, 'station');

    /* const helper = new THREE.BoxHelper(stationModel, 0xff0000);
    scene.add(helper); */

    this.fixedBodies.push({rigid: stationRigidBody, mesh: stationModel});
    this.isCreatingColliders = false;
    this.reportProgress();
});
    // BLACK HOLE SUN
        // Triangles: 10.3k Vertices: 5.4k
        this.loader.load('models/black_hole/scene.gltf', gltf => {
            const blackHoleModel = gltf.scene;
            blackHoleModel.scale.set(200, 200, 200); // setting the scale of our model
            blackHoleModel.position.set(-12000, 0, -5000);
    
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
        
           /*  const helper = new THREE.BoxHelper(blackHoleModel, 0xff0000);
            scene.add(helper);
 */
            this.fixedBodies.push({rigid: blackHoleRigidBody, mesh: blackHoleModel});
            this.isCreatingColliders = false;
            this.reportProgress();
        });        
        
        this.animationCallback = this.animate(this.planetObjects, this.naturalSatellites, this.sun);
    });
        
    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xffffff, 9000);
    scene.add(svetloIzTacke);
    svetloIzTacke.position.y = 200;

    this.isLoaded = true;
    }
    update(world, delta, keysPressed) {
        let len = this.mixers.length;
        for(let i = 0; i < len; i++){
            this.mixers[i].update(delta);
        }
        if (this.spaceshipController) {
            this.spaceshipController.update(world, delta, keysPressed);
        }
       /*  if(mainTheme.paused){
            mainTheme.play();
        } */
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
    getAnimationCallback(){
        return this.animationCallback;
    }
     getPlanets(){
        return this.planetObjects;
    }
    getNaturalSatellites(){
        return this.naturalSatellites;
    }
    getSun(){
        return this.sun;
    }
    handleCollision(handle1, handle2, started){
        const tag1 = this.colliderTags.get(handle1);
        const tag2 = this.colliderTags.get(handle2);
        console.log('collision:', tag1, tag2, 'started:', started);

        let isPlanetCollision;

        let plLen = this.planetTags.length;

        for(let i = 0; i < plLen;i++){
            if(this.planetTags[i] == tag1 || this.planetTags[i] == tag2){
                isPlanetCollision = true;
            }
        }

        const isStationCollision = (tag1 === 'ship' && tag2 === 'station') || (tag1 === 'station' && tag2 === 'ship');
        const isBlackHoleCollision = (tag1 === 'ship' && tag2 === 'blackHole') || (tag1 === 'blackHole' && tag2 === 'ship');

        if(isStationCollision || isPlanetCollision){
            if(started){
                this.spaceshipController.onCollisionStart(tag1, tag2);
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
        for (let i = 0; i < numColliders; i++) {
        const collider =  rigidBody.collider(i);
            collider.setEnabled(enabled);
            }
    }
    disablePhysics(world) {
        let bodyLen = this.bodies.length;
        for(let i = 0; i > bodyLen; i++){
            this.setColliderEnabled(this.bodies[i].rigid, false);
        }
        let fixedBodyLen = this.fixedBodies.length;
        for(let j = 0; j > fixedBodyLen; j++){
            this.setColliderEnabled(this.fixedBodies[j].rigid, false);
        }
   
        // not in bodies so must be done manually
        if (this.characterController && this.characterController.rigidBody) {
            this.setColliderEnabled(this.characterController.rigidBody, false);
            }
        if(world)world.gravity = { x: 0.0, y: -9.81, z: 0.0 };
    }
    enablePhysics(world) {
        let bodyLen = this.bodies.length;
        for(let i = 0; i > bodyLen; i++){
            this.setColliderEnabled(this.bodies[i].rigid, true);
        }
        let fixedBodyLen = this.fixedBodies.length;
        for(let j = 0; j > fixedBodyLen; j++){
            this.setColliderEnabled(this.fixedBodies[j].rigid, true);
        }
  
        if (this.spaceshipController && this.spaceshipController.rigidBody) {
            this.setColliderEnabled(this.spaceshipController.rigidBody, true);
            }
        if(world)world.gravity = { x: 0.0, y: 0.0, z: 0.0 };
    }
    animate(planetGroup, naturalSatellites, sun) {
    // the sun is a seperate object from the group so we call its rotation seperately
    
    if(planetGroup){
        let len = planetGroup.length;
        for(let i = 0; i < len; i++){
            switch(planetGroup[i].name){
            case 'mercury':
                //c.rotateY(0.006);
                planetGroup[i].rotateY(0.001);
            break
            case 'venus':
                //c.object.rotateY(0.003);
                planetGroup[i].rotateY(0.001);
            break
            case 'earth':
                //c.object.rotateY(0.0019);
                planetGroup[i].rotateY(0.002);
            break
            case 'mars':
                //c.object.rotateY(0.0013);
                planetGroup[i].rotateY(0.001);
            break
            case 'jupiter':
                //c.object.rotateY(0.0022);
                planetGroup[i].rotateY(0.003);
            break
            case 'saturn':
                //c.object.rotateY(0.002);
                planetGroup[i].rotateY(0.0025);
            break
            case 'uranus':
                //c.object.rotateY(0.0015);
                planetGroup[i].rotateY(0.001);
            break
            case 'neptune':
                //c.object.rotateY(0.001);
                planetGroup[i].rotateY(0.0013);
            break            
        }
        }
       
    }
        if(naturalSatellites){
            let len = naturalSatellites.length
            for(let i = 0; i < len; i++){
                naturalSatellites[i].mesh.rotateY(0.002);
            }
        }
        sun.rotateY(0.002);
    if(this.skybox){
        this.skybox.rotateY(0.0005);
    }
        
};
}
