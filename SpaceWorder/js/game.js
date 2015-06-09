// Sizes
var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;
var marginWidth = 128;
var marginHeight = 128;

// Setup Pixi
var stage = new PIXI.Stage(0xeddfb4);
var renderer = PIXI.autoDetectRenderer(windowWidth, windowHeight);
var game = document.getElementById("game");
game.appendChild(renderer.view);
renderer.view.addEventListener('mousemove', function(evt) {
	mouse = getMousePos(renderer.view, evt);
});

// Game Elements
var title;
var player;
var letterList = [];
var paperList = [];
var splashList = [];
var garbageLetterList = [];
var garbagePaperList = [];
var garbageSplashList = [];
var mouse = vec2(0,0);
var mousePress = false;
var alphabet = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var papers = ["paper0", "paper1", "paper2", "paper3", "paper4", "paper5", "paper6"];

// Parameters
var playerFireRate = 0.1;
var letterScaleMax = 2.0;
var letterDelayMax = 2.0;
var letterRadiusSpray = 4.0;
var paperScaleMax = 10.0;
var paperDelayMax = 8.0;
var paperMaxLetter = 3;
var timePaperSpawnLast = 0;
var timePaperSpawnDelay = 0.5;

// Animation
var timeScale = 0.001;
var timeStarted = new Date() * timeScale;
var timeElapsed = 0;

// Layers
var layerTitle = new PIXI.DisplayObjectContainer();
var layerPlayer = new PIXI.DisplayObjectContainer();
var layerPaper = new PIXI.DisplayObjectContainer();
var layerSplash = new PIXI.DisplayObjectContainer();
var layerLetter = new PIXI.DisplayObjectContainer();
var layerBackground = new PIXI.Graphics();
stage.addChild(layerBackground);
stage.addChild(layerPaper);
stage.addChild(layerSplash);
stage.addChild(layerLetter);
stage.addChild(layerPlayer);
stage.addChild(layerTitle);

//
var velocityFilter;
var backgroundFilter;

function onAssetsLoaded ()
{
	// Title
	title = new PIXI.Sprite(PIXI.Texture.fromFrame("title"));
	title.scale.x = title.scale.y = 0.33;
	layerTitle.addChild(title);

	// Player
	player = new Player(PIXI.Texture.fromFrame("player"));
	player.anchor.x = 0.78;
	player.anchor.y = 0.44;
	player.position.x = mouse.x;
	player.position.y = mouse.y;
	layerPlayer.addChild(player);

	// Events
    stage.mousedown = stage.touchstart = onMouseDown;
    stage.mouseup = stage.mouseupoutside = stage.touchend = stage.touchendoutside = onMouseUp;

    // Background
    layerBackground.beginFill(0x000000);
    layerBackground.drawRect(0,0,window.innerWidth, window.innerHeight);
    backgroundFilter = new PIXI.BackgroundFilter();
    layerBackground.filters = [backgroundFilter];

    //
    velocityFilter = new PIXI.VelocityFilter();
	stage.filters = [velocityFilter];

	// Start Game Loop
	requestAnimFrame( animate );
}

function randomLetter () { return alphabet[Math.floor(alphabet.length * Math.random())]; }
function randomPaper () { return papers[Math.floor(papers.length * Math.random())]; }

function AddLetter ()
{
	var letter = new Letter(PIXI.Texture.fromFrame(randomLetter()));
	layerLetter.addChild(letter);
	letterList.push(letter);
}

function AddPapper ()
{
	var paper = new Paper(PIXI.Texture.fromFrame(randomPaper()));
	layerPaper.addChild(paper);
	paperList.push(paper);
}

function AddSplash (letter)
{
	var splash = new Splash(PIXI.Texture.fromFrame("splash2"));
	splash.position = letter.position;
	layerSplash.addChild(splash);
	splashList.push(splash);
}

// Game Loop
function animate() 
{
    requestAnimFrame( animate );
	timeElapsed = new Date() * timeScale - timeStarted;

    // Player
	player.position.x = mouse.x;
	player.position.y = mouse.y;
	player.animate();

	// 
	RecycleGarbage();

	// Shoot
	if (mousePress)
	{
		if (player.timeLastShot + player.timeFireRate < timeElapsed)
		{
			player.timeLastShot = timeElapsed;
			AddLetter();
		}
	}

	// Splash
	for (var s = splashList.length - 1; s >= 0; --s)
	{
		var splash = splashList[s];
		if (splash.timeOut)
		{
			garbageSplashList.push(splash);
		}

		splash.animate();
	}

	// Papers
	for (var p = paperList.length - 1; p >= 0; --p)
	{
		var paper = paperList[p];

		if (paper.timeOut)
		{
			paper.Recycle();
			garbagePaperList.push(paper);
		}

		paper.animate();
	}

	// Letters
	for (var l = letterList.length - 1; l >= 0; --l)
	{
		var letter = letterList[l];

		if (letter.shouldBeUpdated)
		{
			letter.animate();	

			for (var p = paperList.length - 1; p >= 0; --p)
			{
				var paper = paperList[p];
				if (paper.isWrited == false && paper.CollideWith(letter))
				{
					AddSplash(letter);
					paper.AddLetter(letter);
				}
			}
		}
		if (letter.timeOut)
		{
			garbageLetterList.push(letter);
		}
	}

	// Spawn Paper
	if (timePaperSpawnLast + timePaperSpawnDelay < timeElapsed)
	{
		timePaperSpawnLast = timeElapsed;
		AddPapper();
	}

	// Shader
	backgroundFilter.timeElapsed = timeElapsed;
	velocityFilter.timeElapsed = timeElapsed;
	velocityFilter.target = new PIXI.Float32Array([mouse.x / window.innerWidth, 1.0 - mouse.y / window.innerHeight]);

    // render the stage  
    renderer.render(stage);
}

function RecycleGarbage ()
{
	if (garbageLetterList.length > 0)
	{
		for (var g = garbageLetterList.length - 1; g >= 0; --g)
		{
			var garbage = garbageLetterList[g];
			var index = letterList.indexOf(garbage);
			if (index > -1) {
			    letterList.splice(index, 1);
				layerLetter.removeChild(garbage);
			}
		}
		garbageLetterList = [];
	}
	if (garbagePaperList.length > 0)
	{
		for (var g = garbagePaperList.length - 1; g >= 0; --g)
		{
			var garbage = garbagePaperList[g];
			var index = paperList.indexOf(garbage);
			if (index > -1) {
			    paperList.splice(index, 1);
				layerPaper.removeChild(garbage);
			}
		}
		garbagePaperList = [];
	}
	if (garbageSplashList.length > 0)
	{
		for (var g = garbageSplashList.length - 1; g >= 0; --g)
		{
			var garbage = garbageSplashList[g];
			var index = splashList.indexOf(garbage);
			if (index > -1) {
			    splashList.splice(index, 1);
				layerSplash.removeChild(garbage);
			}
		}
		garbageSplashList = [];
	}
}

function onMouseDown (data)
{
	mousePress = true;
}

function onMouseUp (data)
{
	mousePress = false;
}

function onMouseMove (data)
{
}

// http://stackoverflow.com/questions/17130395/canvas-html5-real-mouse-position
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

// Load Images
var assets = [ "assets/sprites.png", "assets/sprites.json"];
var loader = new PIXI.AssetLoader(assets);
loader.onComplete = onAssetsLoaded;
loader.load();