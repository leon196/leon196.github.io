var Letter = function(sprite) 
{
    PIXI.Sprite.call(this, sprite);
	this.anchor.x = this.anchor.y = 0.5;
	this.position.x = mouse.x;
	this.position.y = mouse.y;
	this.scale.x = this.scale.y = letterScaleMax;

	this.positionStart = this.position;
	this.angle = Math.random() * PI * 2.0;

    this.timeStart = timeElapsed;
    this.timeDelay = letterDelayMax;
    this.timeOut = false;

    this.shouldBeUpdated = true;

    this.animate = function ()
    {
    	// Logic
    	var timeRatio = animationRatio(this.timeStart, this.timeDelay, timeElapsed);
    	this.timeOut = timeRatio >= 1.0;

    	// Display
        var ratioPulse = 1.0 - smoothstep(0.0, 0.2, timeRatio);
        ratioPulse = Math.sin(ratioPulse * 10.0);
        var ratioScale = 1.0 - smoothstep(0.2, 1.0, timeRatio);
    	this.scale.x = letterScaleMax * ratioScale - ratioPulse * letterScaleMax;
        this.scale.y = letterScaleMax * ratioScale + ratioPulse * letterScaleMax;
    	this.rotation = Math.sin(timeRatio) * PI2 * 4.0;// * (1.0 - ratioScale);

    	//
		this.x = this.positionStart.x + Math.cos(this.angle) * timeRatio * letterRadiusSpray * this.scale.x;
		this.y = this.positionStart.y + Math.sin(this.angle) * timeRatio * letterRadiusSpray * this.scale.x;
    };

    this.Recycle = function()
    {

    };
};

Letter.prototype = Object.create(PIXI.Sprite.prototype);
Letter.prototype.constructor = Letter;