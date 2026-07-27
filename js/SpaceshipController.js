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
            ray,
            rigidBody,
            helper
        ){
                this.model = model;
                this.orbitControlls = orbitControlls;
                this.camera = camera;
                this.currentAction = currentAction;
                this.toggleMove = false;
                this.toggleBoost = false;
                this.ray = ray;
                this.rigidBody = rigidBody;
                this.helper = helper;
                this.isColliding = false;
                this.lastSafePosition = {x: 0, y: 0, z: 0};
    }
      // update animations and position
    update(world, delta, keysPressed){
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
            this.rotateQuaterion.setFromAxisAngle(this.rotateAngle, angleYCameraDirection + directionOffset);
            this.model.quaternion.rotateTowards(this.rotateQuaterion, 0.2);
            // calculate direction
            this.camera.getWorldDirection(this.walkDirection);
            this.walkDirection.y = 0;
            this.walkDirection.normalize();
            this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);
            // run/walk velocity
            const velocity = this.currentAction == 'boost' ? this.boostVelocity : this.baseVelocity;   
            
            let translation = this.rigidBody.translation();

            if(translation.y < -1){
                this.rigidBody.setNextKinematicTranslation({
                    x: 0,
                    y: 10,
                    z: 0
                });
            }else{
                this.ray.origin.x = translation.x;
                this.ray.origin.y = translation.y;
                this.ray.origin.z = translation.z;

                let hit = world.castRay(this.ray, 0.5, true, 0xfffffffff);
                if (hit) {
                    const point = this.ray.pointAt(hit.toi);
                    let diff = translation.y - ( point.y + 0.28);
                    if (diff < 0.0) {
                        //this.storedFall = 0;
                        this.walkDirection.y = this.lerp(0, Math.abs(diff), 0.5);
                    }
                }
            }

            let cameraPositionOffset = this.camera.position.sub(this.model.position);

            this.walkDirection.x = this.walkDirection.x * velocity * delta;
            this.walkDirection.z = this.walkDirection.z * velocity * delta;

            const desiredPosition = {
                x: translation.x + this.walkDirection.x,
                y: translation.y + this.walkDirection.y,
                z: translation.z + this.walkDirection.z
            };                
            
           /*  console.log('position:' ,this.model.position);
            console.log('translation:', this.rigidBody.translation()) */;
            
            let finalPosition;

            if (this.isColliding) {
            // ne dozvoli dalje pomeranje u pravcu sudara
            // najjednostavnije: vrati na poslednju bezbednu poziciju
            this.rigidBody.setNextKinematicTranslation(this.lastSafePosition);
            this.model.position.set(this.lastSafePosition.x, this.lastSafePosition.y, this.lastSafePosition.z);
            this.helper.position.set(this.lastSafePosition.x, this.lastSafePosition.y, this.lastSafePosition.z);
            this.helper.quaternion.copy(this.model.quaternion);
            finalPosition = this.lastSafePosition;
        } else {
            this.rigidBody.setNextKinematicTranslation(desiredPosition);
            this.model.position.set(desiredPosition.x, desiredPosition.y, desiredPosition.z);
            this.helper.position.set(desiredPosition.x, desiredPosition.y, desiredPosition.z);
            this.helper.quaternion.copy(this.model.quaternion);
            this.lastSafePosition = { x: desiredPosition.x, y: desiredPosition.y, z: desiredPosition.z}; // čuvaj kao bezbednu
            finalPosition = desiredPosition;
            } 
            this.updateCameraTarget(cameraPositionOffset, finalPosition);
        }
        
    }

    updateCameraTarget(offset, rigidTranslation){
        // move camera
        //let rigidTranslation = this.rigidBody.translation();
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
    onCollisionStart() {
        this.isColliding = true;
        console.log('COLLISION START');
    }

    onCollisionEnd() {
        this.isColliding = false;
        console.log('COLLISION END');
    }
}