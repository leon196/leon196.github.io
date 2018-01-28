
let textures = {};
let textureLoader = new THREE.TextureLoader();
let textureLoaded = 0;
let textureUrls = [
	{ name:'cursor', url:'images/cursor.png' },
	{ name:'plug', url:'images/plug.png' },
	{ name:'outlet', url:'images/outlet.png' },
	{ name:'title', url:'images/title.png' },
	{ name:'subtitle', url:'images/subtitle.png' },
];
let textureCount = textureUrls.length;

let shaders = {};
let shaderLoader = new THREE.FileLoader();
let shaderLoaded = 0;
let shaderUrls = [
	{ name:'cable.frag', url:'shaders/cable.frag' },
	{ name:'cable.vert', url:'shaders/cable.vert' },
	{ name:'plug.frag', url:'shaders/plug.frag' },
	{ name:'plug.vert', url:'shaders/plug.vert' },
	{ name:'cursor.frag', url:'shaders/cursor.frag' },
	{ name:'cursor.vert', url:'shaders/cursor.vert' },
	{ name:'outlet.frag', url:'shaders/outlet.frag' },
	{ name:'outlet.vert', url:'shaders/outlet.vert' },
	{ name:'title.frag', url:'shaders/title.frag' },
	{ name:'title.vert', url:'shaders/title.vert' },
	{ name:'subtitle.frag', url:'shaders/subtitle.frag' },
	{ name:'subtitle.vert', url:'shaders/subtitle.vert' },
];
let shaderCount = shaderUrls.length;

var callbackOnLoad = null;

function loadedTexture (key, data) {
	textures[key] = data;
	if (Object.keys(textures).length == textureCount && Object.keys(shaders).length == shaderCount) {
		if (callbackOnLoad != null) {
			callbackOnLoad();
		}
	}
}

function loadedShader (key, data) {
	shaders[key] = data;
	if (Object.keys(textures).length == textureCount && Object.keys(shaders).length == shaderCount) {
		if (callbackOnLoad != null) {
			callbackOnLoad();
		}
	}
}

function load (callback) {
	callbackOnLoad = callback;
	textureUrls.forEach(item => { textureLoader.load(item.url, data => loadedTexture(item.name, data)); });
	shaderUrls.forEach(item => { shaderLoader.load(item.url, data => loadedShader(item.name, data)); });
}