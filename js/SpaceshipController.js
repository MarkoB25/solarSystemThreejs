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
                this.isCollidingFixed = false;
                this.IsCollidingTeleport = false;
                this.collisionTag1 = '';
                this.collisionTag2 = '';
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

            let cameraPositionOffset = this.camera.position.sub(this.model.position);

            this.walkDirection.x = this.walkDirection.x * velocity * delta;
            this.walkDirection.z = this.walkDirection.z * velocity * delta;

            const desiredPosition = {
                x: translation.x + this.walkDirection.x,
                y: translation.y + this.walkDirection.y,
                z: translation.z + this.walkDirection.z
            };                

            let finalPosition;
        
            if (this.isCollidingFixed) {
                if(this.collisionTag1 == 'station' || this.collisionTag2 == 'station'){
                     const stationPos = {  x: -1500, y: -150, z: 4000  }; // ista pozicija kao station

                const currentDist = Math.sqrt(
                    (translation.x - stationPos.x) ** 2 +
                    (translation.y - stationPos.y) ** 2 +
                    (translation.z - stationPos.z) ** 2
                );
                const desiredDist = Math.sqrt(
                    (desiredPosition.x - stationPos.x) ** 2 +
                    (desiredPosition.y - stationPos.y) ** 2 +
                    (desiredPosition.z - stationPos.z) ** 2
                );

                if (desiredDist > currentDist) {
                    // igrač se udaljava od stanice — dozvoli
                    finalPosition = desiredPosition;
                    } else {
                        // igrač i dalje gura ka stanici — blokiraj
                        finalPosition = { x: translation.x, y: translation.y, z: translation.z };
                    }
                }else if(this.collisionTag1 == 'mercury' || this.collisionTag2 == 'mercury'){
                        finalPosition = desiredPosition;
                        console.log('mercury')
                       
                }else if(this.collisionTag1 == 'venus' || this.collisionTag2 == 'venus'){
                        finalPosition = desiredPosition;
                        console.log('venus')
                       
                }else if(this.collisionTag1 == 'earth' || this.collisionTag2 == 'earth'){
                        finalPosition = desiredPosition;
                        console.log('earth')
                       
                }else if(this.collisionTag1 == 'mars' || this.collisionTag2 == 'mars'){
                        finalPosition = desiredPosition;
                        console.log('mars')
                }else if(this.collisionTag1 == 'jupiter' || this.collisionTag2 == 'jupiter'){
                        finalPosition = desiredPosition;
                        console.log('jupiter')
                }else if(this.collisionTag1 == 'saturn' || this.collisionTag2 == 'saturn'){
                        finalPosition = desiredPosition;
                        console.log('saturn')
                }else if(this.collisionTag1 == 'uranus' || this.collisionTag2 == 'uranus'){
                        finalPosition = desiredPosition;
                        console.log('uranus')
                }else if(this.collisionTag1 == 'neptune' || this.collisionTag2 == 'neptune'){
                        finalPosition = desiredPosition;
                        console.log('neptune')
                }
                } else {
                    finalPosition = desiredPosition;
                }
            if(this.IsCollidingTeleport){
                
                const newPosition = { x: 10000, y: 0, z: 1000 }; 
                
                this.rigidBody.setNextKinematicTranslation(newPosition);
                this.model.position.set(newPosition.x, newPosition.y, newPosition.z);
                if(this.helper)this.helper.position.set(newPosition.x, newPosition.y, newPosition.z);
                let cameraPositionOffset = this.camera.position.sub(this.model.position);
                this.updateCameraTarget(cameraPositionOffset, newPosition);
                return;
            }

               // console.log(this.model.position)
                
                this.rigidBody.setNextKinematicTranslation(finalPosition);
                this.model.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
                 if(this.helper)this.helper.position.set(finalPosition.x, finalPosition.y, finalPosition.z);
                
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
    onCollisionStart(tag1, tag2) {
        this.isCollidingFixed = true;
        this.collisionTag1 = tag1;
        this.collisionTag2 = tag2;
        console.log('COLLISION START');
    }

    onCollisionEnd() {
        this.isCollidingFixed = false;
        this.collisionTag1 = '';
        this.collisionTag2 = '';
        console.log('COLLISION END');
    }
    onCollisionStartTeleport() {
        this.IsCollidingTeleport = true;
        console.log('COLLISION START SHOULD TELEPORT');
    }

    onCollisionEndTeleport() {
        this.IsCollidingTeleport = false;
        console.log('COLLISION END TELEPORTED');
    }
}