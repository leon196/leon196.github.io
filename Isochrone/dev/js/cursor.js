Cursor.prototype = new Sprite();
function Cursor()
{
	Sprite.call(this);
	
	// Button ID
	this.number;

	// Path
	this.path;
	this.ratio;
	this.countDots;
	this.checkpoint;
	this.checkpointSprite;
	
	// Movement
	this.angle = 0;
	this.radius = 1;
	this.speed = 0;
	this.radiusSpeed;
	this.accelerator = 0;

	this.process;
	this.idle;

	this.init = function(num)
	{
		this.alpha = 0;
		this.number = num;
		this.ratio = 0;
		this.checkpoint = -1;
		this.path = {};

		// Setup acceleration or decceleration
		if (num < 2) {
			this.process = this.processDecceleration;
			this.idle = this.idleDecceleration;
		} else {
			this.process = this.processAcceleration;
			this.idle = this.idleAcceleration;
		}

		// Draw Checkpoint Sprite
		this.checkpointSprite = new Sprite();
		var g = this.checkpointSprite.graphics;
		g.beginFill(0x000000);
		g.drawCircle(0, 0, sizeCheckpoints * 1.5);
		g.beginFill(0xffffff);
		g.drawCircle(0, 0, sizeCheckpoints * 0.75);
		g.endFill();
		this.checkpointSprite.alpha = 0;
		stage.addChild(this.checkpointSprite);

		// Draw Cursor
		var colorBorder = 0xffffff;
		var colorDisk = 0x000000;
		var colorDot = 0xffffff;

		// Switch colors
		if (this.number > 1) {
			colorBorder = 0x000000;
			colorDisk = 0xffffff;
			colorDot = 0x000000;
		}

		// Edges
		this.graphics.beginFill(colorBorder);
		this.graphics.drawCircle(0, 0, radiusCursor);

		// Disk
		this.graphics.beginFill(colorDisk);
		this.graphics.drawCircle(0, 0, radiusCursor * 3/4);

		// Inner dot
		if (this.number == 1 || this.number == 3) {
			this.graphics.beginFill(colorDot);
			this.graphics.drawCircle(0, 0, radiusCursor * 1/4);
		}
	}

	this.setupPath = function(path)
	{
		this.path = path;
		this.countDots = path.countDots;
		this.radius = path.ratioRadius * radiusMax;
		this.radiusSpeed = this.radius / radiusMax;
		this.x = Math.cos(this.angle) * this.radius + width/2 + this.radius * this.path.anchorX;
		this.y = Math.sin(this.angle) * this.radius + height/2 + this.radius * this.path.anchorY;
		this.checkpointSprite.x = this.x;
		this.checkpointSprite.y = this.y;
	}

	this.debug = function(elapsed)
	{
		// Apply
		this.angle = (elapsed * pi * 2 / timeGlobal * speedDebug) % (pi * 2);
		this.x = Math.cos(this.angle) * this.radius + width/2 + this.radius * this.path.anchorX;
		this.y = Math.sin(this.angle) * this.radius + height/2 + this.radius * this.path.anchorY;

		// Checkpoints
		var checkpoint = Math.floor((this.angle + this.path.ratioAngle * pi * 2) / (pi * 2) * this.countDots);
		if (this.checkpoint != checkpoint) {
			this.checkpoint = checkpoint;
			var angle = this.checkpoint * pi * 2 / this.countDots - this.path.ratioAngle * pi * 2;
			this.checkpointSprite.x = Math.cos(angle) * this.radius + width/2 + this.radius * this.path.anchorX;
			this.checkpointSprite.y = Math.sin(angle) * this.radius + height/2 + this.radius * this.path.anchorY;
			PlaySound(this.checkpoint * 4 + this.number);
		}

		this.ratio = this.angle / (pi * 2);
	}

	this.update = function(elapsed)
	{
		// Controls
		if (keys[this.number].value === true) {
			this.process();
			this.scaleX = this.scaleY = 1.5;
		} else {
			this.idle();
			this.scaleX = this.scaleY = 1;
		}

		// Apply
		this.speed = (this.speed + this.accelerator) % (pi * 2);
		this.angle = (this.speed + elapsed * pi * 2 / timeGlobal / this.radiusSpeed) % (pi * 2);
		this.x = Math.cos(this.angle) * this.radius + width/2 + this.radius * this.path.anchorX;
		this.y = Math.sin(this.angle) * this.radius + height/2 + this.radius * this.path.anchorY;
		this.ratio = this.angle / (pi * 2);

		// Checkpoints
		var checkpoint = Math.floor((this.angle + this.path.ratioAngle * pi * 2) / (pi * 2) * this.countDots);
		if (this.checkpoint != checkpoint) {
			this.checkpoint = checkpoint;
			var angle = this.checkpoint * pi * 2 / this.countDots - this.path.ratioAngle * pi * 2;
			this.checkpointSprite.x = Math.cos(angle) * this.radius + width/2 + this.radius * this.path.anchorX;
			this.checkpointSprite.y = Math.sin(angle) * this.radius + height/2 + this.radius * this.path.anchorY;
			PlaySound(this.checkpoint * 4 + this.number);
		}
	}

	this.show = function(delay)
	{
		/*
		var onStart = function(cursor) { 
			cursor.alpha = 0; cursor.visible = true;
			cursor.checkpointSprite.alpha = 0; cursor.checkpointSprite.visible = true;
		};*/
		Tweener.addTween(this, {/*onStart:onStart, onStartParams:[this],*/ alpha:1, transition:"easeInSine", delay:delay, time:1});
		Tweener.addTween(this.checkpointSprite, {alpha:1, transition:"easeInSine", delay:delay, time:1});
	}

	this.hide = function(delay)
	{
		Tweener.addTween(this, {alpha:0, transition:"easeInSine", delay:delay, time:1});
		Tweener.addTween(this.checkpointSprite, {alpha:0, transition:"easeInSine", delay:delay, time:1});
	}

	this.processAcceleration = function()
	{
		this.accelerator = Math.max(minSpeed, Math.min(this.accelerator + acceleration, maxSpeed));
	}

	this.idleAcceleration = function()
	{
		this.accelerator = Math.max(minSpeed, Math.min(this.accelerator * decceleration, maxSpeed));
	}

	this.processDecceleration = function()
	{
		this.accelerator = Math.max(minSpeed, Math.min(this.accelerator - acceleration, maxSpeed));
	}

	this.idleDecceleration = function()
	{
		this.accelerator = Math.max(minSpeed, Math.min(this.accelerator * (2 - decceleration), maxSpeed));
	}
}