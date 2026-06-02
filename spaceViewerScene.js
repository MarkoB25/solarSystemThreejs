import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {EntityCreator} from './entityCreator.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';


export class SpaceViewerScene{
    constructor(scene = new THREE.Scene(), textureLoader = new THREE.TextureLoader(), entityCreator = new EntityCreator(),
                camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000)){
        this.scene = scene;
        this.textureLoader = textureLoader;
        this.entityCreator = entityCreator;
        this.camera = camera;
    }
getScene(){
    //Sunce
    const geometrySunce = new THREE.SphereGeometry(18, 40, 40);
    const materialSunce = new THREE.MeshStandardMaterial();
    const sun = new THREE.Mesh(geometrySunce , materialSunce);
    sun.name = 'The Sun';

    sun.material.map = this.textureLoader.load('static/sun/sunmap.jpg');
    sun.material.map.colorSpace = THREE.SRGBColorSpace;

    const sunLabel = document.createElement('h5');
    sunLabel.textContent = sun.name;

    const sunLabelContainer = document.createElement('div');
    sunLabelContainer.appendChild(sunLabel);

    const planetGroup = new THREE.Group();

    //Merkur
    const mercury = this.entityCreator.createPlanet(1.7, 30, 'Mercury');

    mercury.mesh.material.map = this.textureLoader.load('static/mercury/mercurymap.jpg');
    mercury.mesh.material.bumpMap = this.textureLoader.load('static/mercury/mercurybump.jpg');
    mercury.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Venera
    const venus = this.entityCreator.createPlanet(2.2, 45, 'Venus');

    venus.mesh.material.map = this.textureLoader.load('static/venus/venus.jpg');
    venus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Zemlja + Mesec
    const earth = this.entityCreator.createPlanet(2, 60, 'Earth');
    earth.mesh.material.map = this.textureLoader.load('static/earth/earth.jpg');
    earth.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    const moon = this.entityCreator.createMoon(0.8, 4, 0.5, 0, earth.mesh, 'The Moon');
    moon.mesh.material.map = this.textureLoader.load('static/earth/moon.jpg');
    moon.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Mars
    const mars = this.entityCreator.createPlanet(1.6, 75, 'Mars');

    mars.mesh.material.map = this.textureLoader.load('static/mars/mars.jpg');
    mars.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //prvi mesec Marsa - Phobos
    const phobos = this.entityCreator.createMoon(0.7, 2.5, 0, -2, mars.mesh, 'Phobos');
    phobos.mesh.material.map = this.textureLoader.load('static/mars/phobos.jpg');
    phobos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //drugi mesec Marsa - Deimos
    const deimos = this.entityCreator.createMoon(0.6, -2.5, 0, 3, mars.mesh, 'Deimos');
    deimos.mesh.material.map = this.textureLoader.load('static/mars/deimos.jpg');
    deimos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Jupiter
    const jupiter = this.entityCreator.createPlanet(6.3, 100, 'Jupiter');

    jupiter.mesh.material.map = this.textureLoader.load('static/jupiter/jup0vss1.jpg');
    jupiter.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //četiri najveća meseca Jupitera
    //Ganymede
    const ganymede = this.entityCreator.createMoon(1.9, 13, 0, -2, jupiter.mesh, 'Ganymede');
    ganymede.mesh.material.map = this.textureLoader.load('static/jupiter/ganymede.jpg');
    ganymede.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Callisto
    const callisto = this.entityCreator.createMoon(1.7, -12, 0.5, 3, jupiter.mesh,'Callisto');
    callisto.mesh.material.map = this.textureLoader.load('static/jupiter/callisto.jpg');
    callisto.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Io
    const io = this.entityCreator.createMoon(1, -5, 1, 9, jupiter.mesh, 'Io');
    io.mesh.material.map = this.textureLoader.load('static/jupiter/io.jpg');
    io.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Europa
    const europa = this.entityCreator.createMoon(0.7, 6, -1, -12, jupiter.mesh, 'Europa');
    europa.mesh.material.map = this.textureLoader.load('static/jupiter/jupiter-europa-surface.jpg');
    europa.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

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

    ringOfSaturn.material.map = this.textureLoader.load('static/saturn/saturnRing.png');
    ringOfSaturn.material.transparent = true;
    ringOfSaturn.material.map.colorSpace = THREE.SRGBColorSpace;

    //meseci Saturna
    //Titan
    const titan = this.entityCreator.createMoon(1.7, -22, 0.5, 3, saturn.mesh, 'Titan');
    titan.mesh.material.map = this.textureLoader.load('static/saturn/titan.jpg');
    titan.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    //Rhea
    const rhea = this.entityCreator.createMoon(0.6, -14, 0.5, -5, saturn.mesh, 'Rhea');
    rhea.mesh.material.map = this.textureLoader.load('static/saturn/rhea.jpg');
    rhea.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Iapetus
    const iapetus = this.entityCreator.createMoon(0.6, 12, 0.5, 5, saturn.mesh, 'Iapetus');
    iapetus.mesh.material.map = this.textureLoader.load('static/saturn/iapetus.jpg');
    iapetus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    //Dione
    const dione = this.entityCreator.createMoon(0.6, 10, 0, 15, saturn.mesh, 'Dione');
    dione.mesh.material.map = this.textureLoader.load('static/saturn/dione.jpg');
    dione.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    //Tethys
    const tethys = this.entityCreator.createMoon(0.6, 10, 0, -15, saturn.mesh, 'Tethys');
    tethys.mesh.material.map = this.textureLoader.load('static/saturn/tethys.jpg');
    tethys.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    //Enceladus
    const enceladus = this.entityCreator.createMoon(0.6, -9, 0, 15, saturn.mesh, 'Enceladus');
    enceladus.mesh.material.map = this.textureLoader.load('static/saturn/enceladus.jpg');
    enceladus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    //Mimas
    const mimas = this.entityCreator.createMoon(0.6, -10, 0, -15, saturn.mesh, 'Mimas');
    mimas.mesh.material.map = this.textureLoader.load('static/saturn/mimas.jpg');
    mimas.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Uranus
    const uranus = this.entityCreator.createPlanet(3.8, 185, 'Uranus');
    uranus.mesh.material.map = this.textureLoader.load('static/uranus/uranus.jpg');
    uranus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //meseci Uranusa
    //Titania
    const titania = this.entityCreator.createMoon(0.7, 8, 0, 5, uranus.mesh, 'Titania');
    titania.mesh.material.map = this.textureLoader.load('static/uranus/titania.jpg');
    titania.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Umbriel
    const umbriel = this.entityCreator.createMoon(0.7, -8, 0, 5, uranus.mesh, 'Umbriel');
    umbriel.mesh.material.map = this.textureLoader.load('static/uranus/umbriel.jpg');
    umbriel.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

    //Neptune 
    const neptune = this.entityCreator.createPlanet(3.6, 210, 'Neptune');
    neptune.mesh.material.map = this.textureLoader.load('static/neptune/neptune.jpg');
    neptune.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
    //Triton - najveći mesec Neptuna
    const triton = this.entityCreator.createMoon(0.7, -8, 0, 5, neptune.mesh, 'Triton');
    triton.mesh.material.map = this.textureLoader.load('static/neptune/triton.jpg');
    triton.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

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
    
    return this.scene;
}

}

function animate() {
    
    // pokusaj opet da dodas ovo ili nadji drugi nacin mzd anime.js
    /*mercury.object.rotation.y += 0.006 * deltaTime; */

    //orbita oko sunca
    mercury.object.rotateY(0.006);
    venus.object.rotateY(0.003);
    earth.object.rotateY(0.0019);
    mars.object.rotateY(0.0013);
    jupiter.object.rotateY(0.0022);
    saturn.object.rotateY(0.002);
    uranus.object.rotateY(0.0015);
    neptune.object.rotateY(0.001); 
   
    //rotacija planeta i sunca oko svoje ose planeta
    sun.rotateY(0.004);
    mercury.mesh.rotateY(0.001);
    venus.mesh.rotateY(0.001);
    earth.mesh.rotateY(0.002);
    mars.mesh.rotateY(0.001);
    jupiter.mesh.rotateY(0.003);
    saturn.mesh.rotateY(0.0025);
    uranus.mesh.rotateY(0.0017);
    neptune.mesh.rotateY(0.0013);
    
    //rotacija oko svoje ose prirodnih satelita
    moon.mesh.rotateY(0.002);
    phobos.mesh.rotateY(0.002);
    deimos.mesh.rotateY(0.002);
    ganymede.mesh.rotateY(0.002);
    callisto.mesh.rotateY(0.002);
    io.mesh.rotateY(0.002);
    europa.mesh.rotateY(0.002);
    titan.mesh.rotateY(0.002);
    rhea.mesh.rotateY(0.002);
    iapetus.mesh.rotateY(0.002);
    dione.mesh.rotateY(0.002);
    tethys.mesh.rotateY(0.002);
    enceladus.mesh.rotateY(0.002);
    mimas.mesh.rotateY(0.002);
    titania.mesh.rotateY(0.002);
    umbriel.mesh.rotateY(0.002);
    triton.mesh.rotateY(0.002);

    //rotacija prirodnih satelita oko planeta
    moon.object.rotateY(0.005);
    phobos.object.rotateY(0.005);
    deimos.object.rotateY(0.005);
    ganymede.object.rotateY(0.005);
    callisto.object.rotateY(0.005);
    io.object.rotateY(0.005);
    europa.object.rotateY(0.005);
    titan.object.rotateY(0.005);
    rhea.object.rotateY(0.005);
    iapetus.object.rotateY(0.005);
    dione.object.rotateY(0.005);
    tethys.object.rotateY(0.005);
    enceladus.object.rotateY(0.005);
    mimas.object.rotateY(0.005);
    titania.object.rotateY(0.005);
    umbriel.object.rotateY(0.005);
    triton.object.rotateY(0.005);

    renderer.render(scene, camera);
};
