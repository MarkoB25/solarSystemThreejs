import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {EntityCreator} from '../js/entityCreator.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';


export class SpaceViewerScene{
    constructor(camera, textureLoader , entityCreator){
        this.scene = new THREE.Scene();
        this.camera = camera;
        this.textureLoader = textureLoader;
        this.entityCreator = entityCreator;
       
        this.animationCallback = null;
        this.fullPlanetObjects = [];
        this.naturalSatellites = [];
        this.sun = null;;
        this.isLoaded = false;

        // onLoadProgress is a callback we get from main js
        this.onLoadProgress = null;
        this.loadedAssets = 0;
        this.totalAssests = 28;
    }
load(){
    //Sunce
    const geometrySunce = new THREE.SphereGeometry(18, 40, 40);
    const materialSunce = new THREE.MeshStandardMaterial();
    const sun = new THREE.Mesh(geometrySunce , materialSunce);
    sun.name = 'Sun';

    sun.material.map = this.textureLoader.load('static/sun/sunmap.jpg');
    sun.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress();

    this.sun = sun;

    const planetGroup = new THREE.Group();

    //Merkur
    const mercury = this.entityCreator.createPlanet(1.7, 30, 'Mercury');

    mercury.mesh.material.map = this.textureLoader.load('static/mercury/mercurymap.jpg');
    this.reportProgress(); 
    mercury.mesh.material.bumpMap = this.textureLoader.load('static/mercury/mercurybump.jpg');
    this.reportProgress(); 
    mercury.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    this.fullPlanetObjects.push(mercury);

    //Venera
    const venus = this.entityCreator.createPlanet(2.2, 45, 'Venus');

    venus.mesh.material.map = this.textureLoader.load('static/venus/venus.jpg');
    venus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    this.fullPlanetObjects.push(venus);

    //Zemlja + Mesec
    const earth = this.entityCreator.createPlanet(2, 60, 'Earth');
    earth.mesh.material.map = this.textureLoader.load('static/earth/earth.jpg');
    earth.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    const moon = this.entityCreator.createMoon(0.8, 4, 0.5, 0, earth.mesh, 'Moon');
    moon.mesh.material.map = this.textureLoader.load('static/earth/moon.jpg');
    moon.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    this.fullPlanetObjects.push(earth);
    this.naturalSatellites.push(moon);

    //Mars
    const mars = this.entityCreator.createPlanet(1.6, 75, 'Mars');

    mars.mesh.material.map = this.textureLoader.load('static/mars/mars.jpg');
    mars.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //prvi mesec Marsa - Phobos
    const phobos = this.entityCreator.createMoon(0.7, 2.5, 0, -2, mars.mesh, 'Phobos');
    phobos.mesh.material.map = this.textureLoader.load('static/mars/phobos.jpg');
    phobos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //drugi mesec Marsa - Deimos
    const deimos = this.entityCreator.createMoon(0.6, -2.5, 0, 3, mars.mesh, 'Deimos');
    deimos.mesh.material.map = this.textureLoader.load('static/mars/deimos.jpg');
    deimos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    this.fullPlanetObjects.push(mars);
    this.naturalSatellites.push(phobos);
    this.naturalSatellites.push(deimos);
    
    //Jupiter
    const jupiter = this.entityCreator.createPlanet(6.3, 100, 'Jupiter');

    jupiter.mesh.material.map = this.textureLoader.load('static/jupiter/jup0vss1.jpg');
    jupiter.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //četiri najveća meseca Jupitera
    //Ganymede
    const ganymede = this.entityCreator.createMoon(1.9, 13, 0, -2, jupiter.mesh, 'Ganymede');
    ganymede.mesh.material.map = this.textureLoader.load('static/jupiter/ganymede.jpg');
    ganymede.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //Callisto
    const callisto = this.entityCreator.createMoon(1.7, -12, 0.5, 3, jupiter.mesh,'Callisto');
    callisto.mesh.material.map = this.textureLoader.load('static/jupiter/callisto.jpg');
    callisto.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //Io
    const io = this.entityCreator.createMoon(1, -5, 1, 9, jupiter.mesh, 'Io');
    io.mesh.material.map = this.textureLoader.load('static/jupiter/io.jpg');
    io.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //Europa
    const europa = this.entityCreator.createMoon(0.7, 6, -1, -12, jupiter.mesh, 'Europa');
    europa.mesh.material.map = this.textureLoader.load('static/jupiter/jupiter-europa-surface.jpg');
    europa.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    this.fullPlanetObjects.push(jupiter);
    this.naturalSatellites.push(ganymede);
    this.naturalSatellites.push(callisto);
    this.naturalSatellites.push(io);
    this.naturalSatellites.push(europa);

    //Saturn
    const saturn = this.entityCreator.createPlanet(6, 145, 'Saturn');

    const ringGeometry = new THREE.RingGeometry(6, 11, 30);
    const ringMaterial = new THREE.MeshStandardMaterial({
        side: THREE.DoubleSide
    });
    const ringOfSaturn = new THREE.Mesh(ringGeometry, ringMaterial);
    ringOfSaturn.rotation.x = Math.PI/2; // 90 stepeni u radijanima
    ringOfSaturn.name = "Saturn";
    saturn.mesh.add(ringOfSaturn);

    saturn.mesh.material.map = this.textureLoader.load('static/saturn/saturn.jpg');
    saturn.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    ringOfSaturn.material.map = this.textureLoader.load('static/saturn/saturnRing.png');
    ringOfSaturn.material.transparent = true;
    ringOfSaturn.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //meseci Saturna
    //Titan
    const titan = this.entityCreator.createMoon(1.7, -22, 0.5, 3, saturn.mesh, 'Titan');
    titan.mesh.material.map = this.textureLoader.load('static/saturn/titan.jpg');
    titan.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    //Rhea
    const rhea = this.entityCreator.createMoon(0.6, -14, 0.5, -5, saturn.mesh, 'Rhea');
    rhea.mesh.material.map = this.textureLoader.load('static/saturn/rhea.jpg');
    rhea.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    //Iapetus
    const iapetus = this.entityCreator.createMoon(0.6, 12, 0.5, 5, saturn.mesh, 'Iapetus');
    iapetus.mesh.material.map = this.textureLoader.load('static/saturn/iapetus.jpg');
    iapetus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    //Dione
    const dione = this.entityCreator.createMoon(0.6, 10, 0, 15, saturn.mesh, 'Dione');
    dione.mesh.material.map = this.textureLoader.load('static/saturn/dione.jpg');
    dione.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    //Tethys
    const tethys = this.entityCreator.createMoon(0.6, 10, 0, -15, saturn.mesh, 'Tethys');
    tethys.mesh.material.map = this.textureLoader.load('static/saturn/tethys.jpg');
    tethys.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    //Enceladus
    const enceladus = this.entityCreator.createMoon(0.6, -9, 0, 15, saturn.mesh, 'Enceladus');
    enceladus.mesh.material.map = this.textureLoader.load('static/saturn/enceladus.jpg');
    enceladus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    //Mimas
    const mimas = this.entityCreator.createMoon(0.6, -10, 0, -15, saturn.mesh, 'Mimas');
    mimas.mesh.material.map = this.textureLoader.load('static/saturn/mimas.jpg');
    mimas.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    this.fullPlanetObjects.push(saturn);
    this.naturalSatellites.push(titan);
    this.naturalSatellites.push(rhea);
    this.naturalSatellites.push(iapetus);
    this.naturalSatellites.push(dione);
    this.naturalSatellites.push(tethys);
    this.naturalSatellites.push(enceladus);
    this.naturalSatellites.push(mimas);

    //Uranus
    const uranus = this.entityCreator.createPlanet(3.8, 185, 'Uranus');
    uranus.mesh.material.map = this.textureLoader.load('static/uranus/uranus.jpg');
    uranus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //meseci Uranusa
    //Titania
    const titania = this.entityCreator.createMoon(0.7, 8, 0, 5, uranus.mesh, 'Titania');
    titania.mesh.material.map = this.textureLoader.load('static/uranus/titania.jpg');
    titania.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    //Umbriel
    const umbriel = this.entityCreator.createMoon(0.7, -8, 0, 5, uranus.mesh, 'Umbriel');
    umbriel.mesh.material.map = this.textureLoader.load('static/uranus/umbriel.jpg');
    umbriel.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    this.fullPlanetObjects.push(uranus);
    this.naturalSatellites.push(titania);
    this.naturalSatellites.push(umbriel);

    //Neptune 
    const neptune = this.entityCreator.createPlanet(3.6, 210, 'Neptune');
    neptune.mesh.material.map = this.textureLoader.load('static/neptune/neptune.jpg');
    neptune.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 
    //Triton - najveći mesec Neptuna
    const triton = this.entityCreator.createMoon(0.7, -8, 0, 5, neptune.mesh, 'Triton');
    triton.mesh.material.map = this.textureLoader.load('static/neptune/triton.jpg');
    triton.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    this.reportProgress(); 

    this.fullPlanetObjects.push(neptune);
    this.naturalSatellites.push(triton);

    planetGroup.add(mercury.object);
    planetGroup.add(venus.object);
    planetGroup.add(earth.object);
    planetGroup.add(mars.object);
    planetGroup.add(jupiter.object);
    planetGroup.add(saturn.object);
    planetGroup.add(uranus.object);
    planetGroup.add(neptune.object);

    // dodavanje objekata na scenu
    this.scene.add(sun);
    this.scene.add(planetGroup);
    // ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    if(!(ambientLight in this.scene.children)){
            this.scene.add(ambientLight);
        }
    // svetlo iz tacke
    const svetloIzTacke = new THREE.PointLight(0xe1eb2d, 9000);
    if(!(svetloIzTacke in this.scene.children)){
            this.scene.add(svetloIzTacke);
        }
    // reflektor - pravougaono svetlo za odgovarajucim dimenzijama
    const pravougaonoSvetlo = new THREE.RectAreaLight(0xe3ba05, 2, 30, 30);
    pravougaonoSvetlo.position.set(0, 20, 0);
    if(!(pravougaonoSvetlo in this.scene.children)){
            this.scene.add(pravougaonoSvetlo);
            pravougaonoSvetlo.lookAt(0, 0, 0);
        }
    //drugo svetlo
    const pravougaonoSvetlo2 = new THREE.RectAreaLight(0xe3ba05, 2, 30, 30);
    pravougaonoSvetlo2.position.set(0, -20, 0);
    if(!(pravougaonoSvetlo2 in this.scene.children)){
            this.scene.add(pravougaonoSvetlo2);
            pravougaonoSvetlo2.lookAt(0, 0, 0);
        }
    this.animationCallback = this.animate(this.fullPlanetObjects, this.naturalSatellites, sun);
    this.isLoaded = true;
}
animate(planetGroup, naturalSatellites, sun) {
    // the sun is a seperate object from the group so we call its rotation seperately
    sun.rotateY(0.004);
    if(planetGroup){
        planetGroup.forEach(c => {
            switch(c.mesh.name){
                case 'Mercury':
                    c.object.rotateY(0.006);
                    c.mesh.rotateY(0.001);
                break
                case 'Venus':
                    c.object.rotateY(0.003);
                    c.mesh.rotateY(0.001);
                break
                case 'Earth':
                    c.object.rotateY(0.0019);
                    c.mesh.rotateY(0.002);
                break
                case 'Mars':
                    c.object.rotateY(0.0013);
                    c.mesh.rotateY(0.001);
                break
                case 'Jupiter':
                    c.object.rotateY(0.0022);
                    c.mesh.rotateY(0.003);
                break
                case 'Saturn':
                    c.object.rotateY(0.002);
                    c.mesh.rotateY(0.0025);
                break
                case 'Uranus':
                    c.object.rotateY(0.0015);
                    c.mesh.rotateY(0.001);
                break
                case 'Neptune':
                    c.object.rotateY(0.001);
                    c.mesh.rotateY(0.0013);
                break            
            }
        });
    }
        if(naturalSatellites){
            naturalSatellites.forEach(c => {
                c.mesh.rotateY(0.002);
                c.object.rotateY(0.005);
            });
        }
};
    getScene(){
        return this.scene;
    }
    getAnimationCallback(){
        return this.animationCallback;
    }
    getPlanets(){
        return this.fullPlanetObjects;
    }
    getNaturalSatellites(){
        return this.naturalSatellites;
    }
    getSun(){
        return this.sun;
    }
    getIsLoaded(){
        return this.isLoaded;
    }
    reportProgress(){
            this.loadedAssets++;
            if(this.onLoadProgress){
                this.onLoadProgress(this.loadedAssets, this.totalAssests);
            }
    }
}

 