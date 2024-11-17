#version 300 es
precision mediump float;

in vec2 uv;
in vec2 id;
out vec4 fragColor;

void main()
{
    float dist = length(uv-.5);
    float shape = -dist+.5;//step(length(uv-.5)-.5, 0.);
    shape *= step(.1,dist);
    if (shape < .01) discard;
	fragColor = vec4(shape,id.y,dist,shape);
}