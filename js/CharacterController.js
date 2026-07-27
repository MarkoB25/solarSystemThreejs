import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class CharacterController{

    // temporary data
    walkDirection = new THREE.Vector3(0, 0, 0);
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuaterion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();
    storedFall = 0;
    
    // constants
    fadeDuration = 0.2;
    walkVelocity = 300;
    runVelocity = 600;

    // constructor
    constructor(
            model = THREE.Group,
            mixer = THREE.AnimationMixer,
            animationActions = new Map(),
            orbitControlls,
            camera = THREE.Camera,
            currentAction,
            ray,
            rigidBody
        ){
                this.model = model;
                this.mixer = mixer;
                this.animationActions = animationActions;
                this.orbitControlls = orbitControlls;
                this.camera = camera;
                this.currentAction = currentAction;
                this.toggleRun = false;
                this.toggleWalk = false;
                animationActions.forEach((value, key) => {
                    if(key == this.currentAction){
                        value.play();
                    }
                });
                this.ray = ray;
                this.rigidBody = rigidBody;
    }
    // update animations and position
    update(world, delta, keysPressed){
        let play = '';
        // animations toggle
        if(this.toggleWalk && this.toggleRun){
            play = 'run';
        }else if(this.toggleWalk){
            play = 'walk';
        }else {
            play = 'idle';
        }
        // animaton transition
        if(this.currentAction != play){
            const toPlay = this.animationActions.get(play);
            const current = this.animationActions.get(this.currentAction);

            if(current)current.fadeOut(this.fadeDuration);
            if(toPlay)toPlay.reset().fadeIn(this.fadeDuration).play();

            this.currentAction = play;
        }

        // update movement direction and position if walking or running
        if(this.currentAction == 'walk' || this.currentAction == 'run'){
            let angleYCameraDirection = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)
            );
            // diagonal movement angle offset
            let directionOffset = 0 // w
                if(keysPressed.includes('w')){
                    if(keysPressed.includes('w') && keysPressed.includes('a')){
                        directionOffset = Math.PI / 4;
                    }else if(keysPressed.includes('w') && keysPressed.includes('d'))
                        directionOffset = -Math.PI / 4;
                        else directionOffset = 0;
                }else if(keysPressed.includes('s')){
                    if(keysPressed.includes('s') && keysPressed.includes('a'))
                        directionOffset = Math.PI / 4 + Math.PI / 2;
                    else if(keysPressed.includes('s') && keysPressed.includes('d')){
                        directionOffset = -Math.PI / 4 - Math.PI / 2;
                    }else {
                        directionOffset = Math.PI;
                    }
                }else if(keysPressed.includes('a')){
                    directionOffset = Math.PI / 2
                }else if(keysPressed.includes('d')){
                    directionOffset = -Math.PI / 2
                }        

            // rotate character
            this.rotateQuaterion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
            this.model.quaternion.rotateTowards(this.rotateQuaterion, 0.2);
            // calculate direction
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
            // run/walk velocity
            const velocity = this.currentAction == 'run' ? this.runVelocity : this.walkVelocity;

            let translation = this.rigidBody.translation();
           // console.log(translation);
           
            if(translation.y < -1){
                this.rigidBody.setNextKinematicTranslation({
                    x: 0,
                    y: 10,
                    z: 0
                });
            }else{
                /* 
                let cameraPositionOffset = this.camera.position.sub(this.model.position);
                
                //this.walkDirection.y += this.lerp(this.storedFall, -9.81 * delta, 0.10);
                //this.storedFall = this.walkDirection.y;

                this.updateCameraTarget(cameraPositionOffset); */
                this.ray.origin.x = translation.x;
                this.ray.origin.y = translation.y;
                this.ray.origin.z = translation.z;

                let hit = world.castRay(this.ray, 0.5, true, 0xfffffffff);
                if (hit) {
                    const point = this.ray.pointAt(hit.toi);
                    let diff = translation.y - ( point.y + 0.28);
                    if (diff < 0.0) {
                        this.storedFall = 0;
                        this.walkDirection.y = this.lerp(0, Math.abs(diff), 0.5);
                    }
                }
            }

            let cameraPositionOffset = this.camera.position.sub(this.model.position);
    
            this.walkDirection.x = this.walkDirection.x * velocity * delta;
            this.walkDirection.z = this.walkDirection.z * velocity * delta;

            this.rigidBody.setNextKinematicTranslation({
                x: translation.x + this.walkDirection.x,
                y: translation.y + this.walkDirection.y,
                z: translation.z + this.walkDirection.z
            })                
            this.model.position.set(translation.x, translation.y, translation.z);
            this.updateCameraTarget(cameraPositionOffset);
                
            // move model & camera
          /*   const moveX = this.walkDirection.x * velocity * delta;
            const moveZ = this.walkDirection.z * velocity * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
            this.updateCameraTarget(moveX, moveZ); */
        }
    }
 


    updateCameraTarget(offset){
        // move camera
        let rigidTranslation = this.rigidBody.translation();
        // update camera target
        this.camera.position.x = rigidTranslation.x + offset.x;
        this.camera.position.y = rigidTranslation.y + offset.y;
        this.camera.position.z = rigidTranslation.z + offset.z;
        this.orbitControlls.target = this.cameraTarget;

        this.cameraTarget.x = rigidTranslation.x
        this.cameraTarget.y = rigidTranslation.y + 1
        this.cameraTarget.z = rigidTranslation.z
        this.orbitControlls.target = this.cameraTarget
    }
    lerp(x, y, a){
        let result =  x * (1 - a) + y * a;
        return result

    };
}