var Paper = function(sprite) 
{
    PIXI.Sprite.call(this, sprite);

	this.anchor.x = this.anchor.y = 0.5;
	this.scale.x = this.scale.y = 0.0;

	this.angle = Math.random() * PI * 2.0;
	this.positionWrited = vec2(0,0);

    this.timeStart = timeElapsed;
    this.timeDelay = paperDelayMax;
    this.timeOut = false;
    this.isWrited = false;

    this.margin = 0.75;
    this.bounds = {
    	x : this.x - this.width * 0.5 * this.margin,
    	y : this.y - this.height * 0.5 * this.margin,
    	w : this.width * this.margin,
    	h : this.height * this.margin
    };

    this.letters = [];

    this.animate = function ()
    {
    	// Logic
    	var timeRatio = animationRatio(this.timeStart, this.timeDelay, timeElapsed);
    	this.timeOut = timeRatio >= 1.0;

    	// Display
    	if (this.isWrited == false)
    	{
    		this.scale.x = paperScaleMax * timeRatio;
	        this.scale.y = paperScaleMax * timeRatio;

	        var distance = timeRatio * window.innerWidth;
			this.x = window.innerWidth * 0.5 + Math.cos(this.angle) * distance;
			this.y = window.innerHeight * 0.5 + Math.sin(this.angle) * distance;

		    this.bounds = {
		    	x : Math.max(this.x - this.width * 0.5 * this.margin, 1.0),
		    	y : Math.max(this.y - this.height * 0.5 * this.margin, 1.0),
		    	w : this.width * this.margin,
		    	h : this.height * this.margin
		    };
		}
		else
		{
			this.x += Math.cos(this.angle);
			this.y = mix(this.positionWrited.y, window.innerHeight + this.height, timeRatio);
		}
	};

    this.CollideWith = function (letter)
    {
    	return letter.x > this.bounds.x && letter.x < this.bounds.x + this.bounds.w && letter.y > this.bounds.y && letter.y < this.bounds.y + this.bounds.h;
    };

    this.AddLetter = function(letter)
    {
    	letter.position = this.toLocal(letter.position);
    	letter.scale.x = letter.scale.y = 1;
    	letter.rotation = 0;
    	this.addChild(letter);
    	this.letters.push(letter);
    	letter.shouldBeUpdated = false;

    	if (this.letters.length >= paperMaxLetter)
    	{
    		this.isWrited = true;
    		this.timeStart = timeElapsed;
    		this.timeDelay = 10.0;
    		this.positionWrited = this.position;
    	}
    };

    this.Recycle = function()
    {
		for (var l = this.letters.length - 1; l >= 0; --l)
		{
			var letter = this.letters[l];
			letter.timeOut = true;
		}
    };
};

Paper.prototype = Object.create(PIXI.Sprite.prototype);
Paper.prototype.constructor = Paper;