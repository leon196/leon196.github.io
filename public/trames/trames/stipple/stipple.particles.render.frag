#version 300 es
precision mediump float;

in vec2 uv;
in vec2 id;
out vec4 fragColor;

uniform float particle_size;

void main()
{
    float dist = length(uv-.5);
    float shape = -dist+particle_size;
    if (shape < .01) discard;
	fragColor = vec4(1.);
}