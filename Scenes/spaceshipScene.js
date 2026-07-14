import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {EntityCreator} from '../js/entityCreator.js';
import { FBXLoader, GLTFLoader, MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';
import { SpaceshipController } from '../js/SpaceshipController.js';

export class SpaceshipScene{
    // constructor
  constructor(
                camera = THREE.PerspectiveCamera(),
                orbitControls = OrbitControls()
            ){
        this. scene = new THREE.Scene();
        this.camera = camera;
        this.orbitControls = orbitControls;
        this.textureLoader = new THREE.TextureLoader();
        this.entityCreator = new EntityCreator();
        this.spaceshipController = null;
    }
    // creating and returning the scene
    getScene(){
    const scene = this.scene;
    
    let controller;
   
    const mercury = this.entityCreator.createPlanet(20, 30, 'Mercury');
    
        mercury.mesh.material.map = this.textureLoader.load('static/mercury/mercurymap.jpg');
        mercury.mesh.material.bumpMap = this.textureLoader.load('static/mercury/mercurybump.jpg');
        mercury.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
        mercury.object.position.x = -500;

    scene.add(mercury.object);


 const floorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(2000, 5, 2000),
        new THREE.MeshStandardMaterial({ color: 0x888888 })
        )
        floorMesh.position.y = -1000;
        scene.add(floorMesh);  
    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xffffff, 9000);
    scene.add(svetloIzTacke);
    svetloIzTacke.position.y = 200;

    //scene.fog = new THREE.Fog(0xfff9e8, 2.7, 4 );
    return scene;
    }

    getSpaceshipController(){
        return this.spaceshipController;
    }
}