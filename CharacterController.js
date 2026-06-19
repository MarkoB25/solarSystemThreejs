import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class CharacterController{

    // temporary data
    walkDirection = new THREE.Vector3();
    rotateAngle = new THREE.Vector3(0, 1, 0);
    rotateQuaterion = new THREE.Quaternion();
    cameraTarget = new THREE.Vector3();

    // constants
    fadeDuration = 0.2;
    walkVelocity = 5;
    runVelocity = 2;

    constructor(model = THREE.Group,
            mixer = THREE.AnimationMixer,
            animationActions = new Map(),
            orbitControlls,
            camera = THREE.Camera,
            currentAction
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
    }

    switchToggleRun(){
        this.toggleRun = !this.toggleRun;
    }

    update(delta, keysPressed){
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
        this.mixer.update(delta);

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

            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

            let velocity = this.currentAction == 'run' ? this.runVelocity : this.walkVelocity;

            let moveX = this.walkDirection.x * velocity * delta;
            let moveZ = this.walkDirection.z * velocity * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
            console.log(this.model.position.x);
        }
    }
}