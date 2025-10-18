

let canvas = newElm("canvas");
let glCanvas = newElm("canvas");
let gl = glCanvas.getContext("webgl2",{
	premultipliedAlpha: true, preserveDrawingBuffer: true });

gl.getExtension("EXT_color_buffer_float");
gl.getExtension("EXT_float_blend");

// Populate page html
let body = html`${addClass("canvas", canvas)} ${addClass("gl", glCanvas)}`();
addElm(body,document.body);
body.disolve();

let lenia = new Lenia();
let shaderManager = new ShaderManager();
let composeShader = new ComposeShader();
let canvasTex = new Texture({ src: canvas, minMag: gl.NEAREST, wrap: gl.REPEAT });
let imageTex = new Texture({ src: imageSrc });
let control = new Control();
let display = new CanvasDisplay(canvas);

let time = 0;
let tick = 0;
let zoom = 1.;
let offset = [0,0];

display.view = new Cam(Vec(0,0),1.);
control.connect(canvas);
control.callbacks[32] = () => { settings.play = !settings.play; }
settings.reset = () => lenia.reset()
settings.onZoom = () => { if (anim.current == undefined) { anim.start(); } };
if (settings.zoom) anim.start();

lenia.settings = settings;
lenia.geneUpdate(315969);

// gui
// var gui = new dat.GUI();
// gui.add(settings, 'velocitySpeed', 0, 1, 0.01);
// gui.add(settings, 'gradientSpeed', 0, 1, 0.01);
// gui.add(settings, 'zoom').onChange(settings.onZoom);
// gui.add(settings, 'reset'); 
// gui.close();

function update(milliseconds)
{	
	let seconds = milliseconds/1000.0;
	let dt = seconds - time;
	time = seconds;
	tick++;

	control.resetDelta();
	display.clear();
	canvasTex.update(canvas);
	// anim.update(dt)

	lenia.run(settings.play, display, canvasTex, imageTex);
	composeShader.run(display.view, lenia.size, display.size);

	requestAnimationFrame(update);
}

requestAnimationFrame(update);
