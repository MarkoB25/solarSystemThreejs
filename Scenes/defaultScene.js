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