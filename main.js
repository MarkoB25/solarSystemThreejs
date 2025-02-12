import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';
import { Pane } from 'tweakpane';
import * as descService from './descriptionsService.js';

const scene = new THREE.Scene();
const textureLoader = new THREE.TextureLoader();
const domRenderer = new CSS2DRenderer();
domRenderer.setSize(window.innerWidth, window.innerHeight);
domRenderer.domElement.style.position = 'absolute';
domRenderer.domElement.style.top = '0px';
domRenderer.domElement.style.pointerEvents = 'none';

document.body.appendChild(domRenderer.domElement);

function createPlanet(size, positionX, labelName){
    const geometry = new THREE.SphereGeometry(size, 40, 40);
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const object = new THREE.Object3D();

    const label = document.createElement('h6');
    label.textContent = labelName;

    const container = document.createElement('div');
    container.appendChild(label);
    const containerObj = new CSS2DObject(container);
    mesh.add(containerObj);
    containerObj.position.set(0, 12, 0);
    mesh.name = labelName;
    
    object.add(mesh);
    scene.add(object);
    mesh.position.x = positionX;

    return { object, mesh , labelName};
};
function createMoon(size, positionX, positionY, positionZ, parentObject, labelName){
    const geometry = new THREE.SphereGeometry(size, 40, 40);
    const material = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    const object = new THREE.Object3D();
    mesh.name = labelName;

    object.add(mesh);
    scene.add(object);
    parentObject.add(object);
    mesh.position.x = positionX;
    mesh.position.y = positionY;
    mesh.position.z = positionZ;

    return { object, mesh };
};

//postavljanje pozadine
scene.background = textureLoader.load('static/stars/stars.jpg');

//Sunce
const geometrySunce = new THREE.SphereGeometry(18, 40, 40);
const materialSunce = new THREE.MeshStandardMaterial();
const sun = new THREE.Mesh(geometrySunce , materialSunce);
sun.name = 'The Sun';
scene.add(sun);

sun.material.map = textureLoader.load('static/sun/sunmap.jpg');
sun.material.map.colorSpace = THREE.SRGBColorSpace;

const sunLabel = document.createElement('h5');
sunLabel.textContent = sun.name;

const sunLabelContainer = document.createElement('div');
sunLabelContainer.appendChild(sunLabel);
const containerObj = new CSS2DObject(sunLabelContainer);
sun.add(containerObj);
containerObj.position.set(0, 23, 0);

//Merkur
const mercury = createPlanet(1.7, 30, 'Mercury');

mercury.mesh.material.map = textureLoader.load('static/mercury/mercurymap.jpg');
mercury.mesh.material.bumpMap = textureLoader.load('static/mercury/mercurybump.jpg');
mercury.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Venera
const venus = createPlanet(2.2, 45, 'Venus');

venus.mesh.material.map = textureLoader.load('static/venus/venus.jpg');
venus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Zemlja + Mesec
const earth = createPlanet(2, 60, 'Earth');
earth.mesh.material.map = textureLoader.load('static/earth/earth.jpg');
earth.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

const moon = createMoon(0.8, 4, 0.5, 0, earth.mesh, 'The Moon');
moon.mesh.material.map = textureLoader.load('static/earth/moon.jpg');
moon.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Mars
const mars = createPlanet(1.6, 75, 'Mars');

mars.mesh.material.map = textureLoader.load('static/mars/mars.jpg');
mars.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//prvi mesec Marsa - Phobos
const phobos = createMoon(0.7, 2.5, 0, -2, mars.mesh, 'Phobos');
phobos.mesh.material.map = textureLoader.load('static/mars/phobos.jpg');
phobos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//drugi mesec Marsa - Deimos
const deimos = createMoon(0.6, -2.5, 0, 3, mars.mesh, 'Deimos');
deimos.mesh.material.map = textureLoader.load('static/mars/deimos.jpg');
deimos.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Jupiter
const jupiter = createPlanet(6.3, 100, 'Jupiter');

jupiter.mesh.material.map = textureLoader.load('static/jupiter/jup0vss1.jpg');
jupiter.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//četiri najveća meseca Jupitera
//Ganymede
const ganymede = createMoon(1.9, 13, 0, -2, jupiter.mesh, 'Ganymede');
ganymede.mesh.material.map = textureLoader.load('static/jupiter/ganymede.jpg');
ganymede.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Callisto
const callisto = createMoon(1.7, -12, 0.5, 3, jupiter.mesh,'Callisto');
callisto.mesh.material.map = textureLoader.load('static/jupiter/callisto.jpg');
callisto.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Io
const io = createMoon(1, -5, 1, 9, jupiter.mesh, 'Io');
io.mesh.material.map = textureLoader.load('static/jupiter/io.jpg');
io.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Europa
const europa = createMoon(0.7, 6, -1, -12, jupiter.mesh, 'Europa');
europa.mesh.material.map = textureLoader.load('static/jupiter/jupiter-europa-surface.jpg');
europa.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Saturn
const saturn = createPlanet(6, 145, 'Saturn');

const ringGeometry = new THREE.RingGeometry(6, 11, 30);
const ringMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide
});
const ringOfSaturn = new THREE.Mesh(ringGeometry, ringMaterial);
ringOfSaturn.rotation.x = Math.PI/2; // 90 stepeni u radijanima
ringOfSaturn.name = "Saturn";
saturn.mesh.add(ringOfSaturn);

saturn.mesh.material.map = textureLoader.load('static/saturn/saturn.jpg');
saturn.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

ringOfSaturn.material.map = textureLoader.load('static/saturn/saturnRing.png');
ringOfSaturn.material.transparent = true;
ringOfSaturn.material.map.colorSpace = THREE.SRGBColorSpace;

//meseci Saturna
//Titan
const titan = createMoon(1.7, -22, 0.5, 3, saturn.mesh, 'Titan');
titan.mesh.material.map = textureLoader.load('static/saturn/titan.jpg');
titan.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
//Rhea
const rhea = createMoon(0.6, -14, 0.5, -5, saturn.mesh, 'Rhea');
rhea.mesh.material.map = textureLoader.load('static/saturn/rhea.jpg');
rhea.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Iapetus
const iapetus = createMoon(0.6, 12, 0.5, 5, saturn.mesh, 'Iapetus');
iapetus.mesh.material.map = textureLoader.load('static/saturn/iapetus.jpg');
iapetus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
//Dione
const dione = createMoon(0.6, 10, 0, 15, saturn.mesh, 'Dione');
dione.mesh.material.map = textureLoader.load('static/saturn/dione.jpg');
dione.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
//Tethys
const tethys = createMoon(0.6, 10, 0, -15, saturn.mesh, 'Tethys');
tethys.mesh.material.map = textureLoader.load('static/saturn/tethys.jpg');
tethys.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
//Enceladus
const enceladus = createMoon(0.6, -9, 0, 15, saturn.mesh, 'Enceladus');
enceladus.mesh.material.map = textureLoader.load('static/saturn/enceladus.jpg');
enceladus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
//Mimas
const mimas = createMoon(0.6, -10, 0, -15, saturn.mesh, 'Mimas');
mimas.mesh.material.map = textureLoader.load('static/saturn/mimas.jpg');
mimas.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Uranus
const uranus = createPlanet(3.8, 185, 'Uranus');
uranus.mesh.material.map = textureLoader.load('static/uranus/uranus.jpg');
uranus.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//meseci Uranusa
//Titania
const titania = createMoon(0.7, 8, 0, 5, uranus.mesh, 'Titania');
titania.mesh.material.map = textureLoader.load('static/uranus/titania.jpg');
titania.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Umbriel
const umbriel = createMoon(0.7, -8, 0, 5, uranus.mesh, 'Umbriel');
umbriel.mesh.material.map = textureLoader.load('static/uranus/umbriel.jpg');
umbriel.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

//Neptune 
const neptune = createPlanet(3.6, 210, 'Neptune');
neptune.mesh.material.map = textureLoader.load('static/neptune/neptune.jpg');
neptune.mesh.material.map.colorSpace = THREE.SRGBColorSpace;
//Triton - najveći mesec Neptuna
const triton = createMoon(0.7, -8, 0, 5, neptune.mesh, 'Triton');
triton.mesh.material.map = textureLoader.load('static/neptune/triton.jpg');
triton.mesh.material.map.colorSpace = THREE.SRGBColorSpace;

// ambient light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
// svetlo iz tacke
const svetloIzTacke = new THREE.PointLight(0xe1eb2d, 9000);
scene.add(svetloIzTacke);
const svetloIzTackeHelper = new THREE.PointLightHelper(svetloIzTacke);
scene.add(svetloIzTackeHelper);

// reflektor - pravougaono svetlo za odgovarajucim dimenzijama
const pravougaonoSvetlo = new THREE.RectAreaLight(0xe3ba05, 2, 30, 30);
pravougaonoSvetlo.position.set(0, 20, 0);
scene.add(pravougaonoSvetlo);
pravougaonoSvetlo.lookAt(0, 0, 0);
//drugo svetlo
const pravougaonoSvetlo2 = new THREE.RectAreaLight(0xe3ba05, 2, 30, 30);
pravougaonoSvetlo2.position.set(0, -20, 0);
scene.add(pravougaonoSvetlo2);
pravougaonoSvetlo2.lookAt(0, 0, 0);

// kreiranje orbite oko sunca
function animate() {
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

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerMove( event ) {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
};

const desc = document.createElement('p');
const title = document.createElement('h4');

const descContainer = document.createElement('div');
descContainer.className = 'descContainer';
descContainer.appendChild(title);
descContainer.appendChild(desc);
const descContainerObj = new CSS2DObject(descContainer);
scene.add(descContainerObj);

function showDesc() {

	// update the picking ray with the camera and pointer position
	raycaster.setFromCamera( pointer, camera );
    const intersects = raycaster.intersectObjects( scene.children );
    const currentElement = intersects[0];

    if(currentElement){
        //currentElement.object.add(descContainerObj);
        descContainer.style.display = 'block';
        descService.getDesc(currentElement.object.name);
        desc.textContent = descService.currentDesc.description;
        title.textContent = 'About ' + currentElement.object.name;
    } 
	renderer.render( scene, camera );
}

window.addEventListener( 'click', onPointerMove );

// kamera i renderer
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    10000
);


camera.position.z = 300;
camera.position.y = 30;

const canvas = document.querySelector("canvas.threejs");

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const kontrole = new OrbitControls(camera, canvas);
kontrole.enableDamping = true;
//kontrole.listenToKeyEvents(window);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; //azuriranje rez. ekrana
    camera.updateProjectionMatrix(); //azuriranje projekcije matrice sa ciljem dobijanja nove rezolucije prozora
    renderer.setSize(window.innerWidth, window.innerHeight);
    domRenderer.setSize(window.innerWidth, window.innerHeight);
});

const gameloop = () => {
    kontrole.update(); // konstantno azuriranje, pri svakoj iteraciji
    renderer.render(scene, camera);
    domRenderer.render(scene, camera);
    showDesc();
    animate();
    window.requestAnimationFrame(gameloop);
}
gameloop();