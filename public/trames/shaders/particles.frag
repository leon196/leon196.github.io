#version 300 es
precision mediump float;

in vec2 uv;
out vec4 fragColor;

void main()
{
    float shape = step(length(uv-.5)-.5, 0.);
	fragColor = vec4(shape);
}