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
                this.fixedCollisions = [];

                this.isCollidingDoor = false;
                this.isCollidingRightWall = false;
                this.isCollidingLeftWall = false;
                this.isCollidingFrontWall = false;
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

            let cameraPositionOffset = this.camera.position.sub(this.model.position);
    
            this.walkDirection.x = this.walkDirection.x * velocity * delta;
            this.walkDirection.z = this.walkDirection.z * velocity * delta;

            const desiredPosition = {
                x: translation.x + this.walkDirection.x,
                y: translation.y + this.walkDirection.y,
                z: translation.z + this.walkDirection.z
            };
            
            let finalPosition;
            let shapeVel = { x: 0.1, y: 0.4, z: 1.0 };

            if (this.isCollidingDoor) {
                const doorPos = {x: 0, y: 1, z: -900};
               

                finalPosition = this.handleFixedCollision(finalPosition, desiredPosition, translation, doorPos);
                console.log('door col')
            } else if(this.isCollidingRightWall){
               const rightWallPos =  { x: 900, y: 1, z: 0 };
                let size = {x: 80, y: 395, z: 1755};
               finalPosition = this.handleWallCollision(finalPosition, desiredPosition, translation, rightWallPos, size);
               
            }else if(this.isCollidingLeftWall){
                const leftWallPos = {x: -900, y: 1, z: 0 };
                 let size = {x: 80, y: 395, z: 1755};
                finalPosition = this.handleWallCollision(finalPosition, desiredPosition, translation, leftWallPos, size);
            }else if(this.isCollidingFrontWall){
                const frontWallPos = {  x: 0, y: 1, z: 900 };
                let size = {x: 1755, y: 395, z: 80}
                finalPosition = this.handleWallCollision(finalPosition, desiredPosition, translation, frontWallPos, size);
            }
            
            else {
                 finalPosition = desiredPosition;
            }

        this.rigidBody.setNextKinematicTranslation(finalPosition);
        this.model.position.set(finalPosition.x, finalPosition.y, finalPosition.z);

        this.updateCameraTarget(cameraPositionOffset, finalPosition);
    }
    }
    handleFixedCollision(finalPosition, desiredPosition,translation, fixedBodyPosition){ 
            const bodyPos = fixedBodyPosition;
            const currentDist = Math.sqrt(
                    (translation.x - bodyPos.x) ** 2 +
                    (translation.y - bodyPos.y) ** 2 +
                    (translation.z - bodyPos.z) ** 2
                );
                const desiredDist = Math.sqrt(
                    (desiredPosition.x - bodyPos.x) ** 2 +
                    (desiredPosition.y - bodyPos.y) ** 2 +
                    (desiredPosition.z - bodyPos.z) ** 2
                );
                if (desiredDist > currentDist) {
                    // igrač se udaljava od stanice — dozvoli
                    finalPosition = desiredPosition;
                } else {
                    // igrač i dalje gura ka stanici — blokiraj
                    finalPosition = { x: translation.x, y: translation.y, z: translation.z };
                }
                return finalPosition;
    }
        handleWallCollision(finalPosition, desiredPos, translation, position, size){ 
        let wallHalfExtents = { x: size.x/2, y: size/2, z: size.z/2 };
            // proveri da li bi desiredPos ušao UNUTAR box-a zida
        const insideX = Math.abs(desiredPos.x - position.x) < wallHalfExtents.x;
        const insideY = Math.abs(desiredPos.y - position.y) < wallHalfExtents.y;
        const insideZ = Math.abs(desiredPos.z - position.z) < wallHalfExtents.z;

        if (insideX && insideY && insideZ) {
            // ušao bi unutar zida — treba blokirati samo onu osu koja izaziva penetraciju

            // proveri PO OSI da li je TRENUTNA pozicija već van zida na toj osi
            const wasOutsideX = Math.abs(translation.x - position.x) >= wallHalfExtents.x;
            const wasOutsideY = Math.abs(translation.y - position.y) >= wallHalfExtents.y;
            const wasOutsideZ = Math.abs(translation.z - position.z) >= wallHalfExtents.z;

            const result = { x: desiredPos.x, y: desiredPos.y, z: desiredPos.z };

            // ako si PRE bio van zida po X osi, a SAD bi ušao — zaustavi samo X komponentu
            if (wasOutsideX) result.x = translation.x;
            if (wasOutsideY) result.y = translation.y;
            if (wasOutsideZ) result.z = translation.z;

            return result;
        }

        return desiredPos;
        }
    setFixedCollisions(fixedBodies){
        this.fixedCollisions = fixedBodies;
    }
    updateCameraTarget(offset, rigidTranslation){
        // move camera
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
    onCollisionStart() {
        this.isCollidingDoor = true;
        console.log('COLLISION START');
    }

    onCollisionEnd() {
        this.isCollidingDoor = false;
        console.log('COLLISION END');
    }
    onWallCollisionStart(tag) {
        switch(tag){
            case 'rigthWall':
                this.isCollidingRightWall = true;
                break;
            case 'leftWall':
                this.isCollidingLeftWall = true;
                break;
            case 'frontWall':
                this.isCollidingFrontWall = true;
                break;
        }
        console.log('COLLISION START');
    }

    onWallCollisionEnd(tag) {
          switch(tag){
            case 'rigthWall':
                this.isCollidingRightWall = false;
                break;
            case 'leftWall':
                this.isCollidingLeftWall = false;
                break;
            case 'frontWall':
                this.isCollidingFrontWall = false;
                break;
        }
        console.log('COLLISION END');
    }
}