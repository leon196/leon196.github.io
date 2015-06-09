var Player = function(sprite) 
{
    PIXI.Sprite.call(this, sprite);

    this.scale.x = this.scale.y = 0.5;

    this.timeLastShot = 0;
    this.timeFireRate = playerFireRate;

    this.animate = function ()
    {
        if (mouse.x > window.innerWidth * 0.5 && this.scale.x > 0)
        {
            this.scale.x *= -1;
        }
        else if (mouse.x < window.innerWidth * 0.5 && this.scale.x < 0)
        {
            this.scale.x *= -1;
        }
    };
};

Player.prototype = Object.create(PIXI.Sprite.prototype);
Player.prototype.constructor = Player;