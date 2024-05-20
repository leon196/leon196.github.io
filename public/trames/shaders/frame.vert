#version 300 es
precision mediump float;

in vec3 position;
out vec2 uv;

void main()
{
	uv = position.xy*0.5+0.5;
	gl_Position = vec4(position, 1);
}