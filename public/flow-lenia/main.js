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
let lenia=new Lenia(canvasElm.width, canvasElm.height);
let canvasTex=new Texture({
	src: canvasElm,
	minMag: gl.NEAREST,
	wrap: gl.REPEAT
});

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

// gui
var gui = new dat.GUI();
// gui.useLocalStorage = true;
// var folder1 = gui.addFolder('Flow Field');
lenia.settings = {
	velocitySpeed: 1,
	gradientSpeed: 0.25,
	colorDNA: 0.,
	colorVariation: 0.,
	spawnEdge: true,
	blendImageInGradient: true,
	blendImageInLenia: false,
	reset: () => { lenia.reset() },
}
gui.add(lenia.settings, 'velocitySpeed', 0, 1, 0.01);
gui.add(lenia.settings, 'gradientSpeed', 0, 1, 0.01);
gui.add(lenia.settings, 'colorDNA', 0, 1, 0.01);
gui.add(lenia.settings, 'colorVariation', 0, 1, 0.01);
gui.add(lenia.settings, 'spawnEdge');
gui.add(lenia.settings, 'blendImageInGradient');
gui.add(lenia.settings, 'blendImageInLenia');
gui.add(lenia.settings, 'reset');
gui.remember(lenia.settings);

let zoomBase=1.;
let zoomExp=0;
let frameAnim=animate(()=>{
	time++;

	let ratio=display.size.cln().div(lenia.size);
	let scale=Vec(
		min(ratio.x/ratio.y,1.),
		min(ratio.y/ratio.x,1.)
	);
	let pre=display.view.transformInv(control.mousePos()).div(display.size);
	zoomExp-=sign(control.mouseWheelDelta());
	display.view.zoom=pow(zoomBase,zoomExp);
	let post=display.view.transformInv(control.mousePos()).div(display.size);
	display.view.pos.add(post.cln().sub(pre).scl(scale));
	
	control.resetDelta();

	// if (update)
	{
		display.clear();
		canvasTex.update(canvasElm);
		lenia.run(update,display,canvasTex,imageTex);
	}

	if (control.mLDown)
	{
		// label position
		const mouse = control.mousePos();
		// dom_label.style.left = (10+mouse[0]) + "px";
		// dom_label.style.top = (10+mouse[1]) + "px";
		
		// read back pixel dna
		const read = new Float32Array(4);
		const x = mouse[0];
		const y = mouse[1];
		lenia.dnaTexPP.readAt(x,y,gl.RGBA, gl.FLOAT,read);

		// update label
		dom_label.textContent = read[0] + ',' + read[1] + ',' + read[2] + ',' + read[3];

		lenia.dnaSelect = read;

	}

},1,true).start();
