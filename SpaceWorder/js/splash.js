var Splash = function(sprite) 
{
    PIXI.Sprite.call(this, sprite);
    this.anchor.x = this.anchor.y = 0.5;
    this.timeStart = timeElapsed;
    this.timeDelay = 1.0;
    this.timeOut = false;

    this.rotation = Math.random() * PI2;
    this.scaleSeed = 1.0 + Math.random();
    this.scale.x = this.scale.y = this.scaleSeed;

    this.animate = function ()
    {
        // Logic
        var timeRatio = animationRatio(this.timeStart, this.timeDelay, timeElapsed);
        this.timeOut = timeRatio >= 1.0;

        var scaleRatio = 1.0 - smoothstep(0.2, 1.0, timeRatio);
        this.scale.x = this.scale.y = (this.scaleSeed + Math.sin((timeElapsed - this.timeStart) * 4.0)) * scaleRatio;

        this.alpha = 1.0 - timeRatio;
    };
};

Splash.prototype = Object.create(PIXI.Sprite.prototype);
Splash.prototype.constructor = Splash;