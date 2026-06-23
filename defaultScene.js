import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader, GLTFLoader, MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';

export class DefaultScene{
    // constructor
    constructor(
                scene = THREE.Scene(), 
                camera = THREE.PerspectiveCamera(),
                orbitControls = OrbitControls()
            )
                    {
                        this.scene = scene;
                        this.camera = camera;
                        this.orbitControls = orbitControls;
                    }
    // creating and returning the scene
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
   
 /*    const loader = new GLTFLoader();
    loader.load('models/towerBasic.glb', gltf =>{
        const model = gltf.scene;
        model.scale.set(70, 70, 70); // setting the scale of our model

        model.traverse((object) => {
            if( object.isMesh ){
                object.castShadow = true;
                object.material.metalness = 0;
            }
        });
        model.position.set(-500, 0, 0);
        scene.add(model);
    }); */

    // physics engine
     import('@dimforge/rapier3d').then(RAPIER => {
            // Use the RAPIER module here.
            let gravity = { x: 0.0, y: -9.81, z: 0.0 };
            let world = new RAPIER.World(gravity);
    
            // --- Floor (static) ---
            const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
            world.createCollider(RAPIER.ColliderDesc.cuboid(100, 0.5, 100), floorBody)
    
            const floorMesh = new THREE.Mesh(
            new THREE.BoxGeometry(2000, 1, 2000),
            new THREE.MeshStandardMaterial({ color: 0x888888 })
            )
            floorMesh.position.set(0, -1, 0)
            scene.add(floorMesh)
    
            // --- Box (dynamic, falls with gravity) ---
            const boxBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 50, 0))
            world.createCollider(RAPIER.ColliderDesc.cuboid(15, 15, 15), boxBody)
    
            const boxMesh = new THREE.Mesh(
            new THREE.BoxGeometry(30, 30, 30),
            new THREE.MeshStandardMaterial({ color: 0xff4444 })
            )
            scene.add(boxMesh)
    
            let bodies = [];
    
            let gameLoop = () => {
            // Step the simulation forward.  
            world.step();
    
            bodies.forEach(body => {
                let position = body.rigidBody.translation();
                let rotation = body.rigidBody.rotation();
    
                body.threeMesh.position.x = position.x;
                body.threeMesh.position.y = position.y;
                body.threeMesh.position.z = position.z;
    
                body.threeMesh.setRotationFromQuaternion(
                    new THREE.Quaternion(
                        rotation.x,
                        rotation.y,
                        rotation.z,
                        rotation.w
                    )
                )
            });
            const pos = boxBody.translation()
            const rot = boxBody.rotation()
    
            boxMesh.position.set(pos.x, pos.y, pos.z)
            boxMesh.quaternion.set(rot.x, rot.y, rot.z, rot.w)
            setTimeout(gameLoop, 16);
           /*  let position = rigidBody1.translation();
            console.log("Rigid-body position: ", position.x, position.y); */
                };
    
            gameLoop();
    
        });
  
/* const manager = new THREE.LoadingManager();
const mtlLoader = new MTLLoader(manager);
const objectLoader = new OBJLoader();
const materials = mtlLoader.load('models/space_station/Space Station Scene.mtl', (o) => {
    objectLoader.setMaterials(o);
});
objectLoader.load('models/space_station/Space Station Scene.obj', function (object){
    object.scale.set(30, 30, 30);
    scene.add(object);
});  */
    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xffffff, 9000);
    scene.add(svetloIzTacke);
    svetloIzTacke.position.y = 200;
   
    return scene;
    }
    getChildren(){
        return scene.children;
    }

//const spaceStation = await objectLoader.loadAsync('models/space_station/Space Station Scene.obj');
}