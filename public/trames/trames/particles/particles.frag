#version 300 es
precision mediump float;

in vec2 uv;
in vec2 id;
out vec4 fragColor;

uniform float r_pattern;

void main()
{
    bool circle = r_pattern == 0.;
    if (circle) {
        float dist = length(uv-.5);
        float shape = -dist+.5;
        if (shape < .01) discard;
    }
	fragColor = vec4(0);
}