// 
var stage, width, height, screenMin, screenMax, radiusMin, radiusMax;
var timeElapsed, timeStarted;
var keys = [
	{name:"D", keyCode:68, value:false},
	{name:"F", keyCode:70, value:false},
	{name:"J", keyCode:74, value:false},
	{name:"K", keyCode:75, value:false}];
var keyDebug = false;
var debugging = false;
var speedDebug = 2;
var muted = false;

//
var playing, gameState, levelManager, sounds = [], cursors = [];
var synched = false, synching = false, syncLastTri = -1, syncTimeStart = 0;
var syncTimeDelay = 6;
var syncDifference = 0, syncTolerance = 0.1;
var timeGlobal = 16;
var acceleration = 0.0005;
var decceleration = 0.99;
var minSpeed = 0.002;
var maxSpeed = 0.02;

//
var radiusCursor;
var countCursors = 4;
var countLines = 12; 
var sizeCheckpoints = 4;
var alphaLevelBackground = 0.2;
var pi = 3.14159265359;

//
var titleFormat, textFormat, textTitle, textVictory, textDebug, textHelp;
var stringTitle = "Isochrone";
var stringVictory = "Your isochrony is complete";
var stringHelp = "Y : Debug Mode (T : Speed Up / U : Speed Down) / M : Mute";
var colorGrayLines = 0xeeeeee;
var colorGrayTriangles = 0xcccccc;

//
var filesToLoad = 48 + 1;
var filesLoaded = 0;

// Load Sounds
for (var l = 1; l <= 12; l++) {
	for (var n = 1; n <= 4; n++) {
		sounds.push(loadAudio("son/ligne" + l + "note" + n + ".mp3"));
	}
}

// Load Font
var font = loadFont("font/forced_square-webfont.ttf");

// Debug 
function UpdateDebug() {
	textDebug.text = "Differences : " + syncDifference.toFixed(2);
}

$(document).ready(function()
{
	// Stage
	stage = new Stage("game");
	width = stage.stageWidth;
	height = stage.stageHeight;
	gameState = -1;
	playing = false;

	// Size and Scales
	if (width > height) { screenMin = height; screenMax = width; }
	else { screenMin = width; screenMax = height; }
	radiusMin = 1;//1/3 * screenMin / 2;
 	radiusMax = 2/3 * screenMin / 2;
 	radiusCursor = 1/60 * screenMin;

	// Level
	levelManager = new LevelManager();
	levelManager.init();
	levelManager.drawBackground();

	// Texts
	titleFormat = new TextFormat("verdana", 146 * screenMin / 896, 0x000000);
	textFormat = new TextFormat("verdana", 36 * screenMin / 896, 0x000000);
	debugFormat = new TextFormat("verdana", 18 * screenMin / 896, 0x000000);
	textTitle = new TextField();
	textTitle.text = stringTitle;
	textDebug = new TextField();
	UpdateDebug();
	textHelp = new TextField();
	textHelp.text = stringHelp;
	textVictory = new TextField();
	textVictory.text = stringVictory;
});

function OnLoaded() {

	// Set Title
	textTitle.setTextFormat(titleFormat);
	textTitle.width = textTitle.textWidth; textTitle.height = textTitle.textHeight;
	textTitle.x = width/2 - textTitle.width/2;
	textTitle.y = height/2 - textTitle.height/2;
	textTitle.alpha = 0;
	stage.addChild(textTitle); 
	
	textDebug.setTextFormat(debugFormat);
	textDebug.width = textDebug.textWidth; textDebug.height = textDebug.textHeight;
	textDebug.x = width/2 - textDebug.width/2;
	textDebug.y = textDebug.height * 2;
	stage.addChild(textDebug); 

	textHelp.setTextFormat(debugFormat);
	textHelp.width = textHelp.textWidth; textHelp.height = textHelp.textHeight;
	textHelp.x = width/2 - textHelp.width/2;
	textHelp.y = textHelp.height/2;
	stage.addChild(textHelp); 

	textVictory.setTextFormat(textFormat);
	textVictory.width = textVictory.textWidth; textVictory.height = textVictory.textHeight;
	textVictory.x = width/2 - textVictory.width/2;
	textVictory.y = height - (height/2 - radiusMax)/2 - textVictory.height/2;
	textVictory.alpha = 0;
	stage.addChild(textVictory); 

	// Cursors
	var paths = levelManager.GetLevelPaths();
	for (var c = 0; c < countCursors; c++) {
		var cursor = new Cursor();
		cursor.init(c);
		cursor.setupPath(paths[c]);
		cursors.push(cursor);
		stage.addChild(cursor);
	}

	// Start
	timeStarted = new Date().getTime() / 1000.0;
	Howler.volume(0);
	gameState = 0;

	// Animation
	AnimationIntroduction();

	// Events
	stage.addEventListener(Event.ENTER_FRAME, onEF);
	stage.addEventListener(MouseEvent.MOUSE_DOWN, onMD );
	stage.addEventListener(MouseEvent.MOUSE_UP, onMU );
	stage.addEventListener(KeyboardEvent.KEY_DOWN, onKD);
	stage.addEventListener(KeyboardEvent.KEY_UP  , onKU);
}

function NextLevel()
{
	var t = 0;

	levelManager.hideTriangles();

	// Show Victory
	Tweener.addTween(textVictory, {alpha:1, transition:"easeInSine", delay:t, time:1});

	t += 1;

	// Hide Victory
	Tweener.addTween(textVictory, {alpha:0, transition:"easeInSine", delay:t, time:1});

	t += 1;

	// Hide Cursors
	for (var c = 0; c < countCursors; c++) {
		var cursor = cursors[c];
		cursor.hide(t);
	}

	t += 1;

	// Next Level
	LoadLevel(levelManager.currentLevel + 1, t);
}

function LoadLevel(num, delay)
{
	// Level
	var onStart = function() { playing = false; };
	var onComplete = function()
	{
		playing = true; 
		levelManager.showTriangles();
		// Cursors
		var paths = levelManager.GetLevelPaths();
		for (var c = 0; c < countCursors; c++) {
			var cursor = cursors[c];
			cursor.setupPath(paths[c]);
			cursor.show(0);
		}
	};
	levelManager.showLevel(num, delay, onStart, onComplete);
}

function AnimationIntroduction()
{
	var t = 0;

	// Show Title
	Tweener.addTween(textTitle, {alpha:1, transition:"easeInSine", time:1});
	
	t += 1;

	// Hide Title
	Tweener.addTween(textTitle, {alpha:0, transition:"easeInSine", delay:t, time:1, onComplete:function(){ textTitle.visible = false; }});
	// Show Background
	levelManager.showBackground(t);
	
	t += 1;

	// Start Level
	LoadLevel(0, t);
}

// Sound System
function PlaySound(index)
{
	sounds[index].play();
	console.log("yo?");
}

// Loading
function loadImage(uri) {
    var img = new Image();
    img.onload = isAppLoaded;
    img.src = uri;
    return img;
}
function loadAudio(url) {
    var audio = new Howl({
	  urls: [url],
	  onload: function() {
	    isAppLoaded();
	  }
	});
    return audio;
}
function loadFont(uri) {
    var font = new Font();
    font.onload = isAppLoaded;
    font.src = uri;
    font.fontFamily = "forced_squaremedium";
    return font;
}
function isAppLoaded() {
    filesLoaded++;
    if (filesLoaded >= filesToLoad) OnLoaded();
}

