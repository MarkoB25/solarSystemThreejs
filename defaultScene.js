import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader, GLTFLoader, MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';

export class DefaultScene{
    constructor(scene = new THREE.Scene(), 
                camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000))
                    {
                        this.scene = scene;
                        this.camera = camera;
                    }
    getScene(){
    const scene = this.scene;
    const wallGeometry = new THREE.PlaneGeometry( 30, 30, 30, 30 );
    const wallMaterial = new THREE.MeshBasicMaterial( { color: 0xffff00, side: THREE.DoubleSide } );
    const wall = new THREE.Mesh( wallGeometry, wallMaterial );
    wall.position.y = 25;
    wall.name = 'firstWall';
    scene.add( wall );
    
   
    const wallGeometry2 = new THREE.PlaneGeometry( 30, 30, 30, 30 );
    const wallMaterial2 = new THREE.MeshBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide } );
    const wall2 = new THREE.Mesh( wallGeometry2, wallMaterial2 );
    wall2.position.x = 50;
    wall2.position.y = 50;
    wall2.name = 'secondWall';
    scene.add( wall2 );
   
    const floorGeometry = new THREE.BoxGeometry( 1000, 5, 1000 );
    const floorMaterial = new THREE.MeshStandardMaterial( { color: 0xFFFFFF } );
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.name = 'floor';
    floor.receiveShadow = true;
    floor.position.y = - 0.25;
    floor.userData.physics = { mass: 0 };
    scene.add( floor );

    const loader = new GLTFLoader();
    loader.load('models/Soldier.glb', (gltf) => {

        const model = gltf.scene;
        model.scale.set(100, 100, 100);

        model.traverse((object) => {
            if( object.isMesh )object.castShadow = true;
        });
        
       // debugger
        console.log(scene);
        console.log(model);
        console.log(new THREE.Box3().setFromObject(gltf.scene));
        
        scene.add(model);
        const animations = gltf.animations;
        const mixer = new THREE.AnimationMixer(model);

        const idleAction = mixer.clipAction(animations[0]);
        const walkAction = mixer.clipAction(animations[3]);
        const runAction = mixer.clipAction(animations[1]);

        const actions = [idleAction, walkAction, runAction]; 
        console.log("Something in the way");
    });


    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xe1eb2d, 9000);
    scene.add(svetloIzTacke);

    // reflektor - pravougaono svetlo za odgovarajucim dimenzijama
    const pravougaonoSvetlo = new THREE.RectAreaLight(0xe3ba05, 2, 30, 30);
    pravougaonoSvetlo.position.set(0, 20, 0);
    scene.add(pravougaonoSvetlo);
    pravougaonoSvetlo.lookAt(0, 0, 0);  

    //drugo svetlo
    const pravougaonoSvetlo2 = new THREE.RectAreaLight(0xe3ba05, 2, 30, 30);
    pravougaonoSvetlo2.position.set(0, -20, 0);
    scene.add(pravougaonoSvetlo2);
    pravougaonoSvetlo2.lookAt(0, 0, 0);
   
    return scene;
    }
    getChildren(){
        return scene.children;
    }


/* const manager = new THREE.LoadingManager();
const mtlLoader = new MTLLoader(manager);
const materials = await mtlLoader.loadAsync('models/space_station/Space Station Scene.mtl');
const objectLoader = new OBJLoader();
objectLoader.setMaterials(materials);
objectLoader.load('models/space_station/Space Station Scene.obj', function (object){
scene.add(object);
}); */
//const spaceStation = await objectLoader.loadAsync('models/space_station/Space Station Scene.obj');
}