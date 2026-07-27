
export class PhysicsContext {
    constructor() {
        this.RAPIER = null;
        this.world = null;
        this.ready = false;
        this.readyCallbacks = [];
    }

    init(RAPIER, world, eventQueue) {
        this.RAPIER = RAPIER;
        this.world = world;
        this.eventQueue = eventQueue;
        this.ready = true;
        this.readyCallbacks.forEach(cb => cb(RAPIER, world, eventQueue));
        this.readyCallbacks = [];
    }

    onReady(callback) {
        if (this.ready) {
            callback(this.RAPIER, this.world, this.eventQueue);
        } else {
            this.readyCallbacks.push(callback);
        }
    }
}