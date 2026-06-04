import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

export class CharacterController{
    constructor(model = THREE.Group,
            mixer = THREE.AnimationMixer,
            animationActions,
            orbitControlls,
            camera = THREE.Camera){

                this.model = model;
                this.mixer = mixer;
                this.animationActions = animationActions;
                this.orbitControlls = orbitControlls;
                this.camera = camera;
                this.currentAction = "idle";
                this.toggleRun = false;
                animationActions.forEach((key, value) => {
                    if(key == this.currentAction){
                        value.play();
                    }
                });
    }

    switchToggleRun(){
        this.toggleRun = !this.toggleRun;
    }

    update(delta, keysPressed){

    }
}