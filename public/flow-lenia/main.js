// Create global page styles
createStyles(scss`&{
	background-color:black;
	overflow:hidden;
	canvas{
		position:absolute;
		width:100vw;
		height:100vh;
	}
	.gl{
		pointer-events:none;
		opacity:1;
	}
}`());

let canvasElm=newElm("canvas");
let glCanvasElm=newElm("canvas");
let gl=glCanvasElm.getContext("webgl2",{
	premultipliedAlpha: true
});

gl.getExtension("EXT_color_buffer_float");
gl.getExtension("EXT_float_blend");

// Populate page html
let body=html`
	${addClass("gl",glCanvasElm)}
	${addClass("canvas",canvasElm)}
`();
addElm(body,document.body);
body.disolve();

let display=new CanvasDisplay(canvasElm);
display.view=new Cam(Vec(0,0),1.);
let control=new Control();
control.connect(canvasElm);

let shaderManager=new ShaderManager();
let lenia=new Lenia();
let leniaLayer2=new Lenia();
let leniaLayer3=new Lenia();
let leniaLayers = [lenia];

let canvasTex=new Texture({
	src: canvasElm,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT
});

let composeShader = new ComposeShader();

let imageTex=new Texture({
	src: imageSrc
});
let time=0;

// play/pause with key space
let update=true;
const key_space = 32;
control.callbacks[key_space] = () => { update = !update; }

// label
const dom_label = document.createElement("div");
dom_label.classList.add("label");
document.body.append(dom_label);
dom_label.textContent = "";

// print label content
control.callbacks['clic'] = () => { console.log(dom_label.textContent); }

settings.updateMultiLayers = () => {
	if (settings.multiLayers) {
		leniaLayers = [lenia, leniaLayer2];
	} else {
		leniaLayers = [lenia];
	}
}

// settings
settings.imageHD = () => {
	const img = new Image();
	img.src = "./img/prendre-vie"+(settings.image4K?"":"-sd")+".png";
	img.onload = () => {
		imageTex = new Texture({ src: img });
		leniaLayers.forEach(layer => layer.resize(img));
	}
};

// reset
settings.reset = () => {
	leniaLayers.forEach(layer => layer.reset());
};

// zoom
let zoom = 1.;
let offset = [0,0];
// let zoom2 = 1.;
// let offset2 = [0,0];

settings.onZoom = () => {
	if (anim.current == undefined) {
		anim.start();
	}
};

leniaLayers.forEach(layer => layer.settings = settings);

if (settings.zoom) anim.start();

// gui
var gui = new dat.GUI();
var folderSpeed = gui.addFolder('Speed');
folderSpeed.add(settings, 'velocitySpeed', 0, 1, 0.01);
folderSpeed.add(settings, 'gradientSpeed', 0, 1, 0.01);
folderSpeed.open();
var folderColor = gui.addFolder('Color');
folderColor.add(settings, 'colorDNA', 0, 1, 0.01);
folderColor.add(settings, 'colorVariation', 0, 1, 0.01);
folderColor.open();
var folderSpawn = gui.addFolder('Spawn');
folderSpawn.add(settings, 'spawnEdge');
folderSpawn.open();
var folderImage = gui.addFolder('Image');
folderImage.add(settings, 'blendImageInGradient');
folderImage.add(settings, 'blendImageInLenia');
folderImage.add(settings, 'multiLayers').onChange(settings.updateMultiLayers);
folderImage.add(settings, 'image4K').onChange(settings.imageHD);
folderImage.add(settings, 'zoom').onChange(settings.onZoom); 
folderImage.open();
gui.add(settings, 'reset'); 
gui.remember(settings);
gui.close();

let elapsed = 0;

let frameAnim=animate((timeElapsed)=>{
	time++;

	const dt = timeElapsed - elapsed;
	elapsed = timeElapsed;

	if (anim.current != undefined && settings.zoom) {
		anim.current(dt);
	}
	
	control.resetDelta();

	display.clear();
	canvasTex.update(canvasElm);

	leniaLayers.forEach(layer => layer.run(update,display,canvasTex,imageTex));

	composeShader.run(display.view, lenia.size, display.size, zoom, offset, leniaLayers, settings);

	// pick a specie
	// if (control.mLDown)
	// {
	// 	const l = lenia;

	// 	// label position
	// 	const mouse = control.mousePos();
		
	// 	// read back pixel dna
	// 	const read = new Float32Array(4);
	// 	const x = mouse[0]*l.size[0]/canvasElm.width;
	// 	const y = mouse[1]*l.size[1]/canvasElm.height;

	// 	l.dnaTexPP.readAt(x,y,gl.RGBA, gl.FLOAT,read);

	// 	// update label
	// 	dom_label.textContent = read[0] + ',' + read[1] + ',' + read[2] + ',' + read[3];

	// 	l.dnaSelect = read;

	// }

},1,true).start();
