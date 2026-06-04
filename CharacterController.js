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
        
            if(keysPressed && this.toggleRun){
                play = 'run';
            }else if(keysPressed){
                play = 'walk';
            }else {
                play = 'idle';
            }
        if(this.currentAction != play){
            const toPlay = this.animationActions.get(play);
            const current = this.animationActions.get(this.currentAction);

            if(current)current.fadeOut(this.fadeDuration);
            if(toPlay)toPlay.reset().fadeIn(this.fadeDuration).play();

            this.currentAction = play;
        }
 
        this.mixer.update(delta);
      
    }
}