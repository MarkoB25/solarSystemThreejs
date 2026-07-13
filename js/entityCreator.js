import * as THREE from 'three';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export class EntityCreator{
    createPlanet(size, positionX, labelName){
        const geometry = new THREE.SphereGeometry(size, 40, 40);
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        const object = new THREE.Object3D();
        mesh.name = labelName;
        
        object.add(mesh);
        //scene.add(object);
        mesh.position.x = positionX;

    return { object, mesh , labelName};
};
    createMoon(size, positionX, positionY, positionZ, parentObject, labelName){
        const geometry = new THREE.SphereGeometry(size, 40, 40);
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry, material);
        const object = new THREE.Object3D();
        mesh.name = labelName;

        object.add(mesh);
        //scene.add(object);
        parentObject.add(object);
        mesh.position.x = positionX;
        mesh.position.y = positionY;
        mesh.position.z = positionZ;

    return { object, mesh };
};
}
   

