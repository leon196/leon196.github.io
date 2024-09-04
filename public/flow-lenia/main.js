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
		image-rendering: pixelated;
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

// settings
settings.imageHD = () => {
	settings.hd = !settings.hd;

	const img = new Image();
	img.src = "./img/prendre-vie"+(settings.hd?"":"-sd")+".png";
	img.onload = () => {
		imageTex = new Texture({ src: img });
		lenia.resize(img);
		leniaLayer2.resize(img);
	}

};

// reset
settings.reset = () => {
	lenia.reset();
	leniaLayer2.reset();
};

// zoom
let zoom = 1.;
let offset = [0,0];

settings.zoom = () => {
	settings.zooming = !settings.zooming;
	if (settings.zooming)
	{
		zoom = 2.;
		offset = [0.5,0.5];
	}
	else
	{
		zoom = 1.;
		offset = [0,0];
	}
};

lenia.settings = settings;
leniaLayer2.settings = settings;

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
folderImage.add(settings, 'secondLayer');
folderImage.add(settings, 'imageHD');
folderImage.add(settings, 'zoom'); 
folderImage.open();
gui.add(settings, 'reset'); 
gui.remember(settings);

let frameAnim=animate(()=>{
	time++;
	
	control.resetDelta();

	display.clear();
	canvasTex.update(canvasElm);

	lenia.run(update,display,canvasTex,imageTex);
	if (settings.secondLayer)
	{
		leniaLayer2.run(update,display,canvasTex,imageTex);
	}

	composeShader.run(display.view, lenia.size, display.size, zoom, offset, lenia.renderTex, leniaLayer2.renderTex, settings);

	// pick a specie
	if (control.mLDown)
	{
		const l = lenia.settings.zoom ? leniaLayer2 : lenia;

		// label position
		const mouse = control.mousePos();
		
		// read back pixel dna
		const read = new Float32Array(4);
		const x = mouse[0]*l.size[0]/canvasElm.width;
		const y = mouse[1]*l.size[1]/canvasElm.height;

		l.dnaTexPP.readAt(x,y,gl.RGBA, gl.FLOAT,read);

		// update label
		dom_label.textContent = read[0] + ',' + read[1] + ',' + read[2] + ',' + read[3];

		l.dnaSelect = read;

	}

},1,true).start();
