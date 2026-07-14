import * as THREE from 'three';

export class SpaceshipController{
     // temporary data
        walkDirection = new THREE.Vector3(0, 0, 0);
        rotateAngle = new THREE.Vector3(0, 1, 0);
        rotateQuaterion = new THREE.Quaternion();
        cameraTarget = new THREE.Vector3();
        // constants
        fadeDuration = 0.2;
        baseVelocity = 2000;
        boostVelocity = 5000;
 // constructor
    constructor(
            model = THREE.Group,
            orbitControlls,
            camera = THREE.Camera,
            currentAction,
           // ray,
            rigidBody
        ){
                this.model = model;
                this.orbitControlls = orbitControlls;
                this.camera = camera;
                this.currentAction = currentAction;
                this.toggleMove = false;
                this.toggleBoost = false;
                //this.ray = ray;
                this.rigidBody = rigidBody;
    }
      // update animations and position
    async update(delta, keysPressed){
        let play = '';
        // animations toggle
        if(this.toggleBoost && this.toggleMove){
            play = 'boost';
            this.currentAction = play;
        }else if(this.toggleMove){
            play = 'move';
            this.currentAction = play;
        }else {
            play = 'idle';
            this.currentAction = play;
        }
        // update movement direction and position if walking or running
        if(this.currentAction == 'move' || this.currentAction == 'boost'){
            let angleYCameraDirection = Math.atan2(
                (this.camera.position.x - this.model.position.x),
                (this.camera.position.z - this.model.position.z)
            );
            // diagonal movement angle offset
          
            let directionOffset = 0; // w
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
            this.rotateQuaterion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset + Math.PI/2);
            this.model.quaternion.rotateTowards(this.rotateQuaterion, 0.2);
            // calculate direction
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
            // run/walk velocity
            const velocity = this.currentAction == 'boost' ? this.boostVelocity : this.baseVelocity;      

            this.walkDirection.x = this.walkDirection.x * velocity * delta;
            this.walkDirection.z = this.walkDirection.z * velocity * delta;

           // console.log(this.rigidBody);

            let cameraPositionOffset = this.camera.position.sub(this.model.position);

            let translation = this.rigidBody.translation();
            
            this.rigidBody.setNextKinematicTranslation({
                x: translation.x + this.walkDirection.x,
                y: translation.y + this.walkDirection.y,
                z: translation.z + this.walkDirection.z
            });                
            this.model.position.set(translation.x, translation.y, translation.z);
            this.updateCameraTarget(cameraPositionOffset);    
            // move model & camera
          /*   const moveX = this.walkDirection.x * velocity * delta;
            const moveZ = this.walkDirection.z * velocity * delta;
            this.model.position.x += moveX;
            this.model.position.z += moveZ;
            this.updateCameraTarget(moveX, moveZ); */
          /*   console.log( this.model.position);
            console.log(this.rigidBody.translation()); */
        }
        //console.log(this.model.position);
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