
import * as THREE from 'three';
import { MindARThree } from 'mindar-image-three';
import { EXRLoader } from 'three/addons/loaders/EXRLoader';
const mindarThree = new MindARThree({
container: document.querySelector("#container"),
imageTargetSrc: "./targets.mind"
});
const {renderer, scene, camera} = mindarThree;
const anchor = mindarThree.addAnchor(0);


const video = document.getElementById( 'video' );
const texture = new THREE.VideoTexture( video );
texture.minFilter = THREE.NearestFilter;

const geometry = new THREE.BufferGeometry();
const vertices = [];
let shaders = {}
let uniforms = {
    video: { value: texture },
}

for ( let i = 0; i < 10000; i ++ ) {
    const x = (i % 100)/100;
    const y = Math.floor(i / 100)/100;
    const z = 0;
    vertices.push( x, y, z );
}

geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );

const start = async() => {
    await mindarThree.start();
    await load_exr();
    await load_shaders();
    const particles = new THREE.Points( geometry, shaders.point );
    anchor.group.add(particles);
    video.play();

    renderer.setAnimationLoop(() => {
        renderer.render(scene, camera);
    });
}
const startButton = document.querySelector("#startButton");
startButton.addEventListener("click", () => {
    start();
});
stopButton.addEventListener("click", () => {
    mindarThree.stop();
    mindarThree.renderer.setAnimationLoop(null);
});

function load_exr() {
    return new Promise((resolve) => {
        new EXRLoader().load( 'image/XYTableNFOV.exr', function ( texture, textureData ) {
            uniforms.xy_lut = { value: texture };
            resolve();
        });
    });
}

function load_shaders() {

    return new Promise((resolve) => {
        THREE.Cache.enabled = true;
        const loader = new THREE.FileLoader();
        let files = {};
        let files_to_load = ["point.vert", "point.frag"]
        let loading = files_to_load.length;
        function new_shader(vert, frag) {
            return new THREE.ShaderMaterial( {
                uniforms: uniforms,
                vertexShader: files[vert],
                fragmentShader: files[frag]
            });
        }
        files_to_load.forEach(element => {
            loader.load("./shader/"+element, data => {
                files[element] = data;
                loading -= 1;
                if (loading == 0) {
                    shaders = {
                        point: new_shader("point.vert", "point.frag"),
                    };
                    resolve();
                }
            });
        });
    });
}