Level.prototype = new Sprite();
function Level()
{
	Sprite.call(this);
	this.paths = [];
	this.dots = [];
}

function LevelPath()
{
	this.anchorX;
	this.anchorY;
	this.countDots;
	this.ratioRadius;
	this.ratioAngle;
}

function LevelManager ()
{
    this.levels;
    this.background;
    this.triangles;

    this.currentLevel = 0;
    
    this.init = function() 
    {
    	//
    	this.triangles = new Sprite();
    	stage.addChild(this.triangles);

    	//
    	this.levels = [];
    	var levels = this.levels;

		// Generate from Json
    	$.getJSON("levels.json", function(json)
    	{
    		// Levels
		    var dataLevels = json["levels"]; 
    		for (var l = 0; l < dataLevels.length; l++)
    		{
    			// Setup Level
		    	var level = new Level();
		    	level.alpha = 0;
				stage.addChild(level);
				levels.push(level);
		    	var color = 0x000000;

    			// Setup Paths
    			var circles = dataLevels[l]["circles"];
			    for (var c = 0; c < circles.length; c++) {
			    	var circle = circles[c];
			    	var path = new LevelPath();
					path.anchorX = circle["anchorX"];
					path.anchorY = circle["anchorY"];
					path.countDots = circle["countDots"];
					path.ratioRadius = circle["ratioRadius"];
					path.ratioAngle = circle["ratioAngle"];
					level.paths.push(path);

					// Draw Dots
					var dots = new Sprite();
					dots.alpha = 0;
					stage.addChild(dots);
					level.dots.push(dots);
					var gd = dots.graphics;
					gd.lineStyle(0, color);
					for (var p = 0; p < path.countDots; p++) {
						var radius = radiusMax * path.ratioRadius;
						var rad = p / path.countDots * pi * 2 + pi * 2 * path.ratioAngle;
						gd.beginFill(color);
						gd.drawCircle(
							width/2 + Math.cos(rad) * radius + radius * path.anchorX,
							height/2 + Math.sin(rad) * radius + radius * path.anchorY,
							sizeCheckpoints);
						gd.endFill();
					}

					// Draw Circle
					var gl = level.graphics;
					gl.lineStyle(3, color);
					gl.drawCircle(
						width/2 + radius * path.anchorX,
						height/2 + radius * path.anchorY,
						radiusMax * path.ratioRadius);
				}
			}
		});
    };

    this.GetLevelPaths = function()
    {
    	return this.levels[this.currentLevel].paths;
    }

    this.showLevel = function(index, delay, onStart, onComplete) 
    {
    	this.currentLevel = index;
    	if (onStart == undefined) onStart = function(){};
    	if (onComplete == undefined) onComplete = function(){};
    	for (var l = 0; l < this.levels.length; l++) {
    		var level = this.levels[l];
    		// Current
    		if (l == index) {
    			// Show Level
    			var onUpdate = function(t) { Howler.volume(t); }
    			Tweener.addTween(level, {
    				alpha:1,
    				onStart:onStart, onUpdate:onUpdate, onComplete:onComplete,
    				transition:"easeInSine", delay:delay, time:1});
    			// Dots
    			for (var p = 0; p < level.paths.length; p++) {
    				var dots = level.dots[p];
	    			Tweener.addTween(dots, { alpha:1, transition:"easeInSine", delay:delay, time:1});
		    	}
    		}
    		// Next
    		else if (index + 1 < this.levels.length && l == index+1) {
    			var nextLevel = this.levels[index+1];
    			// Show Next Level
    			Tweener.addTween(nextLevel, {alpha:alphaLevelBackground, transition:"easeInSine", delay:delay, time:1});
    			// Dots
    			for (var p = 0; p < level.paths.length; p++) {
    				var dots = nextLevel.dots[p];
	    			Tweener.addTween(dots, { alpha:0, transition:"easeInSine", delay:delay, time:1});
		    	}
    		}
    		// Others
    		else {
    			// Hide Level
    			Tweener.addTween(level, {
    				alpha:0,
    				transition:"easeInSine", delay:delay, time:1});
    			// Hide Dots
    			for (var p = 0; p < level.paths.length; p++) {
    				var dots = level.dots[p];
	    			Tweener.addTween(dots, { alpha:0, transition:"easeInSine", delay:delay, time:1});
		    	}
    		}
	    }
    }

    this.drawBackground = function() 
    {
		this.background = new Sprite();
		this.background.alpha = 0;
		stage.addChild(this.background);
		var g = this.background.graphics;
		g.clear();
		for (var c = 0; c < countLines; c++) {
			var r = c / countLines * pi * 2;
			g.lineStyle(3, colorGrayLines);
			g.moveTo(width/2, height/2);
			g.lineTo(Math.cos(r) * screenMax + width/2, Math.sin(r) * screenMax + height/2);
		}
	}

    this.drawTriangles = function(tris) 
    {
		var g = this.triangles.graphics;
		g.clear();
		for (var c = 0; c < tris; c++) {
			var r = c / countLines * pi * 2;
			var rNext = (c+1) / countLines * pi * 2;
			g.beginFill(colorGrayTriangles);
			g.moveTo(width/2, height/2);
			g.lineTo(Math.cos(r) * screenMax + width/2, Math.sin(r) * screenMax + height/2);
			g.lineTo(Math.cos(rNext) * screenMax + width/2, Math.sin(rNext) * screenMax + height/2);
			g.endFill();
		}
	}

    this.hideTriangles = function() 
    {
    	Tweener.addTween(this.triangles, { alpha:0, transition:"easeInSine", time:1});
	}

    this.showTriangles = function() 
    {
    	Tweener.addTween(this.triangles, { alpha:1, transition:"easeInSine", time:1});
	}

	this.cleanTriangles = function()
	{
		var g = this.triangles.graphics;
		g.clear();
	}

    this.showBackground = function(delay)
    {
		Tweener.addTween(this.background, {alpha:1, transition:"easeInSine", delay:delay, time:1});
	}
}