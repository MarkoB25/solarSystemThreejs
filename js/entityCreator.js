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
    createMoon(radius, positionX, positionY, positionZ, parentObject, labelName){
        const geometry = new THREE.SphereGeometry(radius, 40, 40);
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
    addBallColliderAndRigidBody(mesh, bodyType, bodies, fixedBodies,colliderTags, RAPIER, world){
        if(!mesh.isMesh)return
        let pos = { x: mesh.position.x,  y: mesh.position.y, z: mesh.position.z};
        let bodyDesc;
        let rigidBody;
        let collider;
        let colliderHandle;
        if(bodyType == 'dynamic'){
            bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(pos.x, pos.y, pos.z);
            rigidBody = world.createRigidBody(bodyDesc);
            
            let radius = mesh.geometry.parameters.radius;
            collider = RAPIER.ColliderDesc.ball(radius).setDensity(10)
            colliderHandle = world.createCollider(collider, rigidBody);

            bodies.push({ rigid: rigidBody, mesh: mesh });
            console.log('dynamic work')
        }else if( bodyType == 'fixed'){
            bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(pos.x, pos.y, pos.z);
            rigidBody = world.createRigidBody(bodyDesc);
            
            let radius = mesh.geometry.parameters.radius;
            collider = RAPIER.ColliderDesc.ball(radius).setDensity(10)
            colliderHandle = world.createCollider(collider, rigidBody);

            fixedBodies.push({ rigid: rigidBody, mesh: mesh });
           // console.log('fixed work')
        }else{
            console.log('not work')
            return
        }
        colliderTags.set(colliderHandle.handle, mesh.name);
        //console.log(mesh.name)
    }
    createSphereMesh(name, radius){
        const geometry = new THREE.SphereGeometry(radius, 50, 50);
        const material = new THREE.MeshStandardMaterial();
        const mesh = new THREE.Mesh(geometry , material);
        mesh.name = name;

        return mesh;
        
    }
}
   

