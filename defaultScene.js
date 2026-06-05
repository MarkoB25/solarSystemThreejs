import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader, GLTFLoader, MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';
import { CharacterController } from './CharacterController';

export class DefaultScene{
    constructor(scene = THREE.Scene(), 
                camera = THREE.PerspectiveCamera(),
                orbitControls = OrbitControls()
            )
                    {
                        this.scene = scene;
                        this.camera = camera;
                        this.orbitControls = orbitControls;
                      //  this.characterController;
                    }
    getScene(){
    const scene = this.scene;
    let characterController = this.characterController;
    
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
    svetloIzTacke.position.y = 100;
   
    return scene;
    }
    getChildren(){
        return scene.children;
    }



//const spaceStation = await objectLoader.loadAsync('models/space_station/Space Station Scene.obj');
}