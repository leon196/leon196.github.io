
var text = {};

text.ctx = null;

text.makeText = function (message, font, fontSize, scale)
{
	font = font || "monospace";
	font = fontSize + "px " + font;
	scale = scale || 0.01;
	if (text.ctx === null) {
		text.ctx = document.createElement("canvas").getContext("2d");
	}
	var ctx = text.ctx;
	ctx.font = font;
	ctx.canvas.width  = Math.ceil(ctx.measureText(message).width) + 2;
	ctx.canvas.height = fontSize + 10;
	ctx.font = font;
	ctx.fillStyle = "white";
	ctx.textAlign = "center";
	ctx.textBaseline = "middle";
	ctx.fillText(message, ctx.canvas.width / 2 | 0, ctx.canvas.height / 2 | 0);

	return {
		texture: twgl.createTexture(gl, { src: ctx.canvas }),
		scale: [ctx.canvas.width * scale, ctx.canvas.height * scale, 1],
	};
};
