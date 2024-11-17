#version 300 es
precision mediump float;

in vec2 uv;
out vec4 fragColor;

uniform sampler2D image;

void main()
{
	fragColor = vec4(1.-texture(image, uv).b);
}